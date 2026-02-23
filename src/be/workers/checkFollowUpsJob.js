import FollowUp from "../models/FollowUp.js";
import Notification from "../models/Notification.js";
import Lead from "../models/Lead.js";
import NotificationService from "../services/NotificationService.js";

const notificationService = new NotificationService();

/**
 * Process checks for due follow-up notifications.
 * OPTIMIZED: Separate queries per notification type with $nin filter.
 * Only fetches records that need processing.
 *
 * @param {Object} job - The BullMQ job (contains no specific data for this cron-like task)
 */
const checkFollowUpsJob = async (job) => {
  console.log("🔍 [Job] Starting follow-up check...");

  try {
    const now = new Date();
    const nowTime = now.getTime();

    const H24 = 24 * 60 * 60 * 1000;
    const H2 = 2 * 60 * 60 * 1000;
    const M5 = 5 * 60 * 1000;

    // Notification type configurations with time windows
    const notificationTypes = [
      {
        tag: "24H",
        windowStart: nowTime + H24 - 30 * 60 * 1000, // 23.5h ahead
        windowEnd: nowTime + H24 + 30 * 60 * 1000, // 24.5h ahead
        priority: "MEDIUM",
        title: "Upcoming (24h)",
      },
      {
        tag: "2H",
        windowStart: nowTime + H2 - 15 * 60 * 1000, // 1h 45m ahead
        windowEnd: nowTime + H2 + 15 * 60 * 1000, // 2h 15m ahead
        priority: "HIGH",
        title: "Upcoming (2h)",
      },
      {
        tag: "5M",
        windowStart: nowTime + M5 - 2 * 60 * 1000, // 3m ahead
        windowEnd: nowTime + M5 + 3 * 60 * 1000, // 8m ahead
        priority: "URGENT",
        title: "Upcoming (5m)",
      },
      {
        tag: "DUE",
        windowStart: nowTime - 15 * 60 * 1000, // 15m ago
        windowEnd: nowTime + 2 * 60 * 1000, // 2m ahead
        priority: "URGENT",
        title: "Due Now",
      },
    ];

    let totalSent = 0;
    let totalProcessed = 0;

    // Process each notification type separately with optimized queries
    for (const config of notificationTypes) {
      const { tag, windowStart, windowEnd } = config;

      // ✅ OPTIMIZED: Only fetch records that:
      // 1. Are in the time window for this notification type
      // 2. Haven't sent this notification yet ($nin)
      const query = {
        followUpDate: {
          $gte: new Date(windowStart),
          $lte: new Date(windowEnd),
        },
        notificationsSent: { $nin: [tag] }, // Only get records without this tag
      };

      const followUps = await FollowUp.find(query)
        .populate("leadId")
        .limit(1000) // Safety limit per notification type
        .lean();

      if (followUps.length > 0) {
        console.log(
          `[Job] Processing ${followUps.length} follow-ups for ${tag} notification`
        );
      }

      // Process in batches for this notification type
      const batchSize = 50;
      for (let i = 0; i < followUps.length; i += batchSize) {
        const batch = followUps.slice(i, i + batchSize);
        const sent = await processBatch(batch, config, tag);
        totalSent += sent;
        totalProcessed += batch.length;
      }
    }

    console.log(
      `✅ [Job] Completed. Processed: ${totalProcessed}, Notifications Sent: ${totalSent}`
    );
  } catch (error) {
    console.error("❌ [Job] Error in checkFollowUpsJob:", error);
    throw error; // Retry job
  }
};

/**
 * Process a batch of FollowUps for a specific notification type
 */
async function processBatch(docs, config, tag) {
  let sent = 0;

  const results = await Promise.allSettled(
    docs.map(async (fp) => {
      if (!fp.followUpDate || !fp.leadId) {
        console.warn(
          `⚠️ [Job] Skipping follow-up ${fp._id}: Missing date or lead reference.`
        );
        return false;
      }

      const lead = fp.leadId;
      const recipientId = lead.assignedTo || lead.uploadedBy;

      if (!recipientId) {
        console.warn(
          `⚠️ [Job] Skipping follow-up ${fp._id} for Lead ${lead._id}: No assigned user or owner.`
        );
        return false;
      }

      // Send notification
      await sendNotification(lead, recipientId, tag, config, fp);

      // ✅ ATOMIC UPDATE: Use $addToSet to add tag (prevents duplicates)
      await FollowUp.updateOne(
        { _id: fp._id },
        { $addToSet: { notificationsSent: tag } }
      );

      return true;
    })
  );

  results.forEach((r) => {
    if (r.status === "fulfilled" && r.value === true) sent++;
    if (r.status === "rejected")
      console.error("Error processing single doc:", r.reason);
  });

  return sent;
}

async function sendNotification(lead, recipient, tag, config, fp) {
  try {
    await notificationService._createSingleNotification({
      recipient: recipient,
      type: "LEAD_FOLLOWUP_DUE",
      title: config.title,
      message: `${config.title} for lead: ${lead.fullName || lead.phone
        }. Type: ${fp.followUpType}`,
      metadata: {
        leadId: lead._id,
        actionUrl: `/dashboard/leads?openDialog=true&leadId=${lead._id}`,
        priority: config.priority,
        isActionable: true,
        reminderType: tag,
        followUpId: fp._id,
      },
      channels: { inApp: true, email: true },
      scheduledFor: new Date(),
    });
  } catch (e) {
    console.error(`Failed to send ${tag} notification`, e);
    throw e; // Bubble up to fail the promise in the batch
  }
}

export default checkFollowUpsJob;
