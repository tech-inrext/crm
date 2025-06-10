import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../utils/checkPermission"; // ✅ Utility function to check permissions

// ✅ GET handler – Fetch a single Lead by ID
const getLeadById = async (req, res) => {
  const { id } = req.query;

  try {
    const lead = await Lead.findById(id); // Fetch lead
    if (!lead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error: " + error.message });
  }
};

// ✅ PATCH handler – Update lead details with restricted field control
const updateLeadDetails = async (req, res) => {
  const { id } = req.query;
  const { fullName, status, followUpNotes } = req.body;

  try {
    // ❌ Disallowed fields – cannot be updated
    const notAllowedFields = ["phone", "email"];
    const attemptedFields = Object.keys(req.body);
    const invalidFields = attemptedFields.filter((field) =>
      notAllowedFields.includes(field)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `You are not allowed to update these field(s): ${invalidFields.join(
          ", "
        )}`,
      });
    }

    // ✅ Only allowed fields are picked for update
    const updateFields = {
      ...(fullName && { fullName }),
      ...(status && { status }),
      ...(followUpNotes && { followUpNotes }),
    };

    // Update the lead and return the updated document
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedLead) {
      return res.status(404).json({ success: false, error: "Lead not found" });
    }

    return res.status(200).json({ success: true, data: updatedLead });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

// ✅ Middleware to ensure user is authenticated using cookies
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;

    // userAuth will add `req.employee` if auth succeeds
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Final handler without authentication (for testing)
const handler = async (req, res) => {
  await dbConnect(); // Connect to DB

  // Skip authentication for testing
  // const loggedInEmployee = req.employee;
  // const roleId = loggedInEmployee?.role;

  // if (!loggedInEmployee || !roleId) {
  //   return res.status(401).json({ success: false, message: "Unauthorized" });
  // }

  // 🔐 Read Access
  if (req.method === "GET") {
    // Skip permission check for testing
    // const hasReadAccess = await checkPermission(roleId, "read", "lead");
    // if (!hasReadAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have READ access to this resource",
    //   });
    // }
    return getLeadById(req, res);
  }
  // 🔐 Write Access
  if (req.method === "PATCH") {
    // Skip permission check for testing
    // const hasWriteAccess = await checkPermission(roleId, "write", "lead");
    // if (!hasWriteAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have WRITE access to this resource",
    //   });
    // }
    return updateLeadDetails(req, res);
  }

  // 🔐 Delete Access
  if (req.method === "DELETE") {
    // Skip permission check for testing
    // const hasDeleteAccess = await checkPermission(roleId, "delete", "lead");
    // if (!hasDeleteAccess) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "You do not have DELETE access to this resource",
    //   });
    // }
    return deleteLeadById(req, res);
  }

  // ❌ Unsupported method
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

// Export handler directly without authentication middleware for testing
export default handler;
