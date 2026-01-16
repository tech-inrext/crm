/**
 * Central export file for all notification helpers
 * Organized by module for better maintainability
 */

// Lead notifications
export {
  notifyLeadAssigned,
  notifyLeadStatusUpdate,
  notifyLeadFollowupDue,
} from "./lead-notifications";

// Cab booking notifications
export {
  notifyCabBookingRequest,
  notifyCabBookingStatusChange,
  notifyCabBookingVendorAssignment,
  notifyVendorAssigned,
} from "./cab-booking-notifications";

// User notifications
export {
  notifyUserRegistration,
  notifyUserUpdate,
  notifyRoleChange,
  notifyNewUser,
} from "./user-notifications";

// Role notifications
export { notifyRoleCreated, notifyRoleUpdated } from "./role-notifications";

// MOU notifications
export { notifyMOUStatusChange } from "./mou-notifications";

// System notifications
export {
  notifySystemAnnouncement,
  notifyPropertyUploaded,
} from "./system-notifications";

// Utility functions
export {
  safeNotify,
  notifyRecipients,
  getEmployeeIdsByRoles,
  buildMetadata,
  filterRecipients,
  sendBulkNotification,
} from "./utils";

// For backward compatibility
import notificationService from "../../services/notification.service";

export const sendCustomNotification = async (data) => {
  return await notificationService.createNotification(data);
};

export const sendBulkCustomNotification = async (recipients, data) => {
  return await notificationService.createBulkNotification(recipients, data);
};
