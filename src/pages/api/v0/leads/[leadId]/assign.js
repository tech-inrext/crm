import dbConnect from "@/lib/mongodb";
import Lead from "@/be/models/Lead";

export default async function handler(req, res) {
  if (req.method !== "PUT") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { leadId } = req.query;
  const { assignedTo } = req.body;

  if (!leadId || !assignedTo) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    await dbConnect();

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    lead.assignedTo = assignedTo;
    await lead.save();

    return res.status(200).json({ success: true, message: "Lead assignment updated" });
  } catch (error) {
    console.error("Error updating lead assignment:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}