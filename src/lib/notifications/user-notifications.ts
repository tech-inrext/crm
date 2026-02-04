import { safeNotify, filterRecipients, buildMetadata } from "./utils";

/**
 * Notify when a user is registered
 */
export const notifyUserRegistration = async (
  userId,
  userData,
  managerId,
  createdById
) => {
  const recipients = filterRecipients(
    userId,
    managerId !== createdById && managerId
  );

  for (const recipientId of recipients) {
    const isNewUser = recipientId === userId;
    await safeNotify({
      recipient: recipientId,
      sender: createdById,
      type: isNewUser ? "USER_WELCOME" : "USER_ASSIGNED",
      title: isNewUser ? "Welcome to the Team!" : "New Team Member Assigned",
      message: isNewUser
        ? `Welcome ${userData.name}! Your account has been created successfully.`
        : `${userData.name} has been assigned to your team as ${
            userData.designation || "a new team member"
          }.`,
      metadata: buildMetadata({
        userId,
        userName: userData.name,
        userDesignation: userData.designation,
          dateOfBirth: userData.dateOfBirth,
        actionUrl: isNewUser
          ? "/dashboard/profile"
          : `/dashboard/users?openDialog=true&userId=${userId}`,
        priority: isNewUser ? "HIGH" : "MEDIUM",
      }),
      channels: { inApp: true, email: true },
    });
  }
};

/**
 * Notify when a user profile is updated
 */
export const notifyUserUpdate = async (
  userId,
  userData,
  changedFields,
  updatedById
) => {
  const recipients = filterRecipients(
    userId !== updatedById && userId,
    changedFields.managerId,
    userData.managerId !== changedFields.managerId && userData.managerId
  );

  const changes = Object.keys(changedFields);
  const changeDesc = changes.includes("designation")
    ? `role updated to ${changedFields.designation || userData.designation}`
    : changes.includes("managerId")
    ? "manager assignment updated"
    : "profile information updated";

  for (const recipientId of recipients) {
    const isUser = recipientId === userId;
    await safeNotify({
      recipient: recipientId,
      sender: updatedById,
      type: "USER_UPDATED",
      title: isUser ? "Your Profile Updated" : "Team Member Updated",
      message: isUser
        ? `Your ${changeDesc} by management.`
        : `${userData.name}'s ${changeDesc}.`,
      metadata: buildMetadata({
        userId,
        userName: userData.name,
        changes: changedFields,
        actionUrl: isUser
          ? "/dashboard/profile"
          : `/dashboard/users?openDialog=true&userId=${userId}&mode=view`,
        priority: "MEDIUM",
      }),
      channels: {
        inApp: true,
        email: changes.includes("designation") || changes.includes("managerId"),
      },
    });
  }
};

/**
 * Notify when user roles change
 */
export const notifyRoleChange = async (
  userId,
  userData,
  addedRoles,
  removedRoles,
  changedById
) => {
  const recipients = filterRecipients(
    userId,
    userData.managerId !== changedById && userData.managerId
  );
  const roleChanges = [
    ...(addedRoles.length ? [`Added: ${addedRoles.join(", ")}`] : []),
    ...(removedRoles.length ? [`Removed: ${removedRoles.join(", ")}`] : []),
  ];

  for (const recipientId of recipients) {
    const isUser = recipientId === userId;
    await safeNotify({
      recipient: recipientId,
      sender: changedById,
      type: "USER_ROLE_CHANGED",
      title: isUser ? "Your Roles Updated" : "Team Member Role Changed",
      message: isUser
        ? `Your system roles have been updated. ${roleChanges.join(". ")}.`
        : `${userData.name}'s roles updated: ${roleChanges.join(". ")}.`,
      metadata: buildMetadata({
        userId,
        userName: userData.name,
        addedRoles,
        removedRoles,
        actionUrl: isUser
          ? "/dashboard/profile"
          : `/dashboard/users?openDialog=true&userId=${userId}&mode=view`,
        priority: "HIGH",
      }),
      channels: { inApp: true, email: true },
    });
  }
};

/**
 * Notify HR and managers about a new user (legacy support)
 */
export const notifyNewUser = async (newUserId, createdById, userData) => {
  const { getEmployeeIdsByRoles, sendBulkNotification } = await import(
    "./utils"
  );
  const recipients = await getEmployeeIdsByRoles(
    ["HR", "Manager"],
    createdById
  );

  await sendBulkNotification(recipients, {
    sender: createdById,
    type: "NEW_USER_ADDED",
    title: "New Employee Added",
    message: `New employee ${userData.name} (${userData.email}) has been added to the system`,
    metadata: {
      userId: newUserId,
      actionUrl: `/dashboard/users/${newUserId}`,
      priority: "MEDIUM",
    },
    channels: { inApp: true, email: false },
  });
};
