import TwilioClient from 'twilio';


class Twilio {
  constructor() {
    this.phoneNumber = '+15042336764';
    this.whatsappNumber = 'whatsapp:+15042336764';
    this.client = new TwilioClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    this.templates = {
      call_reminder: "HXa6b1d9ee4317314bd2caa44a0ff89b6b",
      site_visit_reminder: "HX50690b64df4fe9ff0e9ba4a67e3c6429",
      employee_welcome: "HX1554b3377fc225e38eb4ab32ea9675b2",
      mou_notification: "HXa66fead19097edb1cca671df17bfe5c6",
      mou_approval_request_avp: "HX153920d289ea98cd2c3f9ea35bb42290",
      lead_site_visit_scheduled: "HX93aae696d7eb13294ee0729e45c45913",
      lead_site_visit_reminder: "HX2285153fb5ed5b14e3af991bc2ca11ac"
    }
  }
}

const twilio = new Twilio();
export default twilio;