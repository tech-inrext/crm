import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { userAuth } from "@/middlewares/auth";

async function handler(req, res) {
  await dbConnect();
  try {
    const loggedInUserId = req.employee?._id;
    if (!loggedInUserId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Find employees whose managerId matches logged-in user
    // Also return their team name (if available)
    const users = await Employee.find(
      { managerId: loggedInUserId },
      { _id: 1, name: 1, teamName: 1 }
    ).lean();
    return res.status(200).json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
