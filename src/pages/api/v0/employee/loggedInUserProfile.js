import dbConnect from "../../../../lib/mongodb";
import { loginAuth } from "../../../../middlewares/loginAuth";
import * as cookie from "cookie";

async function getProfile(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    const user = req.employee;

    // You may customize what fields to return
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles || [],
        gender: user.gender,
        address: user.address,
        designation: user.designation,
        departmentId: user.departmentId,
        managerId: user.managerId,
        joiningDate: user.joiningDate,
        currentRole: req.roleId,
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

  await loginAuth(req, res, () => getProfile(req, res));
}
