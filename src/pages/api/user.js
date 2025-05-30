import dbConnect from "../../lib/mongodb";
import User from "../../models/User";
import Employee from "../../models/Employee"; // ✅ Import Employee

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { name, email, phone, address, gender, designation } = req.body;

      let newUser;
      

      if (designation) {
        // ✅ Save as Employee
        newUser = new Employee({
          name,
          email,
          phone,
          address,
          gender,
          designation,
        });
      } else {
        // ✅ Save as regular User
        newUser = new User({
          name,
          email,
          phone,
          address,
          gender,
        });
      }

      await newUser.save();

      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      res.status(400).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: "Method not allowed" });
  }
}
