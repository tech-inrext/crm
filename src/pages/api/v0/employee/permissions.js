import dbConnect from "../../../../lib/mongodb";
import { verifyToken } from "../../../../middlewares/auth";
import { getUserPermissions } from "../../../../middlewares/permissions";

// ✅ Get user permissions for the authenticated user
const getUserPermissionsHandler = async (req, res) => {
  try {
    const user = req.user;
    const permissions = await getUserPermissions(user);

    return res.status(200).json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get user permissions",
      error: error.message,
    });
  }
};

// ✅ Main handler
const handler = async (req, res) => {
  await dbConnect();

  // Apply authentication middleware
  await new Promise((resolve, reject) => {
    verifyToken(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  if (req.method === "GET") {
    return getUserPermissionsHandler(req, res);
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default handler;
