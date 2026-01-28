import Notification from "../be/models/Notification.js";
import Employee from "../be/models/Employee.js";

/**
 * Notification cleanup worker to handle:
 * - Expired notifications
 * - Read notifications past retention
 * - Superseded notifications
 * - Invalid notifications (orphaned)
 * - Auto-archiving old notifications
 */

class NotificationCleanupService {
  // Main cleanup orchestrator
  async runCleanupTasks() {
    try {
      console.log("Starting notification cleanup tasks...");

      const results = await Promise.allSettled([
        this.cleanupExpiredNotifications(),
        this.cleanupReadNotifications(),
        this.cleanupSupersededNotifications(),
        this.cleanupInvalidNotifications(),
        this.archiveOldNotifications(),
        this.cleanupOrphanedNotifications(),
      ]);

      results.forEach((result, index) => {
        const taskNames = [
          "expired notifications",
          "read notifications",
          "superseded notifications",
          "invalid notifications",
          "old notifications archiving",
          "orphaned notifications",
        ];

        if (result.status === "rejected") {
          console.error(
            `Failed to cleanup ${taskNames[index]}:`,
            result.reason
          );
        } else {
          console.log(`Successfully cleaned ${taskNames[index]}`);
        }
      });

      console.log("Notification cleanup completed");
    } catch (error) {
      console.error("Error in cleanup orchestrator:", error);
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const expired = await Notification.find({
        "timeRules.expiresAt": { $lt: new Date() },
        "cleanupRules.canAutoDelete": true,
      });

      if (expired.length === 0) {
        return { deletedCount: 0 };
      }

      console.log(`Cleaning up ${expired.length} expired notifications`);

      const result = await Notification.deleteMany({
        _id: { $in: expired.map((n) => n._id) },
      });

      console.log(`Deleted ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error("Error cleaning up expired notifications:", error);
      throw error;
    }
  }

  // Clean up read notifications past their retention period
  async cleanupReadNotifications() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 days default

      const result = await Notification.deleteMany({
        "lifecycle.status": "READ",
        "lifecycle.readAt": { $lt: cutoffDate },
        "cleanupRules.canAutoDelete": true,
        "cleanupRules.preserveIfActionable": false,
      });

      console.log(`Deleted ${result.deletedCount} old read notifications`);
      return result;
    } catch (error) {
      console.error("Error cleaning up read notifications:", error);
      throw error;
    }
  }

  // Clean up superseded notifications
  async cleanupSupersededNotifications() {
    try {
      const superseded = await Notification.find({
        "lifecycle.archivedReason": "SUPERSEDED",
        "lifecycle.archivedAt": {
          $lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day old
        },
      });

      if (superseded.length === 0) {
        return { deletedCount: 0 };
      }

      const result = await Notification.deleteMany({
        _id: { $in: superseded.map((n) => n._id) },
      });

      console.log(`Deleted ${result.deletedCount} superseded notifications`);
      return result;
    } catch (error) {
      console.error("Error cleaning up superseded notifications:", error);
      throw error;
    }
  }

  // Clean up notifications for deleted entities
  async cleanupInvalidNotifications() {
    try {
      let totalDeleted = 0;

      // Clean up lead notifications where lead no longer exists
      const leadNotifications = await Notification.find({
        "metadata.leadId": { $exists: true },
      }).populate("metadata.leadId");

      const invalidLeadNotifications = leadNotifications.filter(
        (n) => !n.metadata.leadId
      );

      if (invalidLeadNotifications.length > 0) {
        const result = await Notification.deleteMany({
          _id: { $in: invalidLeadNotifications.map((n) => n._id) },
        });
        totalDeleted += result.deletedCount;
        console.log(
          `Deleted ${result.deletedCount} invalid lead notifications`
        );
      }

      // Clean up cab booking notifications where booking no longer exists
      const cabNotifications = await Notification.find({
        "metadata.cabBookingId": { $exists: true },
      }).populate("metadata.cabBookingId");

      const invalidCabNotifications = cabNotifications.filter(
        (n) => !n.metadata.cabBookingId
      );

      if (invalidCabNotifications.length > 0) {
        const result = await Notification.deleteMany({
          _id: { $in: invalidCabNotifications.map((n) => n._id) },
        });
        totalDeleted += result.deletedCount;
        console.log(
          `Deleted ${result.deletedCount} invalid cab booking notifications`
        );
      }

      // Clean up user notifications where user no longer exists
      const userNotifications = await Notification.find({
        "metadata.userId": { $exists: true },
      }).populate("metadata.userId");

      const invalidUserNotifications = userNotifications.filter(
        (n) => !n.metadata.userId
      );

      if (invalidUserNotifications.length > 0) {
        const result = await Notification.deleteMany({
          _id: { $in: invalidUserNotifications.map((n) => n._id) },
        });
        totalDeleted += result.deletedCount;
        console.log(
          `Deleted ${result.deletedCount} invalid user notifications`
        );
      }

      return { deletedCount: totalDeleted };
    } catch (error) {
      console.error("Error cleaning up invalid notifications:", error);
      throw error;
    }
  }

  // Archive very old notifications
  async archiveOldNotifications() {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 30); // 30 days

      const result = await Notification.updateMany(
        {
          createdAt: { $lt: cutoffDate },
          "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
          "cleanupRules.preserveIfUnread": false,
        },
        {
          "lifecycle.status": "ARCHIVED",
          "lifecycle.archivedReason": "AUTO_EXPIRED",
          "lifecycle.archivedAt": new Date(),
          "timeRules.expiresAt": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days to delete
        }
      );

      console.log(`Archived ${result.modifiedCount} old notifications`);
      return result;
    } catch (error) {
      console.error("Error archiving old notifications:", error);
      throw error;
    }
  }

  // Clean up orphaned notifications (recipients no longer exist)
  async cleanupOrphanedNotifications() {
    try {
      const allNotifications = await Notification.find({
        recipient: { $exists: true },
      }).populate("recipient");

      const orphanedNotifications = allNotifications.filter(
        (n) => !n.recipient
      );

      if (orphanedNotifications.length === 0) {
        return { deletedCount: 0 };
      }

      console.log(
        `Found ${orphanedNotifications.length} orphaned notifications`
      );

      const result = await Notification.deleteMany({
        _id: { $in: orphanedNotifications.map((n) => n._id) },
      });

      console.log(`Deleted ${result.deletedCount} orphaned notifications`);
      return result;
    } catch (error) {
      console.error("Error cleaning up orphaned notifications:", error);
      throw error;
    }
  }

  // Apply user-specific retention preferences
  async applyUserRetentionPreferences(userId) {
    try {
      const user = await Employee.findById(userId);
      const prefs = user.notificationPreferences?.retention;

      if (!prefs) return { modifiedCount: 0 };

      console.log(`Applying retention preferences for user ${userId}`);

      // Apply user-specific retention for read notifications
      const readCutoff = new Date();
      readCutoff.setDate(readCutoff.getDate() - prefs.keepReadNotifications);

      const readResult = await Notification.updateMany(
        {
          recipient: userId,
          "lifecycle.status": "READ",
          "lifecycle.readAt": { $lt: readCutoff },
        },
        {
          "timeRules.expiresAt": new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day to cleanup
        }
      );

      // Apply user-specific retention for unread notifications
      const unreadCutoff = new Date();
      unreadCutoff.setDate(
        unreadCutoff.getDate() - prefs.keepUnreadNotifications
      );

      const unreadResult = await Notification.updateMany(
        {
          recipient: userId,
          "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
          createdAt: { $lt: unreadCutoff },
          "cleanupRules.preserveIfUnread": false,
        },
        {
          "lifecycle.status": "ARCHIVED",
          "lifecycle.archivedReason": "USER_PREFERENCE",
          "timeRules.expiresAt": new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        }
      );

      console.log(
        `Applied retention: ${readResult.modifiedCount} read, ${unreadResult.modifiedCount} unread`
      );

      return {
        modifiedCount: readResult.modifiedCount + unreadResult.modifiedCount,
      };
    } catch (error) {
      console.error("Error applying user retention preferences:", error);
      throw error;
    }
  }

  // Get cleanup statistics
  async getCleanupStats() {
    try {
      const [
        totalNotifications,
        expiredCount,
        oldReadCount,
        supersededCount,
        orphanedCount,
        archivableCount,
      ] = await Promise.all([
        Notification.countDocuments(),
        Notification.countDocuments({
          "timeRules.expiresAt": { $lt: new Date() },
          "cleanupRules.canAutoDelete": true,
        }),
        Notification.countDocuments({
          "lifecycle.status": "READ",
          "lifecycle.readAt": {
            $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          "cleanupRules.canAutoDelete": true,
          "cleanupRules.preserveIfActionable": false,
        }),
        Notification.countDocuments({
          "lifecycle.archivedReason": "SUPERSEDED",
          "lifecycle.archivedAt": {
            $lt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        }),
        Notification.countDocuments({
          recipient: { $exists: true },
        }).then(async (total) => {
          const validRecipients = await Employee.countDocuments();
          // This is an approximation; actual orphaned count requires population
          return Math.max(0, total - validRecipients);
        }),
        Notification.countDocuments({
          createdAt: {
            $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
          "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
          "cleanupRules.preserveIfUnread": false,
        }),
      ]);

      return {
        totalNotifications,
        cleanupCandidates: {
          expired: expiredCount,
          oldRead: oldReadCount,
          superseded: supersededCount,
          orphaned: orphanedCount,
          archivable: archivableCount,
        },
        totalCleanupCandidates:
          expiredCount + oldReadCount + supersededCount + orphanedCount,
      };
    } catch (error) {
      console.error("Error getting cleanup stats:", error);
      throw error;
    }
  }
}

// Export job handler for the worker
export default async function notificationCleanupJob(job) {
  try {
    const cleanupService = new NotificationCleanupService();
    const { action = "all", userId } = job.data;

    switch (action) {
      case "all":
        await cleanupService.runCleanupTasks();
        break;
      case "expired":
        await cleanupService.cleanupExpiredNotifications();
        break;
      case "read":
        await cleanupService.cleanupReadNotifications();
        break;
      case "user_retention":
        if (userId) {
          await cleanupService.applyUserRetentionPreferences(userId);
        }
        break;
      case "stats":
        return await cleanupService.getCleanupStats();
      default:
        throw new Error(`Unknown cleanup action: ${action}`);
    }

    console.log(`Notification cleanup job completed: ${action}`);
  } catch (error) {
    console.error("Notification cleanup job failed:", error);
    throw error;
  }
}

export { NotificationCleanupService };
