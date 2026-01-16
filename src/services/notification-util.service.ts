/**
 * Notification Utility Service
 * This service provides backward compatibility for direct method calls
 * that don't go through the HTTP request/response cycle
 */
import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import { leadQueue } from "../queue/leadQueue.js";

const UNREAD_STATUS = ["PENDING", "DELIVERED"];

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

class NotificationUtilService {
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

  private async deliverRealtimeNotification(notification: any) {
    // Realtime notification delivery logic
  }
}

export default new NotificationUtilService();
