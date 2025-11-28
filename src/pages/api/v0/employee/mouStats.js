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

const getMouStats = async (req, res) => {
  try {
    await dbConnect();
    const pendingCount = await Employee.countDocuments({ mouStatus: { $regex: "^Pending$", $options: "i" } });
    const completedCount = await Employee.countDocuments({ mouStatus: { $regex: "^Completed$", $options: "i" } });
    return res.status(200).json({
      success: true,
      pending: pendingCount,
      completed: completedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch MoU stats",
      error: error.message,
    });
  }
};

export default withAuth(getMouStats);
