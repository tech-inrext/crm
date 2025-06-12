import Role from "../models/Role.js";

/**
 * Middleware to check if user has the required permission for a module
 * @param {string} module - The module to check (employee, lead, role, user)
 * @param {string} action - The action to check (read, write, delete)
 * @returns {Function} Express middleware function
 */
export const checkPermission = (module, action) => {
  return async (req, res, next) => {
    try {
      // Get user from request (should be set by auth middleware)
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      // If user has no role, deny access
      if (!user.role) {
        return res.status(403).json({
          success: false,
          message: "Access denied: No role assigned",
        });
      }

      // Fetch the role from database
      const role = await Role.findOne({ name: user.role });

      if (!role) {
        return res.status(403).json({
          success: false,
          message: "Access denied: Role not found",
        });
      }

      // Check if the role has the required permission for the module
      const hasPermission = role[action] && role[action].includes(module);

      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: `Access denied: Insufficient permissions for ${action} on ${module}`,
        });
      }

      // Permission granted, continue to next middleware
      next();
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error during permission check",
      });
    }
  };
};

/**
 * Get user permissions for all modules
 * @param {Object} user - User object with role
 * @returns {Object} Permissions object with read, write, delete arrays
 */
export const getUserPermissions = async (user) => {
  try {
    if (!user || !user.role) {
      return { read: [], write: [], delete: [] };
    }

    const role = await Role.findOne({ name: user.role });

    if (!role) {
      return { read: [], write: [], delete: [] };
    }

    return {
      read: role.read || [],
      write: role.write || [],
      delete: role.delete || [],
    };
  } catch (error) {
    console.error("Error getting user permissions:", error);
    return { read: [], write: [], delete: [] };
  }
};

export default { checkPermission, getUserPermissions };
