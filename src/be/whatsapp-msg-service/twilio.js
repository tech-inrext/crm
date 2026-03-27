import TwilioClient from 'twilio';


class Twilio {
  constructor() {
    this.phoneNumber = '+15042336764';
    this.whatsappNumber = 'whatsapp:+15042336764';
    this.client = new TwilioClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.templates = {
      call_reminder: "HXa6b1d9ee4317314bd2caa44a0ff89b6b",
      site_visit_reminder: "HX50690b64df4fe9ff0e9ba4a67e3c6429"
    }
  }
}

const twilio = new Twilio();
export default twilio;