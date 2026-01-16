import { Service } from "@framework";
import Notification from "../../models/Notification.js";
import Employee from "../../models/Employee.js";
import { leadQueue } from "../../queue/leadQueue.js";

const UNREAD_STATUS = ["PENDING", "DELIVERED"];

class NotificationService extends Service {
  constructor() {
    super();
  }

  // GET /api/v0/notifications - Get user notifications
  async getUserNotifications(req, res) {
    try {
      const { employee } = req;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const {
        page = "1",
        limit = "20",
        status,
        type,
        priority,
        fromDate,
        toDate,
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
      };

      if (status && status !== "undefined") options.status = status;
      if (type && type !== "undefined") options.type = type;
      if (priority && priority !== "undefined") options.priority = priority;
      if (fromDate && fromDate !== "undefined")
        options.fromDate = new Date(fromDate);
      if (toDate && toDate !== "undefined") options.toDate = new Date(toDate);

      const result = await this._fetchUserNotifications(employee._id, options);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notifications",
      });
    }
  }

  // POST /api/v0/notifications - Create notification
  async createNotification(req, res) {
    try {
      const { employee } = req;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const notificationData = {
        ...req.body,
        sender: employee._id,
      };

      const notification = await this._createSingleNotification(
        notificationData
      );

      return res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error("Create notification error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create notification",
      });
    }
  }

  // GET /api/v0/notifications/[id] - Get single notification
  async getNotificationById(req, res) {
    try {
      const { employee } = req;
      const { id } = req.query;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const result = await this._fetchUserNotifications(employee._id, {
        page: 1,
        limit: 1,
      });

      const notification = result.notifications.find(
        (n) => n._id.toString() === id
      );

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: "Notification not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      console.error("Get notification error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch notification",
      });
    }
  }

  // PUT /api/v0/notifications/[id] - Update notification
  async updateNotification(req, res) {
    try {
      const { employee } = req;
      const { id } = req.query;
      const { action, context } = req.body;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (action === "mark_read") {
        await this._markNotificationsAsRead([id], employee._id, context);
      } else if (action === "archive") {
        await this._archiveNotifications([id], employee._id);
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid action specified",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Notification updated successfully",
      });
    } catch (error) {
      console.error("Update notification error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update notification",
      });
    }
  }

  // DELETE /api/v0/notifications/[id] - Delete notification
  async deleteNotification(req, res) {
    try {
      const { employee } = req;
      const { id } = req.query;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      await this._deleteNotifications([id], employee._id);

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Delete notification error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
      });
    }
  }

  // POST /api/v0/notifications/bulk - Bulk operations
  async bulkOperation(req, res) {
    try {
      const { employee } = req;
      const { notificationIds, action = "read", context = {} } = req.body;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
          success: false,
          message: "Invalid notification IDs provided",
        });
      }

      let result;
      switch (action) {
        case "read":
          result = await this._markNotificationsAsRead(
            notificationIds,
            employee._id,
            context
          );
          break;
        case "archive":
          result = await this._archiveNotifications(
            notificationIds,
            employee._id
          );
          break;
        case "delete":
          result = await this._deleteNotifications(
            notificationIds,
            employee._id
          );
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid action specified",
          });
      }

      return res.status(200).json({
        success: true,
        message: `Notifications ${action} successfully`,
        data: {
          modifiedCount: result.modifiedCount || result.deletedCount,
        },
      });
    } catch (error) {
      console.error("Bulk operation API error:", error);
      return res.status(500).json({
        success: false,
        message: `Failed to ${req.body.action || "process"} notifications`,
      });
    }
  }

  // POST /api/v0/notifications/mark-all-read - Mark all as read
  async markAllAsRead(req, res) {
    try {
      const { employee } = req;
      const { filters = {} } = req.body;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const result = await this._markAllNotificationsAsRead(
        employee._id,
        filters
      );

      return res.status(200).json({
        success: true,
        message: "All notifications marked as read",
        data: {
          modifiedCount: result.modifiedCount,
        },
      });
    } catch (error) {
      console.error("Mark all read API error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notifications as read",
      });
    }
  }

  // GET /api/v0/notifications/stats - Get notification stats
  async getNotificationStats(req, res) {
    try {
      const { employee } = req;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const stats = await this._fetchNotificationStats(employee._id);

      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Notification stats API error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get notification statistics",
      });
    }
  }

  // GET /api/v0/notifications/unread-count - Get unread count
  async getUnreadCount(req, res) {
    try {
      const { employee } = req;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const unreadCount = await this._fetchUnreadCount(employee._id);

      return res.status(200).json({
        success: true,
        data: {
          unreadCount,
        },
      });
    } catch (error) {
      console.error("Unread count API error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to get unread count",
      });
    }
  }

  // GET /api/v0/notifications/simple - Simple notification endpoint (test/demo)
  async getSimpleNotifications(req, res) {
    try {
      const { employee } = req;

      if (!employee) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Simple notification endpoint working",
        data: {
          notifications: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            pages: 0,
          },
        },
      });
    } catch (error) {
      console.error("Simple notification error:", error);
      return res.status(500).json({
        success: false,
        message: "Simple notification failed",
      });
    }
  }

  // ========== Private Helper Methods ==========

  async _fetchUserNotifications(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      priority,
      fromDate,
      toDate,
    } = options;
    const query = { recipient: userId };

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

  async _createSingleNotification(data) {
    const recipient = await Employee.findById(data.recipient);
    if (!recipient) throw new Error("Recipient not found");

    const existing = await this._findDuplicateNotification(data);
    if (existing) return existing;

    const notification = await new Notification({
      ...data,
      metadata: data.metadata || {},
      channels: { inApp: true, email: false, ...data.channels },
    }).save();

    if (notification.channels.email)
      this._scheduleEmailNotification(notification);
    if (notification.channels.inApp && !data.scheduledFor)
      this._deliverRealtimeNotification(notification);

    return notification;
  }

  async _createBulkNotification(recipients, data) {
    const validRecipients = await Employee.find({
      _id: { $in: recipients },
    }).select("_id");
    return Promise.all(
      validRecipients.map((r) =>
        this._createSingleNotification({ ...data, recipient: r._id.toString() })
      )
    );
  }

  async _markNotificationsAsRead(notificationIds, userId, context = {}) {
    const result = await Notification.markAsRead(
      notificationIds,
      userId,
      context
    );
    this._checkSupersededNotifications(notificationIds);
    return result;
  }

  async _markAllNotificationsAsRead(userId, filters = {}) {
    const query = {
      recipient: userId,
      "lifecycle.status": { $in: UNREAD_STATUS },
    };
    if (filters.type) query.type = filters.type;
    if (filters.beforeDate) query.createdAt = { $lt: filters.beforeDate };

    const notifications = await Notification.find(query).select("_id");
    return notifications.length > 0
      ? this._markNotificationsAsRead(
          notifications.map((n) => n._id.toString()),
          userId
        )
      : { modifiedCount: 0 };
  }

  async _fetchUnreadCount(userId) {
    return Notification.getUnreadCount(userId);
  }

  async _archiveNotifications(
    notificationIds,
    userId,
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

  async _deleteNotifications(notificationIds, userId) {
    return Notification.deleteMany({
      _id: { $in: notificationIds },
      recipient: userId,
      "cleanupRules.canAutoDelete": true,
    });
  }

  async _fetchNotificationStats(userId) {
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

  async _findDuplicateNotification(data) {
    const query = {
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

  async _scheduleEmailNotification(notification) {
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

  async _deliverRealtimeNotification(notification) {
    // Realtime notification delivery logic (websockets, SSE, etc.)
  }

  async _checkSupersededNotifications(readNotificationIds) {
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

  async getNotificationRecipients(type, metadata, triggeredBy) {
    let recipients = [];

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

export default NotificationService;
