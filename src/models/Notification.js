import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "LEAD_ASSIGNED",
        "LEAD_STATUS_UPDATE",
        "LEAD_FOLLOWUP_DUE",
        "CAB_BOOKING_APPROVED",
        "CAB_BOOKING_REJECTED",
        "CAB_BOOKING_ASSIGNED",
        "CAB_BOOKING_REQUEST",
        "VENDOR_BOOKING_UPDATE",
        "VENDOR_ASSIGNED",
        "MOU_APPROVED",
        "MOU_REJECTED",
        "MOU_PENDING",
        "USER_ROLE_CHANGED",
        "USER_UPDATED",
        "USER_WELCOME",
        "USER_ASSIGNED",
        "NEW_USER_ADDED",
        "ROLE_CREATED",
        "ROLE_UPDATED",
        "PROPERTY_UPLOADED",
        "PROPERTY_STATUS_UPDATE",
        "SYSTEM_ANNOUNCEMENT",
        "REMINDER",
        "BULK_UPLOAD_COMPLETE",
        "EMAIL_SENT",
      ],
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      maxlength: 1000,
    },

    // Enhanced lifecycle management
    lifecycle: {
      status: {
        type: String,
        enum: ["PENDING", "DELIVERED", "READ", "ARCHIVED", "EXPIRED"],
        default: "PENDING",
        index: true,
      },

      // Read tracking
      readAt: Date,
      readFromDevice: {
        type: String,
        enum: ["WEB", "MOBILE", "EMAIL"],
        default: null,
      },
      readFromIP: String,

      // Action tracking
      actionTaken: {
        type: Boolean,
        default: false,
      },
      actionTakenAt: Date,
      actionType: {
        type: String,
        enum: ["CLICKED", "DISMISSED", "ACTED_UPON", "IGNORED"],
        default: null,
      },

      // Delivery tracking
      deliveredAt: Date,
      deliveryAttempts: { type: Number, default: 0 },
      lastDeliveryAttempt: Date,

      // Archive/cleanup tracking
      archivedAt: Date,
      archivedReason: {
        type: String,
        enum: ["USER_ARCHIVED", "AUTO_EXPIRED", "BULK_CLEANUP", "SUPERSEDED"],
        default: null,
      },
    },

    // Time-based lifecycle rules
    timeRules: {
      expiresAt: {
        type: Date,
      },
      autoArchiveAfter: {
        type: Number, // Days after creation
        default: 30,
      },
      deleteAfterRead: {
        type: Number, // Days after being read
        default: 7,
      },
      urgentExpiryHours: {
        type: Number, // For urgent notifications
        default: 24,
      },
    },

    // Smart cleanup flags
    cleanupRules: {
      canAutoDelete: {
        type: Boolean,
        default: true,
      },
      preserveIfUnread: {
        type: Boolean,
        default: true,
      },
      preserveIfActionable: {
        type: Boolean,
        default: true,
      },
      supersededBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
        default: null,
      },
    },

    metadata: {
      leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead" },
      cabBookingId: { type: mongoose.Schema.Types.ObjectId, ref: "CabBooking" },
      vendorBookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VendorBooking",
      },
      propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
      actionUrl: String,
      priority: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
        default: "MEDIUM",
      },

      // Context for smart cleanup
      entityStatus: String, // Status of related entity
      isActionable: {
        type: Boolean,
        default: true,
      },
      relatedNotifications: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Notification",
        },
      ],
    },

    // Delivery channels
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      push: { type: Boolean, default: false }, // Future implementation
    },

    // Email delivery status
    emailSent: { type: Boolean, default: false },
    emailSentAt: Date,
    emailError: String,
    emailErrorCode: String,
    emailMessageId: String,
    emailResponse: String,
    lastEmailAttempt: Date,
    emailRetryCount: { type: Number, default: 0 },

    // Scheduling
    scheduledFor: Date, // For delayed notifications
  },
  {
    timestamps: true,
    collection: "notifications",
  }
);

// TTL index for automatic cleanup
notificationSchema.index(
  { "timeRules.expiresAt": 1 },
  { expireAfterSeconds: 0 }
);

// Compound indexes for efficient queries
notificationSchema.index({
  recipient: 1,
  "lifecycle.status": 1,
  "metadata.priority": 1,
  createdAt: -1,
});

notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({
  recipient: 1,
  "lifecycle.status": 1,
  createdAt: -1,
});

// Pre-save middleware to set cleanup rules and expiry
notificationSchema.pre("save", function (next) {
  if (this.isNew) {
    // Set default expiry based on type and priority
    const expiryDays = this.getExpiryDays();
    this.timeRules.expiresAt = new Date(
      Date.now() + expiryDays * 24 * 60 * 60 * 1000
    );

    // Set default cleanup rules based on notification type
    const cleanupRules = this.getCleanupRules();
    Object.assign(this.cleanupRules, cleanupRules);

    this.lifecycle.deliveredAt = new Date();
    this.lifecycle.status = "DELIVERED";
  }
  next();
});

// Instance method to get expiry days based on type and priority
notificationSchema.methods.getExpiryDays = function () {
  let days = 30; // default

  switch (this.type) {
    case "LEAD_FOLLOWUP_DUE":
      days = this.metadata.priority === "URGENT" ? 1 : 7;
      break;
    case "CAB_BOOKING_APPROVED":
    case "CAB_BOOKING_REJECTED":
      days = 3;
      break;
    case "SYSTEM_ANNOUNCEMENT":
      days = 7;
      break;
    case "USER_ROLE_CHANGED":
      days = 90; // Keep longer for audit
      break;
    case "LEAD_ASSIGNED":
    case "VENDOR_ASSIGNED":
      days = 14;
      break;
    default:
      days = 30;
  }

  // Adjust based on priority
  switch (this.metadata.priority) {
    case "URGENT":
      days = Math.min(days, 3);
      break;
    case "LOW":
      days = Math.min(days, 7);
      break;
  }

  return days;
};

// Instance method to get cleanup rules based on type
notificationSchema.methods.getCleanupRules = function () {
  const rules = {
    canAutoDelete: true,
    preserveIfUnread: true,
    preserveIfActionable: false,
  };

  switch (this.type) {
    case "LEAD_ASSIGNED":
    case "VENDOR_ASSIGNED":
      rules.preserveIfActionable = true;
      break;
    case "USER_ROLE_CHANGED":
      rules.canAutoDelete = false; // Important for audit
      break;
    case "SYSTEM_ANNOUNCEMENT":
      rules.preserveIfUnread = false;
      break;
    case "CAB_BOOKING_APPROVED":
    case "CAB_BOOKING_REJECTED":
      rules.preserveIfActionable = false;
      break;
  }

  return rules;
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function (userId) {
  try {
    // Ensure userId is properly handled regardless of string or ObjectId input
    // const mongoose = require("mongoose"); // Removed: using imported mongoose
    let recipientId;

    if (typeof userId === "string") {
      recipientId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;
    } else {
      recipientId = userId;
    }

    const query = {
      recipient: recipientId,
      "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
    };

    const count = await this.countDocuments(query);
    return count;
  } catch (error) {
    console.error("Error in getUnreadCount:", error);
    throw error;
  }
};

// Static method to mark notifications as read
notificationSchema.statics.markAsRead = async function (
  notificationIds,
  userId,
  context = {}
) {
  const updateData = {
    "lifecycle.status": "READ",
    "lifecycle.readAt": new Date(),
    "lifecycle.readFromDevice": context.device || "WEB",
    "lifecycle.readFromIP": context.ipAddress,
    "lifecycle.actionType": context.actionType || "VIEWED",
  };

  return this.updateMany(
    {
      _id: { $in: notificationIds },
      recipient: userId,
      "lifecycle.status": { $in: ["PENDING", "DELIVERED"] },
    },
    updateData
  );
};

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
