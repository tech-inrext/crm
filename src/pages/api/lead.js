import dbConnect from "../../lib/mongodb";
import Lead from "../../models/Lead";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'POST') {
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

      // Basic validation (can be extended)
      if (!leadId || !fullName || !phone || !propertyType) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
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
      console.error('Error creating lead:', error.message);
      res.status(500).json({ success: false, message: 'Internal Server Error', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
