// utils/checkPermission.js
// Lazy-load the Role model to avoid pulling server-only modules (like mongoose)
// into client bundles if this utility is accidentally imported on the client.
export const checkPermission = async (userRoleId, action, moduleName) => {
  const Role = (await import("../models/Role")).default;
  const roleData = await Role.findById(userRoleId);
  if (!roleData) return false;
  return roleData[action]?.includes(moduleName);
};