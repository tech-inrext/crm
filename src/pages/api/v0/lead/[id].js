// get method
// post method
// patch method

import dbConnect from "../../../../lib/mongodb";
import Lead from "../../../../models/Lead";

const getLeadById = async (req, res) => {
  const { id } = req.query;

  try {
    const lead = await Lead.findById(id)
    if (!lead) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }
    return res.status(200).json({ success: true, data: lead });
  } catch (error) {
    console.error("Error fetching lead:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error: " + error.message });
  }
};

const updateLeadDetails = async (req, res) => {
  try {
    const {
      fullName,
      status,
      followUpNotes
    } = req.body;

    const { id } = req.query;

    const notAllowedFields = ["phone", "email"];
    const requestFields = Object.keys(req.body);

    // Get the list of not allowed fields user tried to send
    const invalidFields = requestFields.filter((field) =>
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

    // Filter the update fields
    const updateFields = {
      ...(fullName && { fullName }),
      ...(status && { status }),
      ...(followUpNotes && { followUpNotes })
    };

    const updateLead = await Lead.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    )

    if (!updateLead) {
      return res
        .status(404)
        .json({ success: false, error: "Lead not found" });
    }

    return res.status(200).json({ success: true, data: updateLead });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    getLeadById(req, res);
  } else if (req.method === "PATCH") {
    updateLeadDetails(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }
}
