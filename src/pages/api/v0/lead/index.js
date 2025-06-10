import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../utils/checkPermission"; // ✅ import checkPermission function

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

// ✅ Middleware Wrapper for Authentication
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Main Handler Without Authentication (for testing)
const handler = async (req, res) => {
  await dbConnect();

  // Skip authentication for testing
  // const loggedInEmployee = req.employee;
  // const roleId = loggedInEmployee?.role;

  // if (!loggedInEmployee || !roleId) {
  //   return res.status(401).json({ success: false, message: "Unauthorized" });
  // }

  // 🔒 READ Operation
  if (req.method === "GET") {
    // Skip permission check for testing
    // const hasAccess = await checkPermission(roleId, "read", "lead");
    // if (!hasAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have READ access to leads",
    //   });
    // }
    return getAllLeads(req, res);
  }

  // ✏️ WRITE Operation
  if (req.method === "POST") {
    // Skip permission check for testing
    // const hasAccess = await checkPermission(roleId, "write", "lead");
    // if (!hasAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have WRITE access to leads",
    //   });
    // }
    return createLead(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

// Export handler directly without authentication middleware for testing
export default handler;
