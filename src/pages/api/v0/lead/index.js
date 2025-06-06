import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";

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

    console.log("lead created");
    // Basic validation (can be extended)
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

    res.status(201).json({ success: true, data: newLead });
  } catch (error) {
    // console.error("Error creating lead:", error.message);
    res.status(500).json({
      success: false,
      message: "Error creating lead:",
      error: error.message,
    });
  }
};

const getAllLeads = async (req, res) => {
  try {
    const allLeads = await Lead.find({});
    return res.status(200).json({ success: true, data: allLeads });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch roles",
      error: error.message,
    });
  }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    return createLead(req, res);
  } else if (req.method === "GET") {
    return getAllLeads(req, res);
  } else {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
