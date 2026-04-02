import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";
import Lead from "../models/Lead.js";
import FollowUp from "../models/FollowUp.js";
import twilio from "../whatsapp-msg-service/twilio.js";
import { sendCallReminderWhatsappMessage } from "../whatsapp-msg-service/agent-call-reminder/callReminder.js";
import { sendSiteVisitReminderWhatsappMessage } from "../whatsapp-msg-service/agent-sitevisit-reminder/siteVisitReminder.js";

// Job handler for sending notification WhatsApp messages
export default async function sendNotificationWhatsapp(job) {
  console.log(`📲 [Worker] Processing WhatsApp job for notification: ${job.data.notificationId}`);
  const timeoutDuration = 30000; // 30 seconds timeout

  try {
    // Wrap the entire operation in a timeout
    const result = await Promise.race([
      processWhatsappNotification(job),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("WhatsApp sending timeout")),
          timeoutDuration
        )
      ),
    ]);

    return result;
  } catch (error) {
    console.error("Error sending notification WhatsApp:", error.message);

    // Update notification with error (but don't throw to avoid job retry loops)
    if (job.data.notificationId) {
      try {
        await Notification.findByIdAndUpdate(job.data.notificationId, {
          whatsappError: error.message,
        });
      } catch (updateError) {
        console.error(
          "Failed to update notification WhatsApp error:",
          updateError.message
        );
      }
    }

    // Don't throw for timeout errors to prevent job retry loops
    if (error.message.includes("timeout") || error.code === "ETIMEDOUT") {
      console.log("WhatsApp timeout - marking job as completed to avoid retry");
      return; // Complete job without throwing
    }

    throw error; // Throw for other types of errors
  }
}

async function processWhatsappNotification(job) {
  try {
    const { notificationId } = job.data;
    console.log(`📲 [WhatsappWorker] Fetching notification: ${notificationId}`);

    // Get notification with populated data
    const notification = await Notification.findById(notificationId)
      .populate("recipient", "name phone notificationPreferences")
      .populate("sender", "name email");

    if (!notification) {
      console.error("Notification not found:", notificationId);
      return;
    }

    // Check if whatsapp should be sent
    if (!notification.channels.whatsapp) {
      console.log("Whatsapp not enabled for notification:", notificationId);
      return;
    }

    // Check user's whatsapp preferences
    const recipient = notification.recipient;
    const category = getNotificationCategory(notification.type);

    if (recipient.notificationPreferences?.whatsapp?.[category] === false) {
      console.log("User has disabled whatsapp for category:", category);
      return;
    }

    if (!recipient.phone) {
      console.log("Recipient has no phone number for whatsapp notification:", recipient.name);
      return;
    }

    // Send whatsapp using appropriate template
    if (notification.type === "LEAD_FOLLOWUP_DUE") {
      const leadId = notification.metadata.leadId;
      if (!leadId) throw new Error("No leadId found in notification metadata");

      const lead = await Lead.findById(leadId);
      if (!lead) throw new Error(`Lead not found: ${leadId}`);

      let followUpDoc;
      if (notification.metadata.followUpId) {
        followUpDoc = await FollowUp.findById(notification.metadata.followUpId);
      } else {
        followUpDoc = await FollowUp.findOne({ leadId, outcome: "pending" }).sort({ createdAt: -1 });
      }

      const type = followUpDoc?.followUpType || "follow-up";
      
      const reminderType = notification.metadata.reminderType || "DUE";
      let timeRemaining = "now";
      if (reminderType === "24H") timeRemaining = "24 hours";
      if (reminderType === "2H") timeRemaining = "2 hours";
      if (reminderType === "5M") timeRemaining = "5 minutes";

      if (type === "site visit") {
        await sendSiteVisitReminderWhatsappMessage(
          recipient.phone,
          recipient.name,
          lead.fullName || "Valued Client",
          lead.propertyName || "N/A",
          timeRemaining,
          lead.phone || "N/A"
        );
      } else {
        // Default to call reminder for other types or "call back"
        await sendCallReminderWhatsappMessage(
          recipient.phone,
          recipient.name,
          lead.fullName || "Valued Client",
          timeRemaining,
          lead.phone || "N/A"
        );
      }
    } else {
      console.log(`No specific whatsapp template implemented for notification type: ${notification.type}`);
    }

    // Update notification status
    await Notification.findByIdAndUpdate(notificationId, {
      whatsappSent: true,
      whatsappSentAt: new Date(),
    });

    console.log("Whatsapp notification sent successfully:", notificationId);
  } catch (error) {
    console.error("Error in processWhatsappNotification:", error);
    throw error;
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
