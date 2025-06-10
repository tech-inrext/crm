import jwt from "jsonwebtoken";
import Role from "../models/Role"
import Employee from "../models/Employee";
import dbConnect from "../lib/mongodb";

export async function userAuth (req, res, next){
  try {
    await dbConnect();
    const { token } = req.cookies;
    // console.log("hello",token)
    // console.log("hellooo",req.cookies)

    if (!token) {
      throw new Error("Token is not valid");
    }

    const decodeObj = jwt.verify(token, "rahul@123");
    const { _id } = decodeObj;
    console.log("hello",decodeObj)

    const employee = await Employee.findById(_id);
    if (!employee) {
      throw new Error("User not found");
    }

    req.employee = employee;
    console.log("emp ",req.employee)
    next();
  } catch (err) {
    res.status(400).json({ message: "Auth Error: " + err.message });
  }
};
