import FollowUp from "../models/FollowUp.js";
import Notification from "../models/Notification.js";
import Lead from "../models/Lead.js";
import NotificationService from "../services/NotificationService.js";

const notificationService = new NotificationService();

/**
 * Process checks for due follow-up notifications.
 * PROFESSIONAL VERSION: 
 * 1. Global de-duplication per run
 * 2. Type-aware handling (Call vs Site Visit)
 * 3. Atomic marking of skipped duplicates to prevent ghost triggers
 */
const checkFollowUpsJob = async (job) => {
  console.log("🔍 [Job] Starting follow-up check...");

  try {
    const now = new Date();
    const nowTime = now.getTime();

    const H24 = 24 * 60 * 60 * 1000;
    const H2 = 2 * 60 * 60 * 1000;
    const M5 = 5 * 60 * 1000;

    // PROFESSIONAL: Narrower windows to ensure "on-time" delivery
    const notificationTypes = [
      {
        tag: "24H",
        windowStart: nowTime + H24 - 15 * 60 * 1000, 
        windowEnd: nowTime + H24 + 15 * 60 * 1000, 
        priority: "MEDIUM",
        title: "Upcoming (24h)",
      },
      {
        tag: "2H",
        windowStart: nowTime + H2 - 10 * 60 * 1000, 
        windowEnd: nowTime + H2 + 10 * 60 * 1000, 
        priority: "HIGH",
        title: "Upcoming (2h)",
      },
      {
        tag: "5M",
        windowStart: nowTime + M5 - 3 * 60 * 1000, 
        windowEnd: nowTime + M5 + 2 * 60 * 1000, 
        priority: "URGENT",
        title: "Upcoming (5m)",
      },
      {
        tag: "DUE",
        windowStart: nowTime - 10 * 60 * 1000, // Up to 10m late
        windowEnd: nowTime + 1 * 60 * 1000,  // Up to 1m early
        priority: "URGENT",
        title: "Due Now",
      },
    ];

    let totalSent = 0;
    let totalProcessed = 0;

    // ✅ GLOBAL DE-DUPLICATION: Prevents same lead getting multiple tags in one run
    const processedLeadTasks = new Set();

    for (const config of notificationTypes) {
      const { tag, windowStart, windowEnd } = config;

      const query = {
        outcome: "pending",
        followUpDate: {
          $gte: new Date(windowStart),
          $lte: new Date(windowEnd),
        },
        notificationsSent: { $nin: [tag] }, 
      };

      const followUps = await FollowUp.find(query)
        .populate("leadId")
        .limit(200) // Lower batch limit for better reliability
        .lean();

      if (followUps.length > 0) {
        console.log(`[Job] Found ${followUps.length} candidates for ${tag}`);
      }

      const uniqueFollowUps = [];
      
      for (const fp of followUps) {
        const leadId = fp.leadId?._id?.toString() || fp.leadId?.toString();
        const type = (fp.followUpType || "note").toLowerCase();
        
        // key includes lead, type AND tag to prevent repeat notifications 
        // but allowing different tasks for same lead
        const key = `${leadId}_${type}`; 

        if (leadId && !processedLeadTasks.has(key)) {
          processedLeadTasks.add(key);
          uniqueFollowUps.push(fp);
        } else {
          // ✅ CRITICAL FIX: If we skip a duplicate record in this run, mark it as 'sent' in DB 
          // immediately so it doesn't get picked up in the next run (1 minute later).
          await FollowUp.updateOne(
            { _id: fp._id },
            { $addToSet: { notificationsSent: tag } }
          );
          console.log(`[Job] Marked duplicate task as notified: Lead ${leadId} (${type})`);
        }
      }

      if (uniqueFollowUps.length > 0) {
        const sent = await processBatch(uniqueFollowUps, config, tag);
        totalSent += sent;
        totalProcessed += uniqueFollowUps.length;
      }
    }

    console.log(`✅ [Job] Completed. Processed: ${totalProcessed}, Sent: ${totalSent}`);
  } catch (error) {
    console.error("❌ [Job] Fatal error in checkFollowUpsJob:", error);
    throw error; 
  }
};

async function processBatch(docs, config, tag) {
  let sent = 0;

  const results = await Promise.allSettled(
    docs.map(async (fp) => {
      if (!fp.followUpDate || !fp.leadId) return false;

      const lead = fp.leadId;
      const recipientId = lead.assignedTo || lead.uploadedBy;

      if (!recipientId) return false;

      // 1. Create and Queue Notification
      const notification = await notificationService._createSingleNotification({
        recipient: recipientId,
        type: "LEAD_FOLLOWUP_DUE",
        title: config.title,
        message: `${config.title} for lead: ${lead.fullName || lead.phone}. Type: ${fp.followUpType}`,
        metadata: {
          leadId: lead._id,
          actionUrl: `/dashboard/leads?openDialog=true&leadId=${lead._id}`,
          priority: config.priority,
          isActionable: true,
          reminderType: tag,
          followUpId: fp._id,
        },
        channels: { inApp: true, email: true, whatsapp: true },
        scheduledFor: new Date(),
      });

      // 2. Mark this specific document as sent for this tag
      await FollowUp.updateOne(
        { _id: fp._id },
        { $addToSet: { notificationsSent: tag } }
      );

      console.log(`📡 [Job] Queued ${tag} (${fp.followUpType}) for Lead: ${lead._id}`);
      return true;
    })
  );

  results.forEach((r) => {
    if (r.status === "fulfilled" && r.value === true) sent++;
    else if (r.status === "rejected") console.error("Batch Error:", r.reason);
  });

  return sent;
}

export default checkFollowUpsJob;
