import jwt from "jsonwebtoken";
import Employee from "../be/models/Employee";
import Role from "../be/models/Role";
import dbConnect from "../lib/mongodb";

export async function loginAuth (req, res, next){
  try {
    await dbConnect();
    const { token } = req.cookies;

    if (!token) {
      throw new Error("Token is not valid");
    }

    const decodeObj = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, roleId } = decodeObj;

    const employee = await Employee.findById(_id).populate("roles");
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    req.employee = employee;
    req.roleId = roleId;
    next();
  } catch (err) {
    res.status(400).json({ message: "Auth Error: " + err.message });
  }
};