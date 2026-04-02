import twilio from "../twilio.js";

// Notify Employee that MOU is approved (with download link)
export const sendMOUApprovedWhatsappMessage = async (to, name, associateId, downloadUrl) => {
  try {
    console.log("sending MOU approval whatsapp message to employee:", to);
    /* 
      Template (Employee Approved - EXACT MATCH):
      🥳 MOU Approved
      Dear {{1}},
      We’re pleased to inform you that your Memorandum of Understanding (MOU) has been approved.
      🆔 Your Associate ID: {{2}}
      📄 You can review your approved MOU here:
      {{3}}
      We look forward to a successful journey together. 🌟
      Best regards,
      Team Inrext
    */
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.mou_notification,
      contentVariables: JSON.stringify({
        1: name,
        2: associateId,
        3: downloadUrl
      })
    });
  } catch (error) {
    console.error("Error sending MOU approved WhatsApp message to employee:", error);
  }
};

// Notify AVP that a new MOU is waiting for approval
export const sendMOUApprovalRequestWhatsappMessage = async (to, avpName, associateName, associateId, dashboardUrl) => {
  try {
    console.log("sending MOU approval request whatsapp message to AVP:", to);
    /* 
      Template (AVP Pending - EXACT MATCH):
      🛎️ MOU Approval Required
      Hello {{1}},
      An MOU for Associate {{2}} (ID: {{3}}) has been generated and is pending for your approval. 📄
      📁 Kindly Review & approve here:
      {{4}}
      Thank you,
      Team Inrext
    */
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.mou_approval_request_avp,
      contentVariables: JSON.stringify({
        1: avpName,
        2: associateName,
        3: associateId,
        4: dashboardUrl
      })
    });
  } catch (error) {
    console.error("Error sending MOU approval request WhatsApp message to AVP:", error);
  }
};
