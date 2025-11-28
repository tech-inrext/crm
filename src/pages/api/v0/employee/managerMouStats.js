import dbConnect from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import { userAuth } from "../../../../middlewares/auth";
import * as cookie from "cookie";

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

const getManagerMouStats = async (req, res) => {
  try {
    await dbConnect();
    const loggedInId = req.employee?._id?.toString?.() || req.user?._id?.toString?.() || "";
    if (!loggedInId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    // Only employees whose managerId is loggedInId
    const pendingCount = await Employee.countDocuments({ managerId: loggedInId, mouStatus: { $regex: "^Pending$", $options: "i" } });
    const completedCount = await Employee.countDocuments({ managerId: loggedInId, mouStatus: { $regex: "^Completed$", $options: "i" } });
    return res.status(200).json({
      success: true,
      pending: pendingCount,
      completed: completedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch MoU stats for manager",
      error: error.message,
    });
  }
};

export default withAuth(getManagerMouStats);
