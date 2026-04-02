import twilio from "../twilio.js";

export const sendCallReminderWhatsappMessage = async (to, agentName, clientName, timeRemaining, clientContact) => {
  try {
    console.log("sending call reminder whatsapp message to agent", to);
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.call_reminder,
      contentVariables: JSON.stringify({
        1: agentName,
        2: clientName,
        3: timeRemaining,
        4: clientContact
      })
    });
  } catch (error) {
    console.error("Error sending call reminder WhatsApp message to agent:", error);
  }
};
