import TwilioClient from 'twilio';


class Twilio {
  constructor() {
    this.phoneNumber = '+15042336764';
    this.whatsappNumber = 'whatsapp:+15042336764';
    this.client = new TwilioClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.templates = {
      reminder_template1: "HX65fdfb9b8b5e4266af18f5f00e4b4094",
      call_reminder: "HXa6b1d9ee4317314bd2caa44a0ff89b6b",
      site_visit_reminder: "HX50690b64df4fe9ff0e9ba4a67e3c6429"
    }
  }

  /**
   * 
   * @param {*} to | phone number without +91
   * @param {*} body | message body
   * @returns {Promise<void>}
   */
  async sendMessage(to, body) {
    const message = await this.client.messages.create({
      body,
      from: this.phoneNumber,
      to: `+91${to}`,
    });
    console.log("Message:", message);
  }

  async sendWhatsappMessage(to, name, vehicle_no, violation) {
    try {
      console.log("sending whatsapp message to", to, name, vehicle_no, violation);
      await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${to}`,
        contentSid: this.templates.reminder_template1,
        contentVariables: JSON.stringify({
          1: name,
          2: vehicle_no,
          3: violation
        })
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  }

  async sendCallReminderWhatsappMessage(to, agentName, clientName, timeRemaining, clientContact) {
    try {
      console.log("sending call reminder whatsapp message to agent", to);
      await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${to}`,
        contentSid: this.templates.call_reminder,
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
  }

  async sendSiteVisitReminderWhatsappMessage(to, agentName, clientName, propertyName, timeRemaining, clientContact) {
    try {
      console.log("sending site visit reminder whatsapp message to agent", to);
      await this.client.messages.create({
        from: this.whatsappNumber,
        to: `whatsapp:+91${to}`,
        contentSid: this.templates.site_visit_reminder,
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
  }

}

const twilio = new Twilio();
export default twilio;