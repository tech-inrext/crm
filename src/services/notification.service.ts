import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import { leadQueue } from "../queue/leadQueue.js";

export interface NotificationData {
  recipient: string;
  sender?: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, any>;
  channels?: { inApp?: boolean; email?: boolean };
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

const UNREAD_STATUS = ["PENDING", "DELIVERED"];

class NotificationService {
  async createNotification(data: NotificationData) {
    const recipient = await Employee.findById(data.recipient);
    if (!recipient) throw new Error("Recipient not found");

    const existing = await this.findDuplicateNotification(data);
    if (existing) return existing;

    const notification = await new Notification({
      ...data,
      metadata: data.metadata || {},
      channels: { inApp: true, email: false, ...data.channels },
    }).save();

    if (notification.channels.email)
      this.scheduleEmailNotification(notification);
    if (notification.channels.inApp && !data.scheduledFor)
      this.deliverRealtimeNotification(notification);

    return notification;
  }

  async createBulkNotification(
    recipients: string[],
    data: Omit<NotificationData, "recipient">
  ) {
    const validRecipients = await Employee.find({
      _id: { $in: recipients },
    }).select("_id");
    return Promise.all(
      validRecipients.map((r) =>
        this.createNotification({ ...data, recipient: r._id.toString() })
      )
    );
  }

  async getUserNotifications(userId: string, options: QueryOptions = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      fromDate,
      toDate,
    } = options;
    const query: any = { recipient: userId };

    if (status) {
      query["lifecycle.status"] =
        status === "unread" ? { $in: UNREAD_STATUS } : status.toUpperCase();
    }
    if (type) query.type = type;
    if (priority) query["metadata.priority"] = priority.toUpperCase();
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = fromDate;
      if (toDate) query.createdAt.$lte = toDate;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .select(
          "recipient sender type title message metadata lifecycle.status lifecycle.readAt lifecycle.deliveredAt createdAt"
        )
        .populate("sender", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(notificationIds: string[], userId: string, context = {}) {
    const result = await Notification.markAsRead(
      notificationIds,
      userId,
      context
    );
    this.checkSupersededNotifications(notificationIds);
    return result;
  }

  async markAllAsRead(userId: string, filters: any = {}) {
    const query: any = {
      recipient: userId,
      "lifecycle.status": { $in: UNREAD_STATUS },
    };
    if (filters.type) query.type = filters.type;
    if (filters.beforeDate) query.createdAt = { $lt: filters.beforeDate };

    const notifications = await Notification.find(query).select("_id");
    return notifications.length > 0
      ? this.markAsRead(
          notifications.map((n) => n._id.toString()),
          userId
        )
      : { modifiedCount: 0 };
  }

  async getUnreadCount(userId: string) {
    return Notification.getUnreadCount(userId);
  }

  async archiveNotifications(
    notificationIds: string[],
    userId: string,
    reason = "USER_ARCHIVED"
  ) {
    return Notification.updateMany(
      { _id: { $in: notificationIds }, recipient: userId },
      {
        "lifecycle.status": "ARCHIVED",
        "lifecycle.archivedAt": new Date(),
        "lifecycle.archivedReason": reason,
        "timeRules.expiresAt": new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      }
    );
  }

  async deleteNotifications(notificationIds: string[], userId: string) {
    return Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: userId,
      "cleanupRules.canAutoDelete": true,
    });
  }

  async getNotificationStats(userId: string) {
    const [unreadCount, totalCount, recentCount, typeBreakdown] =
      await Promise.all([
        Notification.countDocuments({
          recipient: userId,
          "lifecycle.status": { $in: UNREAD_STATUS },
        }),
        Notification.countDocuments({ recipient: userId }),
        Notification.countDocuments({
          recipient: userId,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
        Notification.aggregate([
          { $match: { recipient: userId } },
          { $group: { _id: "$type", count: { $sum: 1 } } },
        ]),
      ]);

    return { unreadCount, totalCount, recentCount, typeBreakdown };
  }

  private async findDuplicateNotification(data: NotificationData) {
    const query: any = {
      recipient: data.recipient,
      type: data.type,
      title: data.title,
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) },
      "lifecycle.status": { $in: UNREAD_STATUS },
    };

    const metadataKeys = ["leadId", "cabBookingId", "roleId"];
    metadataKeys.forEach((key) => {
      if (data.metadata?.[key]) query[`metadata.${key}`] = data.metadata[key];
    });

    return Notification.findOne(query);
  }

  private async scheduleEmailNotification(notification: any) {
    if (!leadQueue) return;

    try {
      await Promise.race([
        leadQueue.add("sendNotificationEmail", {
          notificationId: notification._id.toString(),
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Redis timeout")), 5000)
        ),
      ]);
    } catch (error) {
      console.error("Email scheduling failed (non-blocking):", error.message);
    }
  }

  private async deliverRealtimeNotification(notification: any) {}

  private async checkSupersededNotifications(readNotificationIds: string[]) {
    try {
      const readNotifications = await Notification.find({
        _id: { $in: readNotificationIds },
      });

      for (const notification of readNotifications) {
        const supersedeCandidates = await Notification.find({
          recipient: notification.recipient,
          type: notification.type,
          "metadata.leadId": notification.metadata?.leadId,
          "metadata.cabBookingId": notification.metadata?.cabBookingId,
          "lifecycle.status": { $in: UNREAD_STATUS },
          createdAt: { $lt: notification.createdAt },
        });

        if (supersedeCandidates.length > 0) {
          await Notification.updateMany(
            { _id: { $in: supersedeCandidates.map((n) => n._id) } },
            {
              "lifecycle.status": "ARCHIVED",
              "lifecycle.archivedReason": "SUPERSEDED",
              "cleanupRules.supersededBy": notification._id,
              "timeRules.expiresAt": new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
          );
        }
      }
    } catch (error) {
      console.error("Error checking superseded notifications:", error);
    }
  }

  async getNotificationRecipients(
    type: string,
    metadata: any,
    triggeredBy?: string
  ): Promise<string[]> {
    let recipients: string[] = [];

    switch (type) {
      case "LEAD_ASSIGNED":
        if (metadata.assignedTo) recipients.push(metadata.assignedTo);
        break;
      case "CAB_BOOKING_REQUEST":
        if (metadata.employeeId) {
          const employee = await Employee.findById(metadata.employeeId);
          if (employee?.managerId) recipients.push(employee.managerId);
        }
        break;
      case "SYSTEM_ANNOUNCEMENT":
        const allUsers = await Employee.find({}).select("_id");
        recipients = allUsers.map((u) => u._id.toString());
        break;
    }

    return [...new Set(recipients.filter((id) => id !== triggeredBy))];
  }
}

export default new NotificationService();
