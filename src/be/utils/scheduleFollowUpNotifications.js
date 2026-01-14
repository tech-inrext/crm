import { leadQueue, ensureQueueConnection } from "../../queue/leadQueue.js";

/**
 * Schedule multiple notification jobs for a follow-up/site visit
 * @param {String} leadId - Lead ID
 * @param {Date} followUpDate - Follow-up date/time
 * @param {String} followUpType - Type: 'call back' or 'site visit'
 * @returns {Promise<void>}
 */
export async function scheduleFollowUpNotifications(
  leadId,
  followUpDate,
  followUpType = "call back"
) {
  if (!leadQueue) {
    console.warn("Redis queue not available, skipping notification scheduling");
    return;
  }

  try {
    // Check if queue connection is available
    const isConnected = await ensureQueueConnection();
    if (!isConnected) {
      console.warn(
        "Redis connection not available, skipping notification scheduling"
      );
      return;
    }

    const followUpTime = new Date(followUpDate).getTime();
    const now = Date.now();

    // Define notification schedule: [type, milliseconds before event]
    const notifications = [
      { type: "24H_BEFORE", delay: followUpTime - now - 24 * 60 * 60 * 1000 },
      { type: "2H_BEFORE", delay: followUpTime - now - 2 * 60 * 60 * 1000 },
      { type: "5MIN_BEFORE", delay: followUpTime - now - 5 * 60 * 1000 },
      // Schedule the actual due time notification
      { type: "DUE", delay: followUpTime - now },
    ];

    // Check for "starting soon" case (less than 5 minutes away)
    // If the event is in the future but less than 5 minutes away, the 5MIN_BEFORE delay will be negative.
    // We should send an immediate "starting soon" warning instead.
    if (followUpTime > now && followUpTime - now < 5 * 60 * 1000) {
      // Find the negative 5MIN_BEFORE and force it to be immediate (delay 0)
      // OR just push a new one. Since the loop checks delay > 0, the original 5MIN_BEFORE will be skipped.
      notifications.push({ type: "5MIN_BEFORE", delay: 0 });
    }

    // Schedule each notification if it's in the future
    const successfulSchedules = [];
    const failedSchedules = [];

    for (const notif of notifications) {
      if (notif.delay > 0) {
        try {
          // Double check connection before adding job
          const isStillConnected = await ensureQueueConnection();
          if (!isStillConnected) {
            throw new Error("Redis connection lost during scheduling");
          }

          await leadQueue.add(
            "sendLeadFollowUpNotification",
            {
              leadId: String(leadId),
              scheduledTime: followUpDate,
              reminderType: notif.type,
              followUpType,
            },
            {
              delay: notif.delay,
              attempts: 5, // Increase attempts for better reliability
              backoff: {
                type: "exponential",
                delay: 2000,
              },
              // Add job timeout to prevent hanging
              timeout: 60000, // 1 minute timeout
              // Ensure jobs are durable
              removeOnComplete: 10,
              removeOnFail: 5,
            }
          );

          successfulSchedules.push(notif.type);
          console.log(
            `✓ Scheduled ${
              notif.type
            } notification for lead ${leadId} (delay: ${Math.round(
              notif.delay / 1000 / 60
            )} minutes)`
          );
        } catch (error) {
          failedSchedules.push({ type: notif.type, error: error.message });
          console.error(
            `Failed to schedule ${notif.type} notification:`,
            error.message
          );

          // For critical notifications (5MIN_BEFORE), try one retry with shorter delay
          if (
            notif.type === "5MIN_BEFORE" &&
            !error.message.includes("Connection is closed") &&
            !error.message.includes("Redis connection")
          ) {
            try {
              await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
              await leadQueue.add(
                "sendLeadFollowUpNotification",
                {
                  leadId: String(leadId),
                  scheduledTime: followUpDate,
                  reminderType: notif.type,
                  followUpType,
                },
                {
                  delay: notif.delay,
                  attempts: 3,
                  backoff: { type: "exponential", delay: 2000 },
                  timeout: 30000,
                }
              );
              successfulSchedules.push(`${notif.type}_RETRY`);
              console.log(
                `✓ Retry successful: Scheduled ${notif.type} notification for lead ${leadId}`
              );
            } catch (retryError) {
              console.error(
                `Retry failed for ${notif.type} notification:`,
                retryError.message
              );
              failedSchedules.push({
                type: `${notif.type}_RETRY`,
                error: retryError.message,
              });
            }
          }
        }
      } else {
        console.log(`⏭ Skipping ${notif.type} notification (time has passed)`);
      }
    }

    // Log summary
    if (successfulSchedules.length > 0) {
      console.log(
        `✅ Successfully scheduled ${
          successfulSchedules.length
        } notifications for lead ${leadId}: ${successfulSchedules.join(", ")}`
      );
    }
    if (failedSchedules.length > 0) {
      console.warn(
        `⚠️  Failed to schedule ${failedSchedules.length} notifications for lead ${leadId}:`,
        failedSchedules
      );
    }
  } catch (error) {
    console.error("Failed to schedule follow-up notifications:", error);
    throw new Error(`Notification scheduling failed: ${error.message}`);
  }
}
