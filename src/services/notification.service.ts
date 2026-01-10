import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import { leadQueue } from "../queue/leadQueue.js";
import pushService from "./push.service";

export interface NotificationData {
  recipient: string;
  sender?: string;
  type: string;
  title: string;
  message: string;
  metadata?: {
    leadId?: string;
    cabBookingId?: string;
    vendorBookingId?: string;
    propertyId?: string;
    userId?: string;
    actionUrl?: string;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    entityStatus?: string;
    isActionable?: boolean;
  };
  channels?: {
    inApp?: boolean;
    email?: boolean;
    push?: boolean;
  };
  scheduledFor?: Date;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  fromDate?: Date;
  toDate?: Date;
}

class NotificationService {
  // Create and send notification
  async createNotification(data: NotificationData) {
    try {
      // Validate recipient exists
      const recipient = await Employee.findById(data.recipient);
      if (!recipient) {
        throw new Error("Recipient not found");
      }

      // Check if similar notification already exists (prevent duplicates)
      const existing = await this.findDuplicateNotification(data);
      if (existing) {
        return existing;
      }

      // Create notification
      const notification = new Notification({
        recipient: data.recipient,
        sender: data.sender,
        type: data.type,
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        channels: {
          inApp: true,
          email: false,
          push: false,
          ...data.channels,
        },
        scheduledFor: data.scheduledFor,
      });

      await notification.save();

      // Handle email notifications if enabled
      if (notification.channels.email) {
        await this.scheduleEmailNotification(notification);
      }

      // Handle real-time delivery
      if (notification.channels.inApp && !data.scheduledFor) {
        await this.deliverRealtimeNotification(notification);
      }

      // Handle push notifications if enabled
      if (notification.channels.push && !data.scheduledFor) {
        await this.sendPushNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Create bulk notifications (for announcements)
  async createBulkNotification(
    recipients: string[],
    data: Omit<NotificationData, "recipient">
  ) {
    try {
      const notifications = [];

      // Validate all recipients exist
      const validRecipients = await Employee.find({
        _id: { $in: recipients },
      }).select("_id");

      const validRecipientIds = validRecipients.map((r) => r._id.toString());

      for (const recipientId of validRecipientIds) {
        const notification = await this.createNotification({
          ...data,
          recipient: recipientId,
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Error creating bulk notifications:", error);
      throw error;
    }
  }

  // Get user notifications with pagination and filters
  async getUserNotifications(userId: string, options: QueryOptions = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        type,
        priority,
        fromDate,
        toDate,
      } = options;

      // Convert string userId to ObjectId
      const query: any = {
        recipient: userId,
      };

      // Apply filters
      if (status) {
        if (status === "unread") {
          query["lifecycle.status"] = { $in: ["PENDING", "DELIVERED"] };
        } else {
          query["lifecycle.status"] = status.toUpperCase();
        }
      }

      if (type) query.type = type;
      if (priority) query["metadata.priority"] = priority.toUpperCase();

      if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = fromDate;
        if (toDate) query.createdAt.$lte = toDate;
      }

      // Execute query with pagination
      const notifications = await Notification.find(query)
        .populate("sender", "name email")
        // Sort by createdAt descending (newest first)
        // Priority sorting is removed because string comparison (HIGH < LOW) is incorrect
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await Notification.countDocuments(query);

      return {
        notifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  // Mark notifications as read
  async markAsRead(notificationIds: string[], userId: string, context = {}) {
    try {
      const result = await Notification.markAsRead(
        notificationIds,
        userId,
        context
      );

      // Check for superseded notifications
      await this.checkSupersededNotifications(notificationIds);

      return result;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string, filters = {}) {
    try {
      const query: any = {
        recipient: userId,
        "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
      };

      // Apply filters if provided
      if (filters.type) query.type = filters.type;
      if (filters.beforeDate) query.createdAt = { $lt: filters.beforeDate };

      const notifications = await Notification.find(query).select("_id");
      const notificationIds = notifications.map((n) => n._id.toString());

      if (notificationIds.length > 0) {
        return this.markAsRead(notificationIds, userId);
      }

      return { modifiedCount: 0 };
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId: string) {
    try {
      const count = await Notification.getUnreadCount(userId);
      return count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  // Archive notifications
  async archiveNotifications(
    notificationIds: string[],
    userId: string,
    reason = "USER_ARCHIVED"
  ) {
    try {
      return await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          recipient: userId,
        },
        {
          "lifecycle.status": "ARCHIVED",
          "lifecycle.archivedAt": new Date(),
          "lifecycle.archivedReason": reason,
          "timeRules.expiresAt": new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        }
      );
    } catch (error) {
      console.error("Error archiving notifications:", error);
      throw error;
    }
  }

  // Delete notifications
  async deleteNotifications(notificationIds: string[], userId: string) {
    try {
      return await Notification.deleteMany({
        _id: { $in: notificationIds },
        recipient: userId,
        "cleanupRules.canAutoDelete": true,
      });
    } catch (error) {
      console.error("Error deleting notifications:", error);
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId: string) {
    try {
      // Convert string to ObjectId if needed
      const userObjectId = userId;

      const [unreadCount, totalCount, recentCount, typeBreakdown] =
        await Promise.all([
          Notification.countDocuments({
            recipient: userObjectId,
            "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
          }),
          Notification.countDocuments({ recipient: userObjectId }),
          Notification.countDocuments({
            recipient: userObjectId,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          }),
          Notification.aggregate([
            { $match: { recipient: userObjectId } },
            { $group: { _id: "$type", count: { $sum: 1 } } },
          ]),
        ]);

      return {
        unreadCount,
        totalCount,
        recentCount,
        typeBreakdown,
      };
    } catch (error) {
      console.error("Error getting notification stats:", error);
      throw error;
    }
  }

  // Helper: Find duplicate notifications
  private async findDuplicateNotification(data: NotificationData) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const query: any = {
      recipient: data.recipient,
      type: data.type,
      title: data.title,
      createdAt: { $gte: fiveMinutesAgo },
      "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
    };

    // Add metadata matching for specific types
    if (data.metadata?.leadId) {
      query["metadata.leadId"] = data.metadata.leadId;
    }
    if (data.metadata?.cabBookingId) {
      query["metadata.cabBookingId"] = data.metadata.cabBookingId;
    }
    if (data.metadata?.roleId) {
      query["metadata.roleId"] = data.metadata.roleId;
    }

    return await Notification.findOne(query);
  }

  // Helper: Schedule email notifications
  private async scheduleEmailNotification(notification: any) {
    try {
      // Check if leadQueue is available
      if (!leadQueue) {
        console.warn("Queue not available, skipping email scheduling");
        return;
      }

      // Add timeout protection for Redis operations
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis operation timeout")), 5000)
      );

      const schedulePromise = leadQueue.add("sendNotificationEmail", {
        notificationId: notification._id.toString(),
      });

      await Promise.race([schedulePromise, timeoutPromise]);
    } catch (error) {
      console.error(
        "Error scheduling email notification (non-blocking):",
        error.message
      );
      // Don't throw error to prevent notification creation from failing
      // Email can be sent later via a cleanup job
    }
  }

  // Helper: Deliver real-time notifications
  private async deliverRealtimeNotification(notification: any) {
    try {
      // Import socket service dynamically to avoid circular dependencies
      const { default: notificationSocketService } = await import(
        "./socket.service.js"
      );

      // Send real-time notification
      const delivered = await notificationSocketService.sendNotificationToUser(
        notification.recipient.toString(),
        {
          _id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          metadata: notification.metadata,
          priority: notification.metadata.priority,
          createdAt: notification.createdAt,
          lifecycle: notification.lifecycle,
        }
      );

      if (delivered) {
        console.log(
          `📱 Real-time notification delivered to user: ${notification.recipient}`
        );
      } else {
        console.log(
          `📱 User ${notification.recipient} not online, will see notification on next login`
        );
      }
    } catch (error) {
      console.error("Error delivering real-time notification:", error);
      // Don't throw error to prevent notification creation from failing
    }
  }

  // Helper: Check for superseded notifications
  private async checkSupersededNotifications(readNotificationIds: string[]) {
    try {
      const readNotifications = await Notification.find({
        _id: { $in: readNotificationIds },
      });

      for (const notification of readNotifications) {
        // Find older related notifications that might be superseded
        const supersedeCandidates = await Notification.find({
          recipient: notification.recipient,
          type: notification.type,
          "metadata.leadId": notification.metadata?.leadId,
          "metadata.cabBookingId": notification.metadata?.cabBookingId,
          "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
          createdAt: { $lt: notification.createdAt },
        });

        // Mark older related notifications as superseded
        if (supersedeCandidates.length > 0) {
          await Notification.updateMany(
            { _id: { $in: supersedeCandidates.map((n) => n._id) } },
            {
              "lifecycle.status": "ARCHIVED",
              "lifecycle.archivedReason": "SUPERSEDED",
              "cleanupRules.supersededBy": notification._id,
              "timeRules.expiresAt": new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            }
          );
        }
      }
    } catch (error) {
      console.error("Error checking superseded notifications:", error);
    }
  }

  // Get notification recipients based on type and context
  async getNotificationRecipients(
    type: string,
    metadata: any,
    triggeredBy?: string
  ): Promise<string[]> {
    try {
      let recipients: string[] = [];

      switch (type) {
        case "LEAD_ASSIGNED":
          if (metadata.leadId && metadata.assignedTo) {
            recipients.push(metadata.assignedTo);
          }
          break;

        case "CAB_BOOKING_REQUEST":
          if (metadata.employeeId) {
            // Get employee's manager
            const employee = await Employee.findById(metadata.employeeId);
            if (employee?.managerId) {
              recipients.push(employee.managerId);
            }
          }
          break;

        case "SYSTEM_ANNOUNCEMENT":
          // Get all active users
          const allUsers = await Employee.find({}).select("_id");
          recipients = allUsers.map((u) => u._id.toString());
          break;

        // Add more cases as needed
      }

      // Remove the triggering user from recipients
      if (triggeredBy) {
        recipients = recipients.filter((id) => id !== triggeredBy);
      }

      return [...new Set(recipients)]; // Remove duplicates
    } catch (error) {
      console.error("Error getting notification recipients:", error);
      return [];
    }
  }
  // Helper: Send push notifications
  private async sendPushNotification(notification: any) {
    try {
      const recipient = await Employee.findById(notification.recipient).select(
        "pushSubscriptions"
      );

      if (
        !recipient ||
        !recipient.pushSubscriptions ||
        recipient.pushSubscriptions.length === 0
      ) {
        return;
      }

      const payload = {
        title: notification.title,
        message: notification.message,
        metadata: notification.metadata,
      };

      const promises = recipient.pushSubscriptions.map(async (subscription) => {
        const result = await pushService.sendNotification(
          subscription,
          payload
        );

        if (!result.success && result.error === "SUBSCRIPTION_EXPIRED") {
          // Remove expired subscription
          await Employee.updateOne(
            { _id: recipient._id },
            {
              $pull: { pushSubscriptions: { endpoint: subscription.endpoint } },
            }
          );
        }
      });

      await Promise.all(promises);
    } catch (error) {
      console.error("Error sending push notifications:", error);
    }
  }
}

export default new NotificationService();
