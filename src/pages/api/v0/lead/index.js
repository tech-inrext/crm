import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";
import { verifyToken } from "../../../../middlewares/auth";
import { checkPermission } from "../../../../middlewares/permissions";
import {
  transformFormToAPI,
  validateLeadData,
} from "../../../../utils/leadUtils";

/**
 * @typedef {import('../../../../types/lead').Lead} Lead
 * @typedef {import('../../../../types/lead').LeadAPIResponse} LeadAPIResponse
 * @typedef {import('../../../../types/lead').PropertyType} PropertyType
 * @typedef {import('../../../../types/lead').LeadStatus} LeadStatus
 */

// ✅ Create Lead (WRITE Access Required)
const createLead = async (req, res) => {
  try {
    console.log("📧 Received lead data:", JSON.stringify(req.body, null, 2));

    // Use backend validation utility
    const validationResult = validateLeadData(req.body);
    if (!validationResult.isValid) {
      console.log("❌ Validation failed:", validationResult.errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationResult.errors,
      });
    }

    // Transform form data to API format using backend utility
    const leadData = transformFormToAPI(req.body, req.body.leadId);

    console.log("✅ Creating lead with transformed data:", leadData);

    const newLead = new Lead(leadData);
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
