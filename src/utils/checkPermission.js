// utils/checkPermission.js
import Role from "../models/Role";

// Utility function to check if a role has access to an action (read/write/delete) on a module (employee, lead, etc.)
export const checkPermission = async (userRole, action, moduleName) => {
  // Handle both role name (string) and role object cases
  let roleName = userRole;
  if (typeof userRole === "object" && userRole?.name) {
    roleName = userRole.name;
  }

  // Find role by name, not by ID
  const roleData = await Role.findOne({ name: roleName });
  if (!roleData) return false;
  return roleData[action]?.includes(moduleName);
};
