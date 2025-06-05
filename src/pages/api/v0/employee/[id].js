// get method
// post method
// patch method

import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";

const getEmployeeById = async (req, res) => {
  const { id } = req.query;

  try {
    const employee = await Employee.findById(id).populate("role", [
      "_id",
      "name",
      "read",
      "write",
      "delete",
    ]);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }
    return res.status(200).json({ success: true, data: employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res
      .status(500)
      .json({ success: false, error: "Server Error: " + error.message });
  }
};

const updateEmployeeDetails = async (req, res) => {
  try {
    const {
      name,
      altPhone,
      address,
      gender,
      age,
      designation,
      managerId,
      role,
    } = req.body;

    const { id } = req.query;

    const notAllowedFields = ["phone", "email", "joiningDate", "departmentId"];
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
      ...(name && { name }),
      ...(altPhone && { altPhone }),
      ...(address && { address }),
      ...(gender && { gender }),
      ...(age && { age }),
      ...(designation && { designation }),
      ...(managerId && { managerId }),
      ...(role && { role }),
    };

    const updatedEmployee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true }
    ).populate("role");

    if (!updatedEmployee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    return res.status(200).json({ success: true, data: updatedEmployee });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    getEmployeeById(req, res);
  } else if (req.method === "PATCH") {
    updateEmployeeDetails(req, res);
  } else {
    return res
      .status(405)
      .json({ success: false, error: "Method Not Allowed" });
  }
}
