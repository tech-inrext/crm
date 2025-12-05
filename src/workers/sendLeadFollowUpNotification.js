import Lead from "../models/Lead.js";
import Notification from "../models/Notification.js";

/**
 * Worker to send lead follow-up notifications
 * @param {Object} job - The BullMQ job object
 */
const sendLeadFollowUpNotification = async (job) => {
    const { leadId, scheduledTime, reminderType = "DUE" } = job.data;

    try {
        const lead = await Lead.findById(leadId);

        if (!lead) {
            console.log(`Lead not found for follow-up notification: ${leadId}`);
            return;
        }

        // Validate if the follow-up is still valid
        const currentFollowUpTime = new Date(lead.nextFollowUp).getTime();
        const scheduledFollowUpTime = new Date(scheduledTime).getTime();

        if (!lead.nextFollowUp) {
            console.log(`Follow-up cancelled for lead: ${leadId}, skipping notification.`);
            return;
        }

        // If the dates are significantly different (e.g. > 5 mins difference), it means it was rescheduled
        const timeDifference = Math.abs(currentFollowUpTime - scheduledFollowUpTime);
        if (timeDifference > 5 * 60 * 1000) { // 5 minutes tolerance
            console.log(`Follow-up rescheduled for lead: ${leadId}. Scheduled: ${scheduledTime}, Current: ${lead.nextFollowUp}. Skipping old notification.`);
            return;
        }

        if (lead.assignedTo) {
            let title = "Lead Follow-up Due";
            let message = `Follow-up is due for lead: ${lead.fullName || lead.phone}`;
            let priority = "HIGH";

            switch (reminderType) {
                case "24H_BEFORE":
                    title = "Upcoming Lead Follow-up (24h)";
                    message = `You have a follow-up scheduled in 24 hours for lead: ${lead.fullName || lead.phone}`;
                    priority = "MEDIUM";
                    break;
                case "2H_BEFORE":
                    title = "Upcoming Lead Follow-up (2h)";
                    message = `You have a follow-up scheduled in 2 hours for lead: ${lead.fullName || lead.phone}`;
                    priority = "HIGH";
                    break;
                case "DUE":
                default:
                    title = "Lead Follow-up Due Now";
                    message = `Follow-up is due now for lead: ${lead.fullName || lead.phone}`;
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
                scheduledFor: reminderType === "DUE" ? lead.nextFollowUp : undefined, // Only set scheduledFor for the main event if needed for sorting, but here we are sending immediately when job runs
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
