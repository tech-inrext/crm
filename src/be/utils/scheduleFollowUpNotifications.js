import { leadQueue } from "../../queue/leadQueue.js";

/**
 * Schedule multiple notification jobs for a follow-up/site visit
 * @param {String} leadId - Lead ID
 * @param {Date} followUpDate - Follow-up date/time
 * @param {String} followUpType - Type: 'call back' or 'site visit'
 * @returns {Promise<void>}
 */
export async function scheduleFollowUpNotifications(leadId, followUpDate, followUpType = 'call back') {
    if (!leadQueue) {
        console.warn('Redis queue not available, skipping notification scheduling');
        return;
    }

    const followUpTime = new Date(followUpDate).getTime();
    const now = Date.now();

    // Define notification schedule: [type, milliseconds before event]
    const notifications = [
        { type: '24H_BEFORE', delay: followUpTime - now - (24 * 60 * 60 * 1000) },
        { type: '2H_BEFORE', delay: followUpTime - now - (2 * 60 * 60 * 1000) },
        { type: '5MIN_BEFORE', delay: followUpTime - now - (5 * 60 * 1000) }
    ];

    // Schedule each notification if it's in the future
    for (const notif of notifications) {
        if (notif.delay > 0) {
            try {
                await leadQueue.add('sendLeadFollowUpNotification', {
                    leadId: String(leadId),
                    scheduledTime: followUpDate,
                    reminderType: notif.type,
                    followUpType
                }, {
                    delay: notif.delay,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000
                    }
                });

                console.log(`✓ Scheduled ${notif.type} notification for lead ${leadId} (delay: ${Math.round(notif.delay / 1000 / 60)} minutes)`);
            } catch (error) {
                console.error(`Failed to schedule ${notif.type} notification:`, error.message);
            }
        } else {
            console.log(`⏭ Skipping ${notif.type} notification (time has passed)`);
        }
    }
}
