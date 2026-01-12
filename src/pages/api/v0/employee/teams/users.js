
import dbConnect from "@/lib/mongodb";
import { userAuth } from "@/middlewares/auth";
import { getUsersWithStats } from "@/be/services/users";


async function handler(req, res) {
  await dbConnect();
  try {
    let managerId = req.query.managerId || req.employee?._id;
    if (!managerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (Array.isArray(managerId)) managerId = managerId[0];
    const { users, mous, initialStats } = await getUsersWithStats(managerId);
    return res.status(200).json({ success: true, users, mous, initialStats });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export default (req, res) => userAuth(req, res, handler);
