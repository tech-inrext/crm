/**
 * Notification Helpers - Backward Compatibility Layer
 *
 * This file re-exports all notification functions from the modular structure.
 * The actual implementations are now organized by module in the notifications/ folder.
 *
 * File structure:
 * - notifications/utils.ts - Common utility functions
 * - notifications/lead-notifications.ts - Lead-related notifications
 * - notifications/cab-booking-notifications.ts - Cab booking notifications
 * - notifications/user-notifications.ts - User-related notifications
 * - notifications/role-notifications.ts - Role management notifications
 * - notifications/mou-notifications.ts - MOU status notifications
 * - notifications/system-notifications.ts - System-wide notifications
 */

// Lead notifications
import {
  notifyLeadAssigned,
  notifyLeadStatusUpdate,
  notifyLeadFollowupDue,
} from "./notifications/lead-notifications";

// Cab booking notifications
import {
  notifyCabBookingRequest,
  notifyCabBookingStatusChange,
  notifyCabBookingVendorAssignment,
  notifyVendorAssigned,
} from "./notifications/cab-booking-notifications";

// User notifications
import {
  notifyUserRegistration,
  notifyUserUpdate,
  notifyRoleChange,
  notifyNewUser,
} from "./notifications/user-notifications";

// Role notifications
import {
  notifyRoleCreated,
  notifyRoleUpdated,
} from "./notifications/role-notifications";

// MOU notifications
import { notifyMOUStatusChange } from "./notifications/mou-notifications";

// System notifications
import {
  notifySystemAnnouncement,
  notifyPropertyUploaded,
} from "./notifications/system-notifications";

// Utilities
import {
  safeNotify,
  notifyRecipients,
  getEmployeeIdsByRoles,
  buildMetadata,
  filterRecipients,
  sendBulkNotification,
} from "./notifications/utils";

import notificationService from "../services/notification-util.service";

// Export all functions
export {
  // Lead
  notifyLeadAssigned,
  notifyLeadStatusUpdate,
  notifyLeadFollowupDue,
  // Cab booking
  notifyCabBookingRequest,
  notifyCabBookingStatusChange,
  notifyCabBookingVendorAssignment,
  notifyVendorAssigned,
  // User
  notifyUserRegistration,
  notifyUserUpdate,
  notifyRoleChange,
  notifyNewUser,
  // Role
  notifyRoleCreated,
  notifyRoleUpdated,
  // MOU
  notifyMOUStatusChange,
  // System
  notifySystemAnnouncement,
  notifyPropertyUploaded,
  // Utilities
  safeNotify,
  notifyRecipients,
  getEmployeeIdsByRoles,
  buildMetadata,
  filterRecipients,
  sendBulkNotification,
};

// Custom notification functions
export const sendCustomNotification = async (data) => {
  return await notificationService.createNotification(data);
};

export const sendBulkCustomNotification = async (recipients, data) => {
  return await notificationService.createBulkNotification(recipients, data);
};

// Export NotificationHelper class for backward compatibility
export class NotificationHelper {
  static notifyLeadAssigned = notifyLeadAssigned;
  static notifyLeadStatusUpdate = notifyLeadStatusUpdate;
  static notifyLeadFollowupDue = notifyLeadFollowupDue;
  static notifyCabBookingRequest = notifyCabBookingRequest;
  static notifyCabBookingStatusChange = notifyCabBookingStatusChange;
  static notifyCabBookingVendorAssignment = notifyCabBookingVendorAssignment;
  static notifyVendorAssigned = notifyVendorAssigned;
  static notifyUserRegistration = notifyUserRegistration;
  static notifyUserUpdate = notifyUserUpdate;
  static notifyRoleChange = notifyRoleChange;
  static notifyNewUser = notifyNewUser;
  static notifyRoleCreated = notifyRoleCreated;
  static notifyRoleUpdated = notifyRoleUpdated;
  static notifyMOUStatusChange = notifyMOUStatusChange;
  static notifySystemAnnouncement = notifySystemAnnouncement;
  static notifyPropertyUploaded = notifyPropertyUploaded;
  static sendCustomNotification = sendCustomNotification;
  static sendBulkCustomNotification = sendBulkCustomNotification;
}

export default NotificationHelper;
