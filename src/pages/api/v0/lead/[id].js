import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import { verifyToken } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../middlewares/permissions";

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
    // const notAllowedFields = ["phone", "email"];
    // const attemptedFields = Object.keys(req.body);
    // const invalidFields = attemptedFields.filter((field) =>
    //   notAllowedFields.includes(field)
    // );

    // if (invalidFields.length > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `You are not allowed to update these field(s): ${invalidFields.join(
    //       ", "
    //     )}`,
    //   });
    // }

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

// ✅ DELETE handler – Delete lead by ID
const deleteLead = async (req, res) => {
  const { id } = req.query;

  try {
    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        error: "Lead not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
      data: lead,
    });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return res.status(500).json({
      success: false,
      error: "Server Error: " + error.message,
    });
  }
};

// ✅ Final handler with Role-based Permission Check
const handler = async (req, res) => {
  await dbConnect(); // Connect to DB

  // Apply authentication middleware
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  // 🔐 Read Access
  if (req.method === "GET") {
    return new Promise((resolve, reject) => {
      checkPermission("lead", "read")(req, res, (err) => {
        if (err) reject(err);
        else {
          getLeadById(req, res);
          resolve();
        }
      });
    });
  }

  // 🔐 Write Access
  if (req.method === "PATCH") {
    return new Promise((resolve, reject) => {
      checkPermission("lead", "write")(req, res, (err) => {
        if (err) reject(err);
        else {
          updateLeadDetails(req, res);
          resolve();
        }
      });
    });
  }

  // 🔐 Delete Access
  if (req.method === "DELETE") {
    return new Promise((resolve, reject) => {
      checkPermission("lead", "delete")(req, res, (err) => {
        if (err) reject(err);
        else {
          deleteLead(req, res);
          resolve();
        }
      });
    });
  }

  // ❌ Unsupported method
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

// Export handler with authentication and permission middleware
export default handler;
