import { safeNotify, buildMetadata } from "./utils";

/**
 * Notify when a role is created
 */
export const notifyRoleCreated = async (roleId, roleData, createdById) => {
  await safeNotify({
    recipient: createdById,
    sender: createdById,
    type: "ROLE_CREATED",
    title: "Role Created Successfully",
    message: `You have successfully created the role "${roleData.name}" with specific permissions and access levels.`,
    metadata: buildMetadata({
      roleId,
      roleName: roleData.name,
      permissions: {
        read: roleData.read || [],
        write: roleData.write || [],
        delete: roleData.delete || [],
      },
      actionUrl: `/dashboard/roles?roleId=${roleId}`,
      priority: "MEDIUM",
    }),
    channels: { inApp: true, email: false },
  });
};

/**
 * Notify when a role is updated
 */
export const notifyRoleUpdated = async (
  roleId,
  roleData,
  changedFields,
  updatedById
) => {
  const changes = Object.keys(changedFields);
  if (changes.length === 0) return;

  const hasPermissionChanges = changes.some((key) =>
    ["read", "write", "delete"].includes(key)
  );

  await safeNotify({
    recipient: updatedById,
    sender: updatedById,
    type: "ROLE_UPDATED",
    title: "Role Permissions Updated",
    message: `You have successfully updated permissions for role "${roleData.name}". This affects all users with this role.`,
    metadata: buildMetadata({
      roleId,
      roleName: roleData.name,
      changedFields,
      actionUrl: `/dashboard/roles?roleId=${roleId}`,
      priority: hasPermissionChanges ? "HIGH" : "MEDIUM",
    }),
    channels: { inApp: true, email: hasPermissionChanges },
  });
};
