import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import { sendNotificationEmail as sendEmail } from "../email-service/notification-email/notificationEmail.js";
import { sendFollowUpEmail } from "../email-service/follow-up-email/followUpEmail.js";

// Job handler for sending notification emails
export default async function sendNotificationEmail(job) {
  console.log(`📥 [Worker] Processing email job for notification: ${job.data.notificationId}`);
  const timeoutDuration = 30000; // 30 seconds timeout

  try {
    // Wrap the entire operation in a timeout
    const result = await Promise.race([
      sendEmailNotification(job),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Email sending timeout")),
          timeoutDuration
        )
      ),
    ]);

    return result;
  } catch (error) {
    console.error("Error sending notification email:", error.message);

    // Update notification with error (but don't throw to avoid job retry loops)
    if (job.data.notificationId) {
      try {
        await Notification.findByIdAndUpdate(job.data.notificationId, {
          emailError: error.message,
        });
      } catch (updateError) {
        console.error(
          "Failed to update notification error:",
          updateError.message
        );
      }
    }

    // Don't throw for timeout errors to prevent job retry loops
    if (error.message.includes("timeout") || error.code === "ETIMEDOUT") {
      console.log("Email timeout - marking job as completed to avoid retry");
      return; // Complete job without throwing
    }

    throw error; // Throw for other types of errors
  }
}

async function sendEmailNotification(job) {
  try {
    const { notificationId } = job.data;
    console.log(`📧 [EmailWorker] Fetching notification: ${notificationId}`);

    // Get notification with populated data
    const notification = await Notification.findById(notificationId)
      .populate("recipient", "name email notificationPreferences")
      .populate("sender", "name email");

    if (!notification) {
      console.error("Notification not found:", notificationId);
      return;
    }

    // Check if email should be sent
    if (!notification.channels.email) {
      console.log("Email not enabled for notification:", notificationId);
      return;
    }

    // Check user's email preferences
    const recipient = notification.recipient;
    const category = getNotificationCategory(notification.type);

    if (recipient.notificationPreferences?.email?.[category] === false) {
      console.log("User has disabled email for category:", category);
      return;
    }

    // Send email using appropriate template
    if (notification.type === "LEAD_FOLLOWUP_DUE") {
      await sendFollowUpEmail(recipient.email, notification);
    } else {
      await sendEmail(recipient.email, notification);
    }

    // Update notification status
    await Notification.findByIdAndUpdate(notificationId, {
      emailSent: true,
      emailSentAt: new Date(),
    });

    console.log("Email notification sent successfully:", notificationId);
  } catch (error) {
    console.error("Error in sendEmailNotification:", error);
    throw error; // Will be caught by the main function
  }
}

function getNotificationCategory(type) {
  const categoryMap = {
    LEAD_ASSIGNED: "leads",
    LEAD_STATUS_UPDATE: "leads",
    LEAD_FOLLOWUP_DUE: "leads",
    CAB_BOOKING_APPROVED: "cabBooking",
    CAB_BOOKING_REJECTED: "cabBooking",
    CAB_BOOKING_ASSIGNED: "cabBooking",
    CAB_BOOKING_REQUEST: "cabBooking",
    VENDOR_BOOKING_UPDATE: "vendor",
    VENDOR_ASSIGNED: "vendor",
    MOU_APPROVED: "system",
    MOU_REJECTED: "system",
    MOU_PENDING: "system",
    USER_ROLE_CHANGED: "system",
    NEW_USER_ADDED: "system",
    PROPERTY_UPLOADED: "system",
    PROPERTY_STATUS_UPDATE: "system",
    SYSTEM_ANNOUNCEMENT: "system",
    REMINDER: "system",
  };

  return categoryMap[type] || "system";
}


