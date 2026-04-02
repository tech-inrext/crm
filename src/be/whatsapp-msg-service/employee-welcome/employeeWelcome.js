import twilio from "../twilio.js";

export const sendEmployeeWelcomeWhatsappMessage = async (to, name, loginUrl) => {
  try {
    console.log("sending employee welcome whatsapp message to:", to);
    /* 
      Template (Employee Welcome - EXACT MATCH):
      👋 Welcome {{1}}!
      We’re excited to have you onboard. 🥳
      ✅ Your employee account has been created successfully.
      🔐 Temporary Password: Inrext@123
      ⚠️ For security reasons, please reset your password immediately using the Forgot Password option on the login page:
      🔗 {{2}}
      Thanks,
      Team Inrext
    */
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.employee_welcome,
      contentVariables: JSON.stringify({
        1: name,
        2: loginUrl || `${process.env.APP_URL || "https://dashboard.inrext.com"}/login`
      })
    });
  } catch (error) {
    console.error("Error sending employee welcome WhatsApp message:", error);
  }
};
