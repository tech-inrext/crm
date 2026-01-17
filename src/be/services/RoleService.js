import { Service } from "@framework";
import Role from "../../models/Role";
import { NotificationHelper } from "../../lib/notification-helpers";

class RoleService extends Service {
  constructor() {
    super();
  }

  async getAllRoles(req, res) {
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
          .select(
            "name read write delete isSystemAdmin showTotalUsers showTotalVendorsBilling showCabBookingAnalytics showScheduleThisWeek createdAt updatedAt"
          )
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
  }

  async createRole(req, res) {
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
        showScheduleThisWeek,
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
  }

  async getRoleById(req, res) {
    const { id } = req.query;

    try {
      const role = await Role.findById(id);
      if (!role) {
        return res
          .status(404)
          .json({ success: false, error: "Role not found" });
      }
      return res.status(200).json({ success: true, data: role });
    } catch (error) {
      console.error("Error fetching Role:", error);
      return res
        .status(500)
        .json({ success: false, error: "Error: " + error.message });
    }
  }

  async updateRoleDetails(req, res) {
    const { id } = req.query;

    // Extract known updatable fields to avoid accidental updates
    const {
      name,
      read: readItems,
      write: writeItems,
      delete: deleteItems,
      isSystemAdmin,
      showTotalUsers,
      showTotalVendorsBilling,
      showCabBookingAnalytics,
      showScheduleThisWeek,
    } = req.body;

    try {
      // Prevent role name update
      if (name) {
        return res.status(400).json({
          success: false,
          message: "Updating role name is not allowed.",
        });
      }

      // Normalize module names to match backend enum
      const normalizeModuleName = (modules) => {
        if (!Array.isArray(modules)) return modules;
        return modules.map((mod) => {
          // Handle module name conversions to match backend enum
          if (mod === "bookinglogin") return "booking-login";
          if (mod === "trainingvideos") return "training-videos";
          if (mod === "pillar") return "pillar";
          return mod;
        });
      };

      const setObj = {};
      // if (Array.isArray(readItems)) setObj.read = readItems;
      // if (Array.isArray(writeItems)) setObj.write = writeItems;
      // if (Array.isArray(deleteItems)) setObj.delete = deleteItems;
      if (Array.isArray(readItems))
        setObj.read = normalizeModuleName(readItems);
      if (Array.isArray(writeItems))
        setObj.write = normalizeModuleName(writeItems);
      if (Array.isArray(deleteItems))
        setObj.delete = normalizeModuleName(deleteItems);

      if (typeof isSystemAdmin !== "undefined") {
        // Coerce string values to boolean too (e.g. 'true'/'false')
        const flag =
          typeof isSystemAdmin === "string"
            ? isSystemAdmin.toLowerCase() === "true"
            : Boolean(isSystemAdmin);
        setObj.isSystemAdmin = flag;
      }

      if (typeof showTotalUsers !== "undefined") {
        const flag =
          typeof showTotalUsers === "string"
            ? showTotalUsers.toLowerCase() === "true"
            : Boolean(showTotalUsers);
        setObj.showTotalUsers = flag;
      }

      if (typeof showTotalVendorsBilling !== "undefined") {
        const flag =
          typeof showTotalVendorsBilling === "string"
            ? showTotalVendorsBilling.toLowerCase() === "true"
            : Boolean(showTotalVendorsBilling);
        setObj.showTotalVendorsBilling = flag;
      }

      if (typeof showCabBookingAnalytics !== "undefined") {
        const flag =
          typeof showCabBookingAnalytics === "string"
            ? showCabBookingAnalytics.toLowerCase() === "true"
            : Boolean(showCabBookingAnalytics);
        setObj.showCabBookingAnalytics = flag;
      }

      if (typeof showScheduleThisWeek !== "undefined") {
        const flag =
          typeof showScheduleThisWeek === "string"
            ? showScheduleThisWeek.toLowerCase() === "true"
            : Boolean(showScheduleThisWeek);
        setObj.showScheduleThisWeek = flag;
      }

      if (Object.keys(setObj).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update.",
        });
      }

      const updatedRole = await Role.findByIdAndUpdate(
        id,
        { $set: setObj },
        { new: true, runValidators: true }
      );

      if (!updatedRole) {
        return res
          .status(404)
          .json({ success: false, message: "Role not found" });
      }

      // Send notification for role update
      try {
        await NotificationHelper.notifyRoleUpdated(
          updatedRole._id,
          updatedRole.toObject(),
          setObj,
          req.employee?._id
        );
        console.log("✅ Role update notification sent");
      } catch (error) {
        console.error("❌ Role update notification failed:", error);
      }

      return res.status(200).json({ success: true, data: updatedRole });
    } catch (error) {
      console.error("Error updating role:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAllRoleList(req, res) {
    try {
      const roles = await Role.find({}).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        count: roles.length,
        data: roles,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch all leads",
        error: error.message,
      });
    }
  }
}

export default RoleService;
