import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

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
  const { phone, ...updateFields } = req.body;

  try {
    // if (phone) {
    //   return res.status(409).json({
    //     success: false,
    //     message: "Phone number is not allowed to change",
    //   });
    // }

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

// ✅ Final handler with Role-based Permission Check
const handler = async (req, res) => {
  await dbConnect(); // Connect to DB

  // 🔐 Read Access
  if (req.method === "GET") {
    return getLeadById(req, res);
  }

  // 🔐 Write Access
  if (req.method === "PATCH") {
    return updateLeadDetails(req, res);
  }

  // ❌ Unsupported method
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default withAuth(handler);
