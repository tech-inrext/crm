import notificationService from "../../services/notification.service";
import Employee from "../../models/Employee.js";

/**
 * Safely send a notification with error handling
 */
export const safeNotify = async (config) => {
  try {
    await notificationService.createNotification(config);
  } catch (error) {
    console.error("Notification error:", error);
  }
};

/**
 * Send notifications to multiple recipients
 */
export const notifyRecipients = async (
  recipients,
  notificationData,
  senderId
) => {
  for (const recipientId of recipients) {
    await safeNotify({
      ...notificationData,
      recipient: recipientId,
      sender: senderId,
    });
  }
};

/**
 * Get employee IDs by their role names
 */
export const getEmployeeIdsByRoles = async (roleNames, excludeId = null) => {
  const employees = await Employee.find()
    .populate("roles")
    .where("roles.name")
    .in(roleNames);
  return employees
    .map((emp) => emp._id.toString())
    .filter((id) => id !== excludeId);
};

/**
 * Build metadata object
 */
export const buildMetadata = (base, additional = {}) => ({
  ...base,
  ...additional,
});

/**
 * Filter out falsy recipient IDs
 */
export const filterRecipients = (...ids) => ids.filter(Boolean);

/**
 * Send bulk notifications
 */
export const sendBulkNotification = async (recipients, notificationData) => {
  return await notificationService.createBulkNotification(
    recipients,
    notificationData
  );
};
