// pages/api/user.js
import dbConnect from "../../lib/mongodb";
// import Employee from "../../models/Employee";
import User from "../../models/Employee";
import Role from "../../models/Role"
import Employee from "../../models/Employee1";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "GET") {
    try {
      const { email } = req.body;
      const user = await Employee.find({ email: email }).populate("role",["_id","name","read","write","delete"]);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}
