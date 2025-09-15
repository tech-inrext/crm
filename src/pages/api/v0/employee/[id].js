import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// GET: fetch employee by id
const getEmployeeById = async (req, res) => {
  const { id } = req.query;
  try {
    const employee = await Employee.findById(id).populate("roles");
    if (!employee) return res.status(404).json({ success: false, error: "Employee not found" });
    return res.status(200).json({ success: true, data: employee });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// PATCH: update allowed fields
const updateEmployeeDetails = async (req, res) => {
  const { id } = req.query;
  console.debug("[employee:patch] incoming body:", req.body);
  const {
    name,
    altPhone,
    address,
    gender,
    age,
    designation,
    managerId,
    departmentId,
    roles,
    aadharUrl,
    panUrl,
    bankProofUrl,
    signatureUrl,
    nominee,
    slabPercentage,
    branch,
  } = req.body;
  console.debug("[employee:patch] slabPercentage, branch:", slabPercentage, branch);

  const notAllowedFields = ["phone", "email", "joiningDate"];
  const requestFields = Object.keys(req.body || {});
  const invalidFields = requestFields.filter((f) => notAllowedFields.includes(f));
  if (invalidFields.length > 0) {
    return res.status(400).json({ success: false, message: `You are not allowed to update these field(s): ${invalidFields.join(", ")}` });
  }

  // Build updateFields by checking property presence so empty strings/nulls
  // in the request can be used to clear existing values.
  const updateFields = {};

  const setIfPresent = (key, val) => {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      updateFields[key] = val;
    }
  };

  setIfPresent('name', name);
  setIfPresent('altPhone', altPhone);
  setIfPresent('address', address);
  setIfPresent('gender', gender);
  // allow clearing age by sending null
  if (Object.prototype.hasOwnProperty.call(req.body, 'age')) {
    updateFields.age = age;
  }
  setIfPresent('designation', designation);
  setIfPresent('managerId', managerId);
  setIfPresent('departmentId', departmentId);
  if (Object.prototype.hasOwnProperty.call(req.body, 'roles')) {
    updateFields.roles = Array.isArray(roles) ? roles : [];
  }
  setIfPresent('aadharUrl', aadharUrl);
  setIfPresent('panUrl', panUrl);
  setIfPresent('bankProofUrl', bankProofUrl);
  setIfPresent('signatureUrl', signatureUrl);
  // nominee can be an object; allow clearing by sending null/empty object
  if (Object.prototype.hasOwnProperty.call(req.body, 'nominee')) {
    updateFields.nominee = nominee;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'slabPercentage')) {
    updateFields.slabPercentage = slabPercentage;
  }
  if (Object.prototype.hasOwnProperty.call(req.body, 'branch')) {
    updateFields.branch = branch;
  }

  try {
    const updated = await Employee.findByIdAndUpdate(id, updateFields, { new: true }).populate('roles');
    if (!updated) return res.status(404).json({ success: false, error: 'Employee not found' });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(400).json({ success: false, error: err.message });
  }
};

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

const handler = async (req, res) => {
  await dbConnect();
  if (req.method === "GET") return getEmployeeById(req, res);
  if (req.method === "PATCH") return updateEmployeeDetails(req, res);
  return res.status(405).json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
 
