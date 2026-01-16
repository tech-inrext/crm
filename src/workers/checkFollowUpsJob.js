import FollowUp from "../models/FollowUp.js";
import Notification from "../models/Notification.js";
import Lead from "../models/Lead.js";

/**
 * Process checks for due follow-up notifications.
 * Tuned for Scalability: Uses Cursors and Batch Processing.
 *
 * @param {Object} job - The BullMQ job (contains no specific data for this cron-like task)
 */
const checkFollowUpsJob = async (job) => {
  console.log("🔍 [Job] Starting follow-up check...");

  try {
    const now = new Date();
    const nowTime = now.getTime();

    // 1. Time Window: Look back 1 hour (to catch slightly late ones) and ahead 25 hours
    // We catch "lapsed" ones only if they are within this window.
    // If system was down for 2 days, those are "very lapsed" and ignored by this window (which is fine per requirements).
    const startTime = new Date(nowTime - 60 * 60 * 1000);
    const endTime = new Date(nowTime + 25 * 60 * 60 * 1000);

    // 2. Query only "active" looking follow-ups to check.
    // Optimization: Filter out ones that have ALL notifications sent?
    // We can't easily query "contains all of [24H, 2H, 5M, DUE]" in simple mongo without precise ordering.
    // But we can filter by date range.
    const query = {
      followUpDate: { $gte: startTime, $lte: endTime },
      // Only fetch if we haven't sent the final DUE notification (optimization)
      // or if we have other notifications pending.
      // Simplest safe optimization: Don't check if "DUE" is already sent?
      // But maybe "DUE" was sent but "24H" wasn't (lapsed). We need to mark "24H" as sent/skipped.
      // So we just fetch all in window.
    };

    // 3. Use Mongoose Cursor for Memory Efficiency
    const batchSize = 50;

    // Count for debug
    const count = await FollowUp.countDocuments(query);
    console.log(
      `[Job] Found ${count} active follow-ups in window: ${startTime.toISOString()} to ${endTime.toISOString()}`
    );

    const cursor = FollowUp.find(query)
      .populate("leadId")
      .cursor({ batchSize });

    let processedCount = 0;
    let batch = [];
    let sentCount = 0;

    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      batch.push(doc);

      if (batch.length >= batchSize) {
        const results = await processBatch(batch, nowTime);
        sentCount += results.sent;
        processedCount += batch.length;
        batch = []; // Clear batch
      }
    }

    // Process remaining
    if (batch.length > 0) {
      const results = await processBatch(batch, nowTime);
      sentCount += results.sent;
      processedCount += batch.length;
    }

    console.log(
      `✅ [Job] Completed. Scanned: ${processedCount}, Notifications Sent: ${sentCount}`
    );
  } catch (error) {
    console.error("❌ [Job] Error in checkFollowUpsJob:", error);
    throw error; // Retry job
  }
};

/**
 * Process a batch of FollowUps concurrently
 */
async function processBatch(docs, nowTime) {
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
      // Fallback: assignedTo -> uploadedBy (Owner)
      const recipientId = lead.assignedTo || lead.uploadedBy;

      if (!recipientId) {
        console.warn(
          `⚠️ [Job] Skipping follow-up ${fp._id} for Lead ${lead._id}: No assigned user or owner.`
        );
        return false;
      }

      const followUpTime = new Date(fp.followUpDate).getTime();
      const timeDiff = followUpTime - nowTime;

      // Debug Log only for first item in batch to reduce noise
      // console.log(`[Job Debug] ID: ${fp._id}, Diff: ${(timeDiff/60000).toFixed(1)}m, Sent: ${fp.notificationsSent}`);

      const H24 = 24 * 60 * 60 * 1000;
      const H2 = 2 * 60 * 60 * 1000;
      const M5 = 5 * 60 * 1000;

      // Configuration
      const checks = [
        {
          tag: "24H",
          windowStart: H24 - 30 * 60 * 1000,
          windowEnd: H24 + 30 * 60 * 1000,
          priority: "MEDIUM",
          title: "Upcoming (24h)",
        },
        {
          tag: "2H",
          windowStart: H2 - 15 * 60 * 1000,
          windowEnd: H2 + 15 * 60 * 1000,
          priority: "HIGH",
          title: "Upcoming (2h)",
        },
        {
          tag: "5M",
          windowStart: M5 - 2 * 60 * 1000,
          windowEnd: M5 + 3 * 60 * 1000,
          priority: "URGENT",
          title: "Upcoming (5m)",
        },
        {
          tag: "DUE",
          windowStart: -15 * 60 * 1000,
          windowEnd: 2 * 60 * 1000,
          priority: "URGENT",
          title: "Due Now",
        },
      ];

      let sentList = fp.notificationsSent || []; // Create copy if needed, but here direct ref is ok
      let needsSave = false;
      let batchSent = false;

      for (const check of checks) {
        if (sentList.includes(check.tag)) continue;

        const { tag, windowStart, windowEnd } = check;

        // Logic:
        // 1. Is it too early? (timeDiff > windowEnd) -> Do nothing.
        // 2. Is it in window? (windowStart <= timeDiff <= windowEnd) -> Send!
        // 3. Is it too late? (timeDiff < windowStart) -> Skip (Mark as handled).

        if (timeDiff > windowEnd) {
          // Too early
        } else if (timeDiff >= windowStart) {
          // In Time Window
          await sendNotification(lead, recipientId, tag, check, fp);
          sentList.push(tag);
          needsSave = true;
          batchSent = true;
        } else {
          // Time Lapsed (Too late)
          // console.log(`Skipping ${tag} for ${lead._id} (Lapsed)`);
          sentList.push(tag);
          needsSave = true;
        }
      }

      if (needsSave) {
        fp.notificationsSent = sentList;
        await fp.save();
      }

      return batchSent;
    })
  );

  results.forEach((r) => {
    if (r.status === "fulfilled" && r.value === true) sent++;
    if (r.status === "rejected")
      console.error("Error processing single doc:", r.reason);
  });

  return { sent };
}

async function sendNotification(lead, recipient, tag, config, fp) {
  try {
    await Notification.create({
      recipient: recipient,
      type: "LEAD_FOLLOWUP_DUE",
      title: config.title,
      message: `${config.title} for lead: ${
        lead.fullName || lead.phone
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
