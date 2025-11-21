import notificationService from "../services/notification.service";
import Employee from "../models/Employee.js";

/**
 * Helper functions to create notifications for different modules
 */

export class NotificationHelper {
  // Lead notifications
  static async notifyLeadAssigned(
    leadId,
    assignedToId,
    assignedById,
    leadData
  ) {
    try {
      await notificationService.createNotification({
        recipient: assignedToId,
        sender: assignedById,
        type: "LEAD_ASSIGNED",
        title: "New Lead Assigned",
        message: `You have been assigned a new lead: ${
          leadData.name || leadData.phone
        }`,
        metadata: {
          leadId,
          actionUrl: `/dashboard/leads/${leadId}`,
          priority: leadData.priority || "MEDIUM",
          isActionable: true,
        },
        channels: {
          inApp: true,
          email: true,
        },
      });

      console.log(`Lead assignment notification sent to user ${assignedToId}`);
    } catch (error) {
      console.error("Error sending lead assignment notification:", error);
    }
  }

  static async notifyLeadStatusUpdate(
    leadId,
    userId,
    oldStatus,
    newStatus,
    leadData
  ) {
    try {
      await notificationService.createNotification({
        recipient: userId,
        type: "LEAD_STATUS_UPDATE",
        title: "Lead Status Updated",
        message: `Lead status changed from "${oldStatus}" to "${newStatus}" for ${
          leadData.name || leadData.phone
        }`,
        metadata: {
          leadId,
          actionUrl: `/dashboard/leads/${leadId}`,
          priority: "MEDIUM",
          entityStatus: newStatus,
        },
        channels: {
          inApp: true,
          email: false,
        },
      });
    } catch (error) {
      console.error("Error sending lead status notification:", error);
    }
  }

  static async notifyLeadFollowupDue(
    leadId,
    assignedToId,
    followupDate,
    leadData
  ) {
    try {
      await notificationService.createNotification({
        recipient: assignedToId,
        type: "LEAD_FOLLOWUP_DUE",
        title: "Lead Follow-up Due",
        message: `Follow-up is due for lead: ${
          leadData.name || leadData.phone
        }`,
        metadata: {
          leadId,
          actionUrl: `/dashboard/leads/${leadId}`,
          priority: "HIGH",
          isActionable: true,
        },
        channels: {
          inApp: true,
          email: true,
        },
        scheduledFor: followupDate,
      });
    } catch (error) {
      console.error("Error scheduling lead followup notification:", error);
    }
  }

  // Cab booking notifications
  static async notifyCabBookingRequest(
    bookingId,
    employeeId,
    managerId,
    bookingData
  ) {
    try {
      const employee = await Employee.findById(employeeId).select("name");

      await notificationService.createNotification({
        recipient: managerId,
        sender: employeeId,
        type: "CAB_BOOKING_REQUEST",
        title: "Cab Booking Approval Required",
        message: `${employee?.name} has requested cab booking for ${bookingData.date}`,
        metadata: {
          cabBookingId: bookingId,
          actionUrl: `/dashboard/cab-booking/${bookingId}`,
          priority: bookingData.priority || "MEDIUM",
          isActionable: true,
        },
        channels: {
          inApp: true,
          email: true,
        },
      });
    } catch (error) {
      console.error("Error sending cab booking request notification:", error);
    }
  }

  static async notifyCabBookingApproved(
    bookingId,
    employeeId,
    approverId,
    bookingData
  ) {
    try {
      await notificationService.createNotification({
        recipient: employeeId,
        sender: approverId,
        type: "CAB_BOOKING_APPROVED",
        title: "Cab Booking Approved",
        message: `Your cab booking for ${bookingData.date} has been approved`,
        metadata: {
          cabBookingId: bookingId,
          actionUrl: `/dashboard/cab-booking/${bookingId}`,
          priority: "MEDIUM",
          entityStatus: "APPROVED",
        },
        channels: {
          inApp: true,
          email: true,
        },
      });
    } catch (error) {
      console.error("Error sending cab booking approval notification:", error);
    }
  }

  static async notifyCabBookingRejected(
    bookingId,
    employeeId,
    rejectorId,
    reason,
    bookingData
  ) {
    try {
      await notificationService.createNotification({
        recipient: employeeId,
        sender: rejectorId,
        type: "CAB_BOOKING_REJECTED",
        title: "Cab Booking Rejected",
        message: `Your cab booking for ${bookingData.date} has been rejected. Reason: ${reason}`,
        metadata: {
          cabBookingId: bookingId,
          actionUrl: `/dashboard/cab-booking/${bookingId}`,
          priority: "MEDIUM",
          entityStatus: "REJECTED",
        },
        channels: {
          inApp: true,
          email: true,
        },
      });
    } catch (error) {
      console.error("Error sending cab booking rejection notification:", error);
    }
  }

  static async notifyVendorAssigned(
    bookingId,
    employeeId,
    vendorId,
    bookingData
  ) {
    try {
      // Notify the employee
      await notificationService.createNotification({
        recipient: employeeId,
        type: "CAB_BOOKING_ASSIGNED",
        title: "Cab Vendor Assigned",
        message: `A vendor has been assigned for your cab booking on ${bookingData.date}`,
        metadata: {
          cabBookingId: bookingId,
          actionUrl: `/dashboard/cab-booking/${bookingId}`,
          priority: "MEDIUM",
        },
        channels: {
          inApp: true,
          email: true,
        },
      });

      // Notify the vendor
      await notificationService.createNotification({
        recipient: vendorId,
        type: "VENDOR_ASSIGNED",
        title: "New Booking Assignment",
        message: `You have been assigned a new cab booking for ${bookingData.date}`,
        metadata: {
          cabBookingId: bookingId,
          vendorBookingId: bookingId,
          actionUrl: `/dashboard/vendor-booking/${bookingId}`,
          priority: "HIGH",
          isActionable: true,
        },
        channels: {
          inApp: true,
          email: true,
        },
      });
    } catch (error) {
      console.error("Error sending vendor assignment notification:", error);
    }
  }

  // User/Role notifications
  static async notifyUserRoleChanged(userId, oldRoles, newRoles, changedById) {
    try {
      const oldRoleNames = oldRoles.map((r) => r.name).join(", ");
      const newRoleNames = newRoles.map((r) => r.name).join(", ");

      await notificationService.createNotification({
        recipient: userId,
        sender: changedById,
        type: "USER_ROLE_CHANGED",
        title: "Role Assignment Updated",
        message: `Your role has been updated from "${oldRoleNames}" to "${newRoleNames}"`,
        metadata: {
          userId,
          actionUrl: `/dashboard/users/${userId}`,
          priority: "HIGH",
        },
        channels: {
          inApp: true,
          email: true,
        },
      });
    } catch (error) {
      console.error("Error sending role change notification:", error);
    }
  }

  static async notifyNewUser(newUserId, createdById, userData) {
    try {
      // Get all users with HR role or managers
      const hrUsers = await Employee.find()
        .populate("roles")
        .where("roles.name")
        .in(["HR", "Manager"]);

      const recipients = hrUsers
        .map((u) => u._id.toString())
        .filter((id) => id !== createdById);

      await notificationService.createBulkNotification(recipients, {
        sender: createdById,
        type: "NEW_USER_ADDED",
        title: "New Employee Added",
        message: `New employee ${userData.name} (${userData.email}) has been added to the system`,
        metadata: {
          userId: newUserId,
          actionUrl: `/dashboard/users/${newUserId}`,
          priority: "MEDIUM",
        },
        channels: {
          inApp: true,
          email: false,
        },
      });
    } catch (error) {
      console.error("Error sending new user notification:", error);
    }
  }

  // MOU notifications
  static async notifyMOUStatusChange(userId, status, approvedById, mouData) {
    try {
      let title, message;

      switch (status) {
        case "APPROVED":
          title = "MOU Approved";
          message =
            "Your MOU has been approved. You can now proceed with your activities.";
          break;
        case "REJECTED":
          title = "MOU Rejected";
          message =
            "Your MOU has been rejected. Please contact HR for more information.";
          break;
        case "PENDING":
          title = "MOU Under Review";
          message = "Your MOU is currently under review by the management.";
          break;
      }

      await notificationService.createNotification({
        recipient: userId,
        sender: approvedById,
        type: `MOU_${status}`,
        title,
        message,
        metadata: {
          userId,
          actionUrl: `/dashboard/mou`,
          priority: status === "APPROVED" ? "HIGH" : "MEDIUM",
          entityStatus: status,
        },
        channels: {
          inApp: true,
          email: true,
        },
      });
    } catch (error) {
      console.error("Error sending MOU status notification:", error);
    }
  }

  // System notifications
  static async notifySystemAnnouncement(
    title,
    message,
    priority = "MEDIUM",
    targetRoles = []
  ) {
    try {
      let recipients = [];

      if (targetRoles.length > 0) {
        const users = await Employee.find()
          .populate("roles")
          .where("roles.name")
          .in(targetRoles);
        recipients = users.map((u) => u._id.toString());
      } else {
        // Send to all users
        const allUsers = await Employee.find({}).select("_id");
        recipients = allUsers.map((u) => u._id.toString());
      }

      await notificationService.createBulkNotification(recipients, {
        type: "SYSTEM_ANNOUNCEMENT",
        title,
        message,
        metadata: {
          priority: priority.toUpperCase(),
          actionUrl: `/dashboard`,
        },
        channels: {
          inApp: true,
          email: priority === "URGENT" || priority === "HIGH",
        },
      });
    } catch (error) {
      console.error("Error sending system announcement:", error);
    }
  }

  // Property notifications
  static async notifyPropertyUploaded(uploaderId, propertyData) {
    try {
      // Notify property managers or relevant roles
      const propertyManagers = await Employee.find()
        .populate("roles")
        .where("roles.name")
        .in(["Property Manager", "Admin"]);

      const recipients = propertyManagers
        .map((u) => u._id.toString())
        .filter((id) => id !== uploaderId);

      if (recipients.length > 0) {
        await notificationService.createBulkNotification(recipients, {
          sender: uploaderId,
          type: "PROPERTY_UPLOADED",
          title: "New Property Added",
          message: `A new property has been uploaded: ${
            propertyData.title || "Property"
          }`,
          metadata: {
            propertyId: propertyData._id,
            actionUrl: `/dashboard/properties/${propertyData._id}`,
            priority: "MEDIUM",
          },
          channels: {
            inApp: true,
            email: false,
          },
        });
      }
    } catch (error) {
      console.error("Error sending property upload notification:", error);
    }
  }

  // Utility function to send custom notifications
  static async sendCustomNotification(data) {
    try {
      return await notificationService.createNotification(data);
    } catch (error) {
      console.error("Error sending custom notification:", error);
      throw error;
    }
  }

  // Bulk custom notifications
  static async sendBulkCustomNotification(recipients, data) {
    try {
      return await notificationService.createBulkNotification(recipients, data);
    } catch (error) {
      console.error("Error sending bulk custom notification:", error);
      throw error;
    }
  }
}

export default NotificationHelper;
