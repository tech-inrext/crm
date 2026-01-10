import mongoose from "mongoose";
import dbConnect from "../lib/mongodb.js";
import Lead from "../models/Lead.js";
import Notification from "../models/Notification.js";
import FollowUp from "../models/FollowUp.js";

/**
 * Health check for database connection
 * @returns {Promise<boolean>} - Returns true if connection is healthy
 */
const isDatabaseHealthy = async () => {
  try {
    const state = mongoose.connection.readyState;
    if (state !== 1) {
      return false;
    }

    // Perform a simple query to test the connection
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error("Database health check failed:", error.message);
    return false;
  }
};

/**
 * Worker to send lead follow-up notifications
 * @param {Object} job - The BullMQ job object
 */
const sendLeadFollowUpNotification = async (job) => {
  const {
    leadId,
    scheduledTime,
    reminderType = "DUE",
    followUpType = "call back",
  } = job.data;

  console.log(`🚀 Processing ${reminderType} notification for lead ${leadId}`);

  try {
    // Ensure database connection is established with retry logic
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        await dbConnect();

        // Verify database connection health
        const isHealthy = await isDatabaseHealthy();
        if (isHealthy) {
          console.log(`✅ Database connection verified for lead ${leadId}`);
          break; // Connection is healthy, proceed
        } else {
          throw new Error("Database connection health check failed");
        }
      } catch (connectionError) {
        retryCount++;
        console.warn(
          `Database connection attempt ${retryCount}/${maxRetries} failed for lead ${leadId}:`,
          connectionError.message
        );

        if (retryCount >= maxRetries) {
          throw new Error(
            `Failed to establish database connection after ${maxRetries} attempts: ${connectionError.message}`
          );
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, retryCount * 2000));

        // Force reset the mongoose connection
        if (mongoose.connection.readyState !== 1) {
          await mongoose.disconnect();
        }
      }
    }

    // Add timeout for database operations to prevent hanging
    console.log(
      `🔍 Looking up lead with ID: ${leadId} (type: ${typeof leadId})`
    );

    // Try to find lead by _id first, then by leadId field
    let lead = await Promise.race([
      Lead.findById(leadId).lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Lead query timeout")), 15000)
      ),
    ]);

    // If not found by _id, try finding by leadId field
    if (!lead) {
      console.log(`🔍 Lead not found by _id, trying leadId field...`);
      lead = await Promise.race([
        Lead.findOne({ leadId: leadId }).lean(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Lead by leadId query timeout")),
            15000
          )
        ),
      ]);
    }

    console.log(`📋 Lead found:`, {
      id: lead?._id,
      leadId: lead?.leadId,
      fullName: lead?.fullName,
      phone: lead?.phone,
      assignedTo: lead?.assignedTo,
      uploadedBy: lead?.uploadedBy,
    });

    const followUpDoc = await Promise.race([
      FollowUp.findOne({ leadId: lead?._id }).sort({ createdAt: -1 }).lean(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("FollowUp query timeout")), 15000)
      ),
    ]);

    console.log(`📅 FollowUp document found:`, {
      id: followUpDoc?._id,
      leadId: followUpDoc?.leadId,
      followUpDate: followUpDoc?.followUpDate,
      followUpType: followUpDoc?.followUpType,
      notificationsSent: followUpDoc?.notificationsSent,
    });

    if (!lead) {
      console.log(`Lead not found for follow-up notification: ${leadId}`);
      return;
    }

    // The FollowUp model structure has changed - it's now one document per follow-up entry
    // We need to get the most recent follow-up for this lead
    if (!followUpDoc || !followUpDoc.followUpDate) {
      console.log(
        `Follow-up cancelled or not found for lead: ${leadId}, skipping notification.`
      );
      return;
    }

    // ✅ CHECK: Has this notification type already been sent?
    if (followUpDoc && followUpDoc.notificationsSent?.includes(reminderType)) {
      console.log(
        `✓ Notification ${reminderType} already sent for lead ${leadId}, skipping duplicate`
      );
      return;
    }

    const currentFollowUpTime = new Date(followUpDoc.followUpDate).getTime();
    const scheduledFollowUpTime = new Date(scheduledTime).getTime();

    // If the dates are significantly different (e.g. > 5 mins difference), it means it was rescheduled
    const timeDifference = Math.abs(
      currentFollowUpTime - scheduledFollowUpTime
    );
    if (timeDifference > 5 * 60 * 1000) {
      // 5 minutes tolerance
      console.log(
        `Follow-up rescheduled for lead: ${leadId}. Scheduled: ${scheduledTime}, Current: ${followUpDoc.followUpDate}. Skipping old notification.`
      );
      return;
    }

    // Determine notification recipient (assignedTo has priority, fallback to uploadedBy)
    const notificationRecipient = lead.assignedTo || lead.uploadedBy;

    if (notificationRecipient) {
      const typeLabel =
        followUpType === "site visit" ? "Site Visit" : "Follow-up";
      let title = `Lead ${typeLabel} Due`;
      let message = `${typeLabel} is due for lead: ${
        lead.fullName || lead.phone
      }`;
      let priority = "HIGH";

      // Add context about assignment status
      const assignmentContext = lead.assignedTo
        ? "assigned to you"
        : "uploaded by you (unassigned)";

      switch (reminderType) {
        case "24H_BEFORE":
          title = `Upcoming ${typeLabel} (24h)`;
          message = `You have a ${typeLabel.toLowerCase()} scheduled in 24 hours for lead: ${
            lead.fullName || lead.phone
          } (${assignmentContext})`;
          priority = "MEDIUM";
          break;
        case "2H_BEFORE":
          title = `Upcoming ${typeLabel} (2h)`;
          message = `You have a ${typeLabel.toLowerCase()} scheduled in 2 hours for lead: ${
            lead.fullName || lead.phone
          } (${assignmentContext})`;
          priority = "HIGH";
          break;
        case "5MIN_BEFORE":
          title = `${typeLabel} Starting Soon`;
          message = `${typeLabel} starts in 5 minutes for lead: ${
            lead.fullName || lead.phone
          } (${assignmentContext})`;
          priority = "URGENT";
          break;
        case "DUE":
        default:
          title = `Lead ${typeLabel} Due Now`;
          message = `${typeLabel} is due now for lead: ${
            lead.fullName || lead.phone
          } (${assignmentContext})`;
          priority = "URGENT";
          break;
      }

      console.log(
        `📧 Creating notification for recipient: ${notificationRecipient} (${
          lead.assignedTo ? "assigned user" : "lead owner"
        })`
      );

      // Create notification directly using the model
      const createdNotification = await Notification.create({
        recipient: notificationRecipient,
        type: "LEAD_FOLLOWUP_DUE",
        title: title,
        message: message,
        metadata: {
          leadId,
          actionUrl: `/dashboard/leads/${leadId}`,
          priority: priority,
          isActionable: true,
          reminderType: reminderType,
          leadPhone: lead.phone,
          leadName: lead.fullName,
          followUpType: followUpType,
          isOwnerNotification: !lead.assignedTo,
        },
        channels: {
          inApp: true,
          email: true,
        },
        scheduledFor:
          reminderType === "DUE" ? followUpDoc.followUpDate : undefined,
      });

      console.log(`✅ Notification created successfully:`, {
        notificationId: createdNotification._id,
        recipient: notificationRecipient,
        title: title,
        type: "LEAD_FOLLOWUP_DUE",
      });

      // ✅ MARK: Add to sent array (atomic operation prevents duplicates)
      await FollowUp.findByIdAndUpdate(followUpDoc._id, {
        $addToSet: { notificationsSent: reminderType },
      });

      console.log(
        `✅ Sent ${reminderType} follow-up notification for lead: ${leadId} to ${
          lead.assignedTo ? "assigned user" : "lead owner"
        }`
      );
    } else {
      console.log(
        `❌ Lead ${leadId} has no assigned user AND no uploadedBy user, cannot send notification.`
      );

      // Log this as a data integrity issue for monitoring
      console.error(
        `🚨 DATA INTEGRITY ISSUE: Lead ${leadId} (${lead?.leadId}) has no assignedTo or uploadedBy field. This should not happen.`
      );

      // Could optionally create a system notification for admins
      // await createSystemNotificationForAdmins('Orphaned lead detected', leadId);
    }
  } catch (error) {
    console.error(
      `Error processing lead follow-up notification for ${leadId}:`,
      error
    );
    throw error; // Retry the job if it fails
  }
};

export default sendLeadFollowUpNotification;
