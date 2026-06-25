import mailer from "../mailer.js";
import { emailTemplates } from "../templates/email-templates.js";

export async function sendSiteVisitFeedbackEmail(recipientEmail, leadName, feedbackUrl) {
  try {
    // console.log(`[sendSiteVisitFeedbackEmail] Attempting to send feedback email to: ${recipientEmail}`);
    const html = emailTemplates.feedbackRequest({ name: leadName || "Valued Client", feedbackUrl });
    await mailer.sendEmail(recipientEmail, "We Value Your Feedback", html);
    // console.log(`[sendSiteVisitFeedbackEmail] Successfully sent feedback email to: ${recipientEmail}`);
  } catch (error) {
    console.error("Error sending feedback email:", error);
  }
}
