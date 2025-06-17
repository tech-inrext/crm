import dbConnect from "../../../../lib/mongodb";
import { verifyToken } from "../../../../middlewares/auth";

// More robust cookie import for deployment
let cookie;
try {
  cookie = require("cookie");
} catch (err) {
  console.error("Failed to import cookie package:", err);
}

const handler = async (req, res) => {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }
  // Parse cookies from headers with fallback
  let parsedCookies = {};
  try {
    if (cookie && cookie.parse) {
      parsedCookies = cookie.parse(req.headers.cookie || "");
      console.log("Cookie parsed using cookie package");
    } else {
      // Fallback manual cookie parsing
      const cookieHeader = req.headers.cookie || "";
      if (cookieHeader) {
        parsedCookies = Object.fromEntries(
          cookieHeader.split(';').map(c => {
            const [key, value] = c.trim().split('=');
            return [key, value];
          })
        );
        console.log("Cookie parsed manually (fallback)");
      }
    }
  } catch (cookieError) {
    console.error("Cookie parsing error:", cookieError);
    parsedCookies = {};
  }
  req.cookies = parsedCookies;

  console.log("🔄 SwitchRole API: Cookies received:", req.cookies);
  console.log("🔄 SwitchRole API: Headers:", req.headers.cookie);
  // Apply authentication middleware with proper error handling
  try {
    await new Promise((resolve, reject) => {
      verifyToken(req, res, (err) => {
        if (err) {
          console.log("❌ SwitchRole API: Auth failed:", err);
          return reject(err);
        } else {
          console.log("✅ SwitchRole API: Auth successful");
          return resolve();
        }
      });
    });
  } catch (authError) {
    console.error("❌ SwitchRole API: Authentication error:", authError);
    return res.status(401).json({
      success: false,
      message:
        "Authentication failed: " + (authError.message || "Unknown error"),
    });
  }

  try {
    const { role } = req.body;

    console.log("🔄 SwitchRole API: Request body:", req.body);
    console.log("🔄 SwitchRole API: User from middleware:", req.user);

    // Get user from the middleware (verifyToken sets req.user)
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found in request",
      });
    }

    console.log("🔄 SwitchRole API: User roles:", user.roles);
    console.log("🔄 SwitchRole API: Requested role:", role);

    // Check if the role is valid for this user
    const userRoles = user.roles || [user.role];
    if (!userRoles.includes(role)) {
      console.log("❌ SwitchRole API: Role not available for user");
      return res.status(403).json({
        success: false,
        message: "You don't have access to this role",
        availableRoles: userRoles,
      });
    }

    // Update user's current role
    user.currentRole = role;
    await user.save();

    console.log("✅ SwitchRole API: Role updated successfully");

    return res.status(200).json({
      success: true,
      message: "Role switched successfully",
      data: {
        currentRole: role,
        availableRoles: userRoles,
      },
    });
  } catch (error) {
    console.error("❌ SwitchRole API: Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to switch role",
      error: error.message,
    });
  }
};

export default handler;
