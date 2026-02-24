import mailer from "../mailer.js";
import Lead from "../../models/Lead.js";
import FollowUp from "../../models/FollowUp.js";

export async function sendFollowUpEmail(recipientEmail, notification) {
    try {
        const leadId = notification.metadata.leadId;
        if (!leadId) {
            throw new Error("No leadId found in notification metadata");
        }

        // Fetch lead and follow-up details for a rich email
        const lead = await Lead.findById(leadId);
        const followUpDoc = await FollowUp.findOne({ leadId }).sort({ createdAt: -1 });

        if (!lead) {
            throw new Error(`Lead not found: ${leadId}`);
        }

        const type = followUpDoc?.followUpType || "follow-up";
        const note = followUpDoc?.note || notification.message;
        const date = followUpDoc?.followUpDate ? new Date(followUpDoc.followUpDate).toLocaleString() : notification.scheduledFor ? new Date(notification.scheduledFor).toLocaleString() : "Now";

        const emailContent = generateFollowUpTemplate({
            leadName: lead.fullName || "Valued Client",
            leadPhone: lead.phone || "N/A",
            leadEmail: lead.email || "N/A",
            propertyName: lead.propertyName || "N/A",
            followUpType: type,
            followUpDate: date,
            notes: note,
            notificationTitle: notification.title,
            priority: notification.metadata.priority || "MEDIUM",
            actionUrl: notification.metadata.actionUrl
        });

        await mailer.sendEmail(recipientEmail, emailContent.subject, emailContent.html);
    } catch (error) {
        console.error("Error sending follow-up email:", error);
        // Fallback to basic notification email if data fetching fails
        throw error;
    }
}

function generateFollowUpTemplate(data) {
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const actionUrl = data.actionUrl ? `${baseUrl}${data.actionUrl}` : `${baseUrl}/dashboard`;
    const subject = `📅 ${data.followUpType.toUpperCase()} Reminder: ${data.leadName} - Inrext CRM`;

    const typeColor = data.followUpType === "site visit" ? "#4f46e5" : data.followUpType === "call back" ? "#0891b2" : "#71717a";
    const priorityColor = data.priority === "URGENT" ? "#dc2626" : data.priority === "HIGH" ? "#ea580c" : "#2563eb";

    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%); color: white; padding: 32px 40px; text-align: center; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
        .type-badge { background-color: ${typeColor}; color: white; }
        .priority-badge { background-color: #ffffff20; color: white; border: 1px solid #ffffff40; margin-left: 8px; }
        .content { padding: 40px; }
        .section-title { font-size: 14px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; }
        .detail-row { display: flex; margin-bottom: 12px; }
        .detail-label { width: 140px; font-weight: 600; color: #4b5563; font-size: 14px; }
        .detail-value { flex: 1; color: #111827; font-size: 14px; }
        .notes-box { background-color: #f9fafb; border-left: 4px solid #d1d5db; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0; font-style: italic; color: #374151; }
        .footer { background-color: #f9fafb; padding: 24px 40px; text-align: center; font-size: 12px; color: #6b7280; }
        .button { display: inline-block; background-color: #4f46e5; color: white !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 24px; transition: background-color 0.2s; }
        .property-highlight { color: #4f46e5; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge type-badge">${data.followUpType}</div>
          <div class="badge priority-badge" style="background-color: ${priorityColor}; border:none">${data.priority}</div>
          <h1 style="margin: 0; font-size: 24px; letter-spacing: -0.025em;">${data.notificationTitle}</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.8; font-size: 16px;">Scheduled: <strong>${data.followUpDate}</strong></p>
        </div>
        
        <div class="content">
          <div class="section-title">Lead Information</div>
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value" style="font-weight:700">${data.leadName}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Phone:</div>
            <div class="detail-value"><a href="tel:${data.leadPhone}" style="color: #4f46e5; text-decoration: none;">${data.leadPhone}</a></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${data.leadEmail}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Property:</div>
            <div class="detail-value property-highlight">${data.propertyName}</div>
          </div>

          <div class="section-title">Follow-up Details</div>
          <p style="margin-top: 0; font-size: 15px;">A reminder for your <strong>${data.followUpType}</strong> with ${data.leadName}.</p>
          
          <div class="notes-box">
            " ${data.notes} "
          </div>

          <div style="text-align: center;">
            <a href="${actionUrl}" class="button">View Lead Details</a>
          </div>
        </div>

        <div class="footer">
          <p>© ${new Date().getFullYear()} Inrext CRM. All rights reserved.</p>
          <p>This is an automated notification. Please do not reply to this email.</p>
          <p><a href="${baseUrl}/dashboard/settings" style="color: #6b7280; text-decoration: underline;">Notification Preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

    return { subject, html };
}
