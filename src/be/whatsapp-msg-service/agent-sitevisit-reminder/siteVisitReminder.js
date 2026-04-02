import twilio from "../twilio.js";

export const sendSiteVisitReminderWhatsappMessage = async (to, agentName, clientName, propertyName, timeRemaining, clientContact) => {
  try {
    console.log("sending site visit reminder whatsapp message to agent", to);
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.site_visit_reminder,
      contentVariables: JSON.stringify({
        1: agentName,
        2: clientName,
        3: propertyName,
        4: timeRemaining,
        5: clientContact
      })
    });
  } catch (error) {
    console.error("Error sending site visit reminder WhatsApp message to agent:", error);
  }
};
