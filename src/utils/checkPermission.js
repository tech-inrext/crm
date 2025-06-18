// utils/checkPermission.js
import Role from "../models/Role";

// Utility function to check if a role has access to an action (read/write/delete) on a module (employee, lead, etc.)
export const checkPermission = async (userRoleId, action, moduleName) => {
  const roleData = await Role.findById(userRoleId);
  if (!roleData) return false;
  return roleData[action]?.includes(moduleName);
};