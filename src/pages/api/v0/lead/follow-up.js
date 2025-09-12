import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";
import Employee from "../../../../models/Employee";
// Using embedded followUpNotes on Lead as single source of truth; no LeadFollowUp model required here

// Helper: try to find a lead by various normalized forms of an identifier
async function findLeadByIdentifier(identifier) {
  if (!identifier) return null;
  const invisibleRegex = /[\u200B\uFEFF\u201A\u2018\u2019\u201C\u201D]/g;
  const normalized = (identifier || "").replace(invisibleRegex, "").trim();

  const escapeForRe = (s) => s.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");

  // Try exact matches (raw and normalized) and _id
  try {
    const byExact = await Lead.findOne({
      $or: [{ leadId: identifier }, { leadId: normalized }, { _id: identifier }, { _id: normalized }],
    }).lean();
    if (byExact) return byExact;
  } catch (e) {
    // ignore
  }

  // Edge-stripped regex
  try {
    const edgeStripped = normalized.replace(/^[\s\p{P}\p{S}]+|[\s\p{P}\p{S}]+$/gu, "");
    if (edgeStripped) {
      try {
        const esc = escapeForRe(edgeStripped);
        const byEdge = await Lead.findOne({ leadId: { $regex: esc, $options: "i" } }).lean();
        if (byEdge) return byEdge;
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }

  // Flexible unicode-normalized pattern
  try {
    const norm = normalized.normalize ? normalized.normalize("NFKC") : normalized;
    const base = norm.replace(/[^\p{L}\p{N}]+/gu, "");
    if (base && base.length >= 3) {
      const pattern = base.split("").map((ch) => `${escapeForRe(ch)}[\\W_]*`).join("");
      try {
        const byFlex = await Lead.findOne({ leadId: { $regex: pattern, $options: "iu" } }).lean();
        if (byFlex) return byFlex;
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }

  return null;
}

async function createFollowUp(req, res) {
  try {
    const { leadIdentifier, note } = req.body;
    if (!leadIdentifier || !note || !note.trim()) {
      return res.status(400).json({ success: false, message: "leadIdentifier and note are required" });
    }
    const submittedByName = req.employee?.name || "";

    let leadDoc = null;
    try {
      leadDoc = await findLeadByIdentifier(leadIdentifier);
    } catch (err) {
      // ignore
    }

    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${submittedByName ? submittedByName + ": " : ""}${note.trim()}`;

    if (leadDoc) {
      try {
        await Lead.findByIdAndUpdate(leadDoc._id, { $push: { followUpNotes: entry } });
        // follow-up appended to lead.followUpNotes (single source of truth)
      } catch (err) {
        return res.status(500).json({ success: false, message: "Failed to append follow-up to lead", error: err.message });
      }
    }

    const parsed = { createdAt: timestamp, submittedByName, note: note.trim(), raw: entry };
    return res.status(201).json({ success: true, data: parsed });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to save follow-up", error: error.message });
  }
}

async function getFollowUps(req, res) {
  try {
    const { leadIdentifier } = req.query;
  // leadIdentifier -> (hidden)
    if (!leadIdentifier) return res.status(400).json({ success: false, message: "leadIdentifier query param required" });

    // Try to resolve lead
    let leadDoc = null;
    try {
      leadDoc = await findLeadByIdentifier(leadIdentifier);
    } catch (e) {
      // ignore
    }

  // resolved leadDoc info omitted from logs

    // Diagnostic: sample leads if not found
    if (!leadDoc) {
      try {
        const numericPartMatch = (leadIdentifier || "").match(/(\d{3,})/);
        const samplePattern = numericPartMatch ? numericPartMatch[1] : (leadIdentifier || "").slice(0, 6);
        if (samplePattern) {
          const sampleLeads = await Lead.find({ leadId: { $regex: samplePattern, $options: "i" } }).limit(6).lean();
          // diagnostic sampleLeads count omitted
        }
      } catch (e) {
        // diagnostic query failed
      }
    }

    // Collect follow-ups from lead.followUpNotes
    const itemsFromLead = [];
    if (leadDoc && Array.isArray(leadDoc.followUpNotes)) {
      const notesArr = leadDoc.followUpNotes.slice();
      notesArr.reverse().forEach((raw, idx) => {
        const m = raw.match(/^\[(.+?)\]\s*(?:([^:]+):\s*)?(.*)$/);
        const createdAt = m ? m[1] : null;
        const submittedByName = m && m[2] ? m[2] : "";
        const note = m ? m[3] : raw;
        const _id = `${leadDoc._id}-${idx}`;
        itemsFromLead.push({ _id, createdAt, submittedByName, note, raw });
      });
    }

    // Use only embedded `lead.followUpNotes` as source of truth
    const allItems = itemsFromLead;
    allItems.sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return tb - ta;
    });

  // returning items count omitted
    return res.status(200).json({ success: true, data: allItems });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function withAuthOnly(handler) {
  return async (req, res) => {
    try {
      const parsedCookies = cookie.parse(req.headers.cookie || "");
      req.cookies = parsedCookies;

      const token = parsedCookies.token;
      if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { _id } = decoded || {};
      if (!_id) return res.status(401).json({ success: false, message: "Unauthorized" });

      await dbConnect();
      const employee = await Employee.findById(_id);
      if (!employee) return res.status(401).json({ success: false, message: "Unauthorized" });

      req.employee = employee;
      return handler(req, res);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Auth Error: " + err.message });
    }
  };
}

const handler = async (req, res) => {
  await dbConnect();
  if (req.method === "POST") return createFollowUp(req, res);
  if (req.method === "GET") return getFollowUps(req, res);
  return res.status(405).json({ success: false, message: "Method not allowed" });
};

export default withAuthOnly(handler);
