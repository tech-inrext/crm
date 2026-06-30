import twilio from "../twilio.js";

/**
 * Sends a WhatsApp feedback request to a lead after their site visit is marked as done.
 *
 * Template Variables:
 *   {{1}} - leadName       (e.g. "Aman")
 *   {{2}} - projectName    (e.g. "Dholera")
 *   {{3}} - agentName      (e.g. "Rahul")  — shown as "relationship manager" in template
 *   {{4}} - feedbackUrl    (e.g. "https://...")
 *
 * Approved Twilio Template Body (EXACT — do not modify):
 * ─────────────────────────────────────────────────
 * 🏡 How was your Site Visit?
 *
 * Hi {{1}},
 *
 * Thank you for visiting {{2}} today! We hope you had a great experience. 😊
 *
 * It'll only take 45 seconds to share your experience, and your feedback helps us serve you better.
 *
 * 📝 Please share your feedback here:
 * {{4}}
 *
 * If you have any questions or would like to revisit the property, feel free to reach out to your relationship manager {{3}}.
 *
 * Thank you for choosing Inrext.
 *
 * Warm regards,
 * Team Inrext 🌟
 * ─────────────────────────────────────────────────
 */
export const sendSiteVisitFeedbackWhatsappMessage = async (
  to,
  leadName,
  projectName,
  agentName,
  feedbackUrl
) => {
  try {
    console.log("📲 [Whatsapp] Sending site visit feedback request to lead:", to);
    await twilio.sendMessage({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${to}`,
      contentSid: twilio.templates.site_visit_feedback,
      contentVariables: JSON.stringify({
        1: leadName,
        2: projectName,
        3: agentName,
        4: feedbackUrl,
      }),
    });
    console.log("✅ [Whatsapp] Site visit feedback request sent to lead:", to);
  } catch (error) {
    console.error("Error sending site visit feedback WhatsApp message to lead:", error);
  }
};
