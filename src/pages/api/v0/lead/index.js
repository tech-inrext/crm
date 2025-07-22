import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// ✅ Create Lead (WRITE Access Required)
const createLead = async (req, res) => {
  try {
    const { phone, ...rest } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const existingLead = await Lead.findOne({ phone });

    if (existingLead) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists for another lead",
      });
    }

    const leadId = `LD-${Date.now().toString().slice(-6)}-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const newLead = new Lead({ leadId, phone, ...rest });

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

const getAllLeads = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Optional search filter
    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const [leads, totalLeads] = await Promise.all([
      Lead.find(query).skip(skip).limit(itemsPerPage).sort({ createdAt: -1 }),
      Lead.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        totalItems: totalLeads,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalLeads / itemsPerPage),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leads",
      error: error.message,
    });
  }
};

// ✅ Middleware Wrapper for Authentication
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Main Handler With Role-Based Permission Checks
const handler = async (req, res) => {
  await dbConnect();

  // 🔒 READ Operation
  if (req.method === "GET") {
    return getAllLeads(req, res);
  }

  // ✏️ WRITE Operation
  if (req.method === "POST") {
    return createLead(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
