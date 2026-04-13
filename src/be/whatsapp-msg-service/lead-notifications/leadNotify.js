import twilio from "../twilio.js";

/**
 * Sends a WhatsApp message to a lead confirming a site visit has been scheduled.
 */
export const sendLeadSiteVisitScheduled = async (to, leadName, projectName, dateTime, agentName) => {
  try {
    console.log("📲 [Whatsapp] Sending site visit confirmation to lead:", to);
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.lead_site_visit_scheduled,
      contentVariables: JSON.stringify({
        1: leadName,
        2: projectName,
        3: dateTime,
        4: agentName
      })
    });
  } catch (error) {
    console.error("Error sending site visit confirmation to lead:", error);
  }
};

/**
 * Sends a WhatsApp message to a lead as a reminder for their site visit.
 */
export const sendLeadSiteVisitReminder = async (to, leadName, projectName, timeRemaining, displayTime) => {
  try {
    console.log(`📲 [Whatsapp] Sending ${timeRemaining} site visit reminder to lead:`, to);
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.lead_site_visit_reminder,
      contentVariables: JSON.stringify({
        1: leadName,
        2: projectName,
        3: timeRemaining,
        4: displayTime
      })
    });
  } catch (error) {
    console.error("Error sending site visit reminder to lead:", error);
  }
};

