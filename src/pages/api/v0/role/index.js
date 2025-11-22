import dbConnect from "@/lib/mongodb";
import Role from "@/models/Role";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import { NotificationHelper } from "../../../../lib/notification-helpers";

// ✅ Create a new role (requires WRITE access on "role")
const createRole = async (req, res) => {
  try {
  const { 
    name, 
    read, 
    write, 
    delete: deleteItems, 
    isSystemAdmin,
    showTotalUsers,
    showTotalVendorsBilling,
    showCabBookingAnalytics,
    showScheduleThisWeek
  } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const newRole = new Role({
      name,
      read,
      write,
      delete: deleteItems,
      isSystemAdmin: !!isSystemAdmin,
      showTotalUsers: !!showTotalUsers,
      showTotalVendorsBilling: !!showTotalVendorsBilling,
      showCabBookingAnalytics: !!showCabBookingAnalytics,
      showScheduleThisWeek: !!showScheduleThisWeek,
    });

    await newRole.save();

    // Send notification for role creation
    try {
      await NotificationHelper.notifyRoleCreated(
        newRole._id,
        newRole.toObject(),
        req.employee?._id
      );
      console.log("✅ Role creation notification sent");
    } catch (error) {
      console.error("❌ Role creation notification failed:", error);
    }

    return res.status(201).json({
      success: true,
      data: newRole,
    });
  } catch (error) {
    console.error("Role Creation Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "" } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Optional search filter
    const query = search
      ? {
          $or: [{ name: { $regex: search, $options: "i" } }],
        }
      : {};

    const [roles, totalRoles] = await Promise.all([
      Role.find(query)
        .select('name read write delete isSystemAdmin showTotalUsers showTotalVendorsBilling showCabBookingAnalytics showScheduleThisWeek createdAt updatedAt')
        .skip(skip)
        .limit(itemsPerPage)
        .sort({ createdAt: -1 }),
      Role.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: roles,
      pagination: {
        totalItems: totalRoles,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalRoles / itemsPerPage),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch Roles",
      error: error.message,
    });
  }
};

// ✅ Middleware wrapper to check permissions
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;

    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Main handler with permission checks
const handler = async (req, res) => {
  await dbConnect();

  // ✅ Handle GET (read permission required)
  if (req.method === "GET") {
    return getAllRoles(req, res);
  }

  // ✅ Handle POST (write permission required)
  if (req.method === "POST") {
    return createRole(req, res);
  }

  // ✅ Method not supported
  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default withAuth(handler);
