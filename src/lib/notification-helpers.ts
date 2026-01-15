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
        message: `You have been assigned a new lead: ${leadData.name || leadData.phone
          }`,
        metadata: {
          leadId,
          actionUrl: `/dashboard/leads?openDialog=true&leadId=${leadId}`,
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
        message: `Lead status changed from "${oldStatus}" to "${newStatus}" for ${leadData?.name || leadData?.phone || "Unknown Lead"
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
        message: `Follow-up is due for lead: ${leadData.name || leadData.phone
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
          message: `A new property has been uploaded: ${propertyData.title || "Property"
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

  // Cab Booking notifications
  static async notifyCabBookingRequest(
    bookingId,
    bookingData,
    requesterId,
    managerId
  ) {
    try {
      if (!managerId) return;

      await notificationService.createNotification({
        recipient: managerId,
        sender: requesterId,
        type: "CAB_BOOKING_REQUESTED",
        title: "New Cab Booking Request",
        message: `${bookingData.employeeName || "A team member"
          } has requested a cab booking for ${bookingData.clientName} from ${bookingData.pickupPoint
          } to ${bookingData.dropPoint}.`,
        metadata: {
          bookingId,
          clientName: bookingData.clientName,
          pickupPoint: bookingData.pickupPoint,
          dropPoint: bookingData.dropPoint,
          requestedDateTime: bookingData.requestedDateTime,
          actionUrl: `/dashboard/cab-booking?bookingId=${bookingId}`,
          priority: "HIGH",
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

  static async notifyCabBookingStatusChange(
    bookingId,
    bookingData,
    prevStatus,
    newStatus,
    updatedById
  ) {
    try {
      const recipients = [];

      // Notify the requester
      if (bookingData.cabBookedBy) {
        recipients.push(bookingData.cabBookedBy);
      }

      // Notify manager if different from updater
      if (bookingData.managerId && bookingData.managerId !== updatedById) {
        recipients.push(bookingData.managerId);
      }

      const statusMessages = {
        approved: "Your cab booking has been approved!",
        rejected: "Your cab booking has been rejected.",
        active: "Your cab is on the way!",
        completed: "Your cab booking has been completed.",
        cancelled: "Your cab booking has been cancelled.",
      };

      const priorityMap = {
        approved: "HIGH",
        rejected: "HIGH",
        active: "URGENT",
        completed: "MEDIUM",
        cancelled: "HIGH",
      };

      for (const recipient of recipients) {
        await notificationService.createNotification({
          recipient,
          sender: updatedById,
          type: `CAB_BOOKING_${newStatus.toUpperCase()}`,
          title: "Cab Booking Update",
          message:
            statusMessages[newStatus] ||
            `Your cab booking status changed to ${newStatus}.`,
          metadata: {
            bookingId,
            previousStatus: prevStatus,
            newStatus,
            clientName: bookingData.clientName,
            pickupPoint: bookingData.pickupPoint,
            dropPoint: bookingData.dropPoint,
            actionUrl: `/dashboard/cab-booking?bookingId=${bookingId}`,
            priority: priorityMap[newStatus] || "MEDIUM",
          },
          channels: {
            inApp: true,
            email: ["approved", "rejected", "cancelled"].includes(newStatus),
          },
        });
      }
    } catch (error) {
      console.error(
        "Error sending cab booking status change notification:",
        error
      );
    }
  }

  static async notifyCabBookingVendorAssignment(
    bookingId,
    bookingData,
    vendorId,
    assignedById
  ) {
    try {
      const recipients = [];

      // Notify the assigned vendor
      if (vendorId) {
        recipients.push(vendorId);
      }

      // Notify the requester
      if (bookingData.cabBookedBy && bookingData.cabBookedBy !== assignedById) {
        recipients.push(bookingData.cabBookedBy);
      }

      for (const recipient of recipients) {
        const isVendor = recipient === vendorId;

        await notificationService.createNotification({
          recipient,
          sender: assignedById,
          type: "CAB_BOOKING_VENDOR_ASSIGNED",
          title: isVendor
            ? "New Cab Booking Assignment"
            : "Vendor Assigned to Your Booking",
          message: isVendor
            ? `You have been assigned a cab booking for ${bookingData.clientName} from ${bookingData.pickupPoint} to ${bookingData.dropPoint}.`
            : `A vendor has been assigned to your cab booking for ${bookingData.clientName}.`,
          metadata: {
            bookingId,
            vendorId,
            clientName: bookingData.clientName,
            pickupPoint: bookingData.pickupPoint,
            dropPoint: bookingData.dropPoint,
            requestedDateTime: bookingData.requestedDateTime,
            actionUrl: `/dashboard/cab-booking?bookingId=${bookingId}`,
            priority: "HIGH",
          },
          channels: {
            inApp: true,
            email: true,
          },
        });
      }
    } catch (error) {
      console.error(
        "Error sending cab booking vendor assignment notification:",
        error
      );
    }
  }

  // Role notifications
  static async notifyRoleCreated(roleId, roleData, createdById) {
    try {
      // Create notification for the user who created the role
      await notificationService.createNotification({
        recipient: createdById,
        sender: createdById,
        type: "ROLE_CREATED",
        title: "Role Created Successfully",
        message: `You have successfully created the role "${roleData.name}" with specific permissions and access levels.`,
        metadata: {
          roleId,
          roleName: roleData.name,
          permissions: {
            read: roleData.read || [],
            write: roleData.write || [],
            delete: roleData.delete || [],
          },
          actionUrl: `/dashboard/roles?roleId=${roleId}`,
          priority: "MEDIUM",
        },
        channels: {
          inApp: true,
          email: false,
        },
      });

      console.log(`✅ Role creation notification sent for: ${roleData.name}`);
    } catch (error) {
      console.error("Error sending role creation notification:", error);
    }
  }

  static async notifyRoleUpdated(roleId, roleData, changedFields, updatedById) {
    try {
      // Create notification for the user who updated the role
      const changes = Object.keys(changedFields);
      const permissionChanges =
        changes.filter((key) => ["read", "write", "delete"].includes(key))
          .length > 0;

      if (permissionChanges || changes.length > 0) {
        await notificationService.createNotification({
          recipient: updatedById,
          sender: updatedById,
          type: "ROLE_UPDATED",
          title: "Role Permissions Updated",
          message: `You have successfully updated permissions for role "${roleData.name}". This affects all users with this role.`,
          metadata: {
            roleId,
            roleName: roleData.name,
            changedFields,
            actionUrl: `/dashboard/roles?roleId=${roleId}`,
            priority: permissionChanges ? "HIGH" : "MEDIUM",
          },
          channels: {
            inApp: true,
            email: permissionChanges,
          },
        });

        console.log(`✅ Role update notification sent for: ${roleData.name}`);
      }
    } catch (error) {
      console.error("Error sending role update notification:", error);
    }
  }

  // User/Employee notifications
  static async notifyUserRegistration(
    userId,
    userData,
    managerId,
    createdById
  ) {
    try {
      const recipients = [];

      // Notify the new user
      recipients.push(userId);

      // Notify the manager if exists
      if (managerId && managerId !== createdById) {
        recipients.push(managerId);
      }

      for (const recipient of recipients) {
        const isNewUser = recipient === userId;

        await notificationService.createNotification({
          recipient,
          sender: createdById,
          type: isNewUser ? "USER_WELCOME" : "USER_ASSIGNED",
          title: isNewUser
            ? "Welcome to the Team!"
            : "New Team Member Assigned",
          message: isNewUser
            ? `Welcome ${userData.name}! Your account has been created successfully.`
            : `${userData.name} has been assigned to your team as ${userData.designation || "a new team member"
            }.`,
          metadata: {
            userId,
            userName: userData.name,
            userDesignation: userData.designation,
            actionUrl: isNewUser ? "/dashboard/profile" : `/dashboard/users?openDialog=true&userId=${userId}`,
            priority: isNewUser ? "HIGH" : "MEDIUM",
          },
          channels: {
            inApp: true,
            email: true,
          },
        });
      }
    } catch (error) {
      console.error("Error sending user registration notification:", error);
    }
  }

  static async notifyUserUpdate(userId, userData, changedFields, updatedById) {
    try {
      const recipients = [];

      // Notify the user if someone else updated them
      if (userId !== updatedById) {
        recipients.push(userId);
      }

      // Notify manager if manager changed
      if (changedFields.managerId) {
        recipients.push(changedFields.managerId);

        // Notify old manager too if different
        if (
          userData.managerId &&
          userData.managerId !== changedFields.managerId
        ) {
          recipients.push(userData.managerId);
        }
      }

      // Create update summary
      const changes = Object.keys(changedFields);
      const changeDescription = changes.includes("designation")
        ? `role updated to ${changedFields.designation || userData.designation}`
        : changes.includes("managerId")
          ? "manager assignment updated"
          : "profile information updated";

      for (const recipient of recipients) {
        const isUser = recipient === userId;

        await notificationService.createNotification({
          recipient,
          sender: updatedById,
          type: "USER_UPDATED",
          title: isUser ? "Your Profile Updated" : "Team Member Updated",
          message: isUser
            ? `Your ${changeDescription} by management.`
            : `${userData.name}'s ${changeDescription}.`,
          metadata: {
            userId,
            userName: userData.name,
            changes: changedFields,
            actionUrl: isUser ? "/dashboard/profile" : `/dashboard/users?openDialog=true&userId=${userId}&mode=view`,
            priority: "MEDIUM",
          },
          channels: {
            inApp: true,
            email:
              changes.includes("designation") || changes.includes("managerId"),
          },
        });
      }
    } catch (error) {
      console.error("Error sending user update notification:", error);
    }
  }

  static async notifyRoleChange(
    userId,
    userData,
    addedRoles,
    removedRoles,
    changedById
  ) {
    try {
      const recipients = [userId];

      // Notify manager if exists
      if (userData.managerId && userData.managerId !== changedById) {
        recipients.push(userData.managerId);
      }

      const roleChanges = [];
      if (addedRoles.length > 0) {
        roleChanges.push(`Added: ${addedRoles.join(", ")}`);
      }
      if (removedRoles.length > 0) {
        roleChanges.push(`Removed: ${removedRoles.join(", ")}`);
      }

      for (const recipient of recipients) {
        const isUser = recipient === userId;

        await notificationService.createNotification({
          recipient,
          sender: changedById,
          type: "USER_ROLE_CHANGED",
          title: isUser ? "Your Roles Updated" : "Team Member Role Changed",
          message: isUser
            ? `Your system roles have been updated. ${roleChanges.join(". ")}.`
            : `${userData.name}'s roles updated: ${roleChanges.join(". ")}.`,
          metadata: {
            userId,
            userName: userData.name,
            addedRoles,
            removedRoles,
            actionUrl: isUser ? "/dashboard/profile" : `/dashboard/users?openDialog=true&userId=${userId}&mode=view`,
            priority: "HIGH",
          },
          channels: {
            inApp: true,
            email: true,
          },
        });
      }
    } catch (error) {
      console.error("Error sending role change notification:", error);
    }
  }
}

export default NotificationHelper;

// Export individual functions for direct import
export const notifyLeadAssigned = NotificationHelper.notifyLeadAssigned;
export const notifyLeadStatusUpdate = NotificationHelper.notifyLeadStatusUpdate;
export const notifyCabBookingRequest =
  NotificationHelper.notifyCabBookingRequest;
export const notifyCabBookingStatusChange =
  NotificationHelper.notifyCabBookingStatusChange;
export const notifyCabBookingVendorAssignment =
  NotificationHelper.notifyCabBookingVendorAssignment;
export const notifyUserRegistration = NotificationHelper.notifyUserRegistration;
export const notifyUserUpdate = NotificationHelper.notifyUserUpdate;
export const notifyRoleChange = NotificationHelper.notifyRoleChange;
export const notifyRoleCreated = NotificationHelper.notifyRoleCreated;
export const notifyRoleUpdated = NotificationHelper.notifyRoleUpdated;
export const notifyMOUStatusChange = NotificationHelper.notifyMOUStatusChange;
