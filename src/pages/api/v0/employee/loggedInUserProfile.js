import dbConnect from "../../../../lib/mongodb";
import { userAuth } from "../../../../middlewares/auth";

// More robust cookie import for deployment
let cookie;
try {
  cookie = require("cookie");
} catch (err) {
  console.error("Failed to import cookie package:", err);
}

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
  // Robust cookie parsing for deployment
  let parsedCookies = {};
  try {
    if (cookie && cookie.parse) {
      parsedCookies = cookie.parse(req.headers.cookie || "");
    } else {
      // Fallback: manual cookie parsing
      const cookieHeader = req.headers.cookie || "";
      const cookies = cookieHeader.split(";");
      for (let cookieItem of cookies) {
        const [name, value] = cookieItem.trim().split("=");
        if (name && value) {
          parsedCookies[name] = value;
        }
      }
    }
  } catch (cookieError) {
    console.error("Cookie parsing error:", cookieError);
    parsedCookies = {};
  }

  req.cookies = parsedCookies;

  await userAuth(req, res, () => getProfile(req, res));
}
