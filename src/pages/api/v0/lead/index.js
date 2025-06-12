import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import { verifyToken } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../middlewares/permissions";

// ✅ Create Lead (WRITE Access Required)
const createLead = async (req, res) => {
  try {
    const {
      leadId,
      fullName,
      email,
      phone,
      propertyType,
      location,
      budgetRange,
      status,
      source,
      assignedTo,
      followUpNotes,
      nextFollowUp,
    } = req.body;

    // Basic validation
    if (!leadId || !fullName || !phone || !propertyType) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newLead = new Lead({
      leadId,
      fullName,
      email,
      phone,
      propertyType,
      location,
      budgetRange,
      status,
      source,
      assignedTo,
      followUpNotes,
      nextFollowUp,
    });

    await newLead.save();

    return res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating lead",
      error: error.message,
    });
  }
};

// ✅ Get All Leads (READ Access Required)
const getAllLeads = async (req, res) => {
  try {
    const allLeads = await Lead.find({});
    return res.status(200).json({ success: true, data: allLeads });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

// ✅ Main Handler With Role-Based Permission Checks
const handler = async (req, res) => {
  await dbConnect();

  // Apply authentication middleware
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // 🔒 READ Operation
  if (req.method === "GET") {
    return new Promise((resolve, reject) => {
      checkPermission("lead", "read")(req, res, (err) => {
        if (err) reject(err);
        else {
          getAllLeads(req, res);
          resolve();
        }
      });
    });
  }

  // ✏️ WRITE Operation
  if (req.method === "POST") {
    return new Promise((resolve, reject) => {
      checkPermission("lead", "write")(req, res, (err) => {
        if (err) reject(err);
        else {
          createLead(req, res);
          resolve();
        }
      });
    });
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

// Export handler with authentication and permission middleware
export default handler;
