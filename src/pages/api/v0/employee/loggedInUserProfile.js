import dbConnect from "../../../../lib/mongodb";
import { userAuth } from "../../../../middlewares/auth";
import cookie from "cookie";

async function getProfile(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }
  try {
    const user = req.employee;

    // Determine available roles and current role
    const userRoles =
      user.roles && user.roles.length > 0 ? user.roles : [user.role];
    const currentRole = user.currentRole || user.role;

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        roles: userRoles,
        currentRole: currentRole,
        gender: user.gender,
        address: user.address,
        designation: user.designation,
        departmentId: user.departmentId,
        managerId: user.managerId,
        joiningDate: user.joiningDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
}

export default async function handler(req, res) {
  const parsedCookies = cookie.parse(req.headers.cookie || "");
  req.cookies = parsedCookies;

  await userAuth(req, res, () => getProfile(req, res));
}
