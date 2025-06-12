import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import { verifyToken } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../middlewares/permissions";

// ✅ Create Lead (WRITE Access Required)
const createLead = async (req, res) => {
  try {
    console.log("📧 Received lead data:", JSON.stringify(req.body, null, 2));

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
      console.log("❌ Validation failed:", {
        leadId,
        fullName,
        phone,
        propertyType,
      });
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    } // Parse and validate nextFollowUp date if provided
    let parsedNextFollowUp = null;
    if (nextFollowUp) {
      try {
        parsedNextFollowUp = new Date(nextFollowUp);
        if (isNaN(parsedNextFollowUp.getTime())) {
          parsedNextFollowUp = null;
        }
      } catch (dateError) {
        console.log(
          "Invalid nextFollowUp date:",
          nextFollowUp,
          dateError.message
        );
        parsedNextFollowUp = null;
      }
    }

    // Validate phone number format (only digits, 10-15 characters)
    if (phone && !/^\d{10,15}$/.test(phone)) {
      console.log("❌ Invalid phone format:", phone);
      return res
        .status(400)
        .json({
          success: false,
          message: "Phone number must contain only digits (10-15 characters)",
        });
    }

    console.log("✅ Creating lead with data:", {
      leadId,
      fullName,
      email: email || "none",
      phone,
      propertyType,
      location: location || "none",
      budgetRange: budgetRange || "none",
      status,
      source: source || "none",
      assignedTo: assignedTo || "none",
      followUpNotes: followUpNotes || [],
      nextFollowUp: parsedNextFollowUp,
    });
    const newLead = new Lead({
      leadId,
      fullName: fullName?.trim(),
      email: email && email.trim() ? email.trim() : undefined, // Don't save empty emails
      phone: phone?.trim(),
      propertyType,
      location: location && location.trim() ? location.trim() : undefined,
      budgetRange:
        budgetRange && budgetRange.trim() ? budgetRange.trim() : undefined,
      status,
      source: source && source.trim() ? source.trim() : undefined,
      assignedTo:
        assignedTo && assignedTo.trim() ? assignedTo.trim() : undefined,
      followUpNotes: followUpNotes || [],
      nextFollowUp: parsedNextFollowUp,
    });
    await newLead.save();

    console.log("✅ Lead created successfully:", newLead._id);
    return res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    console.error("❌ Error creating lead:", error);

    // Handle MongoDB validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
        error: error.message,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Lead ID already exists",
        error: error.message,
      });
    }

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
