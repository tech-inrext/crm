import dbConnect from "../../../../lib/mongodb";
import { verifyToken } from "../../../../middlewares/auth";
import cookie from "cookie";

const handler = async (req, res) => {
  await dbConnect();

  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  // Parse cookies from headers
  const parsedCookies = cookie.parse(req.headers.cookie || "");
  req.cookies = parsedCookies;

  console.log("🔄 SwitchRole API: Cookies received:", req.cookies);
  console.log("🔄 SwitchRole API: Headers:", req.headers.cookie);

  // Apply authentication middleware
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) {
        console.log("❌ SwitchRole API: Auth failed:", err);
        reject(err);
      } else {
        console.log("✅ SwitchRole API: Auth successful");
        resolve();
      }
    });
  });

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
