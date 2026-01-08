import Lead from "../models/Lead.js";
import Notification from "../models/Notification.js";
import FollowUp from "../models/FollowUp.js";

/**
 * Worker to send lead follow-up notifications
 * @param {Object} job - The BullMQ job object
 */
const sendLeadFollowUpNotification = async (job) => {
    const { leadId, scheduledTime, reminderType = "DUE", followUpType = "call back" } = job.data;

    try {
        const lead = await Lead.findById(leadId);
        const followUpDoc = await FollowUp.findOne({ leadId });

        if (!lead) {
            console.log(`Lead not found for follow-up notification: ${leadId}`);
            return;
        }

        // Get the most recent follow-up entry
        const latestEntry = followUpDoc?.followUps?.length > 0
            ? followUpDoc.followUps[followUpDoc.followUps.length - 1]
            : null;

        if (!latestEntry || !latestEntry.followUpDate) {
            console.log(`Follow-up cancelled or not found for lead: ${leadId}, skipping notification.`);
            return;
        }

        // ✅ CHECK: Has this notification type already been sent?
        if (followUpDoc && followUpDoc.notificationsSent?.includes(reminderType)) {
            console.log(`✓ Notification ${reminderType} already sent for lead ${leadId}, skipping duplicate`);
            return;
        }

        const currentFollowUpTime = new Date(latestEntry.followUpDate).getTime();
        const scheduledFollowUpTime = new Date(scheduledTime).getTime();

        // If the dates are significantly different (e.g. > 5 mins difference), it means it was rescheduled
        const timeDifference = Math.abs(currentFollowUpTime - scheduledFollowUpTime);
        if (timeDifference > 5 * 60 * 1000) { // 5 minutes tolerance
            console.log(`Follow-up rescheduled for lead: ${leadId}. Scheduled: ${scheduledTime}, Current: ${latestEntry.followUpDate}. Skipping old notification.`);
            return;
        }

        if (lead.assignedTo) {
            const typeLabel = followUpType === "site visit" ? "Site Visit" : "Follow-up";
            let title = `Lead ${typeLabel} Due`;
            let message = `${typeLabel} is due for lead: ${lead.fullName || lead.phone}`;
            let priority = "HIGH";

            switch (reminderType) {
                case "24H_BEFORE":
                    title = `Upcoming ${typeLabel} (24h)`;
                    message = `You have a ${typeLabel.toLowerCase()} scheduled in 24 hours for lead: ${lead.fullName || lead.phone}`;
                    priority = "MEDIUM";
                    break;
                case "2H_BEFORE":
                    title = `Upcoming ${typeLabel} (2h)`;
                    message = `You have a ${typeLabel.toLowerCase()} scheduled in 2 hours for lead: ${lead.fullName || lead.phone}`;
                    priority = "HIGH";
                    break;
                case "DUE":
                default:
                    title = `Lead ${typeLabel} Due Now`;
                    message = `${typeLabel} is due now for lead: ${lead.fullName || lead.phone}`;
                    priority = "URGENT";
                    break;
            }

            // Create notification directly using the model
            await Notification.create({
                recipient: lead.assignedTo,
                type: "LEAD_FOLLOWUP_DUE",
                title: title,
                message: message,
                metadata: {
                    leadId,
                    actionUrl: `/dashboard/leads/${leadId}`,
                    priority: priority,
                    isActionable: true,
                    reminderType: reminderType
                },
                channels: {
                    inApp: true,
                    email: true,
                },
                scheduledFor: reminderType === "DUE" ? latestEntry.followUpDate : undefined,
            });

            // ✅ MARK: Add to sent array (atomic operation prevents duplicates)
            await FollowUp.findByIdAndUpdate(followUpDoc._id, {
                $addToSet: { notificationsSent: reminderType }
            });

            console.log(`✅ Sent ${reminderType} follow-up notification for lead: ${leadId}`);
        } else {
            console.log(`Lead ${leadId} has no assigned user, skipping follow-up notification.`);
        }
    } catch (error) {
        console.error(`Error processing lead follow-up notification for ${leadId}:`, error);
        throw error; // Retry the job if it fails
    }
};

export default sendLeadFollowUpNotification;
