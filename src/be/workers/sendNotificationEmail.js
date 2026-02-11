import mailer from "../email-service/mailer.js";
import Notification from "../models/Notification.js";
import Employee from "../models/Employee.js";

// Job handler for sending notification emails
export default async function sendNotificationEmail(job) {
  const timeoutDuration = 30000; // 30 seconds timeout

  try {
    // Wrap the entire operation in a timeout
    const result = await Promise.race([
      sendEmailNotification(job),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Email sending timeout")),
          timeoutDuration
        )
      ),
    ]);

    return result;
  } catch (error) {
    console.error("Error sending notification email:", error.message);

    // Update notification with error (but don't throw to avoid job retry loops)
    if (job.data.notificationId) {
      try {
        await Notification.findByIdAndUpdate(job.data.notificationId, {
          emailError: error.message,
        });
      } catch (updateError) {
        console.error(
          "Failed to update notification error:",
          updateError.message
        );
      }
    }

    // Don't throw for timeout errors to prevent job retry loops
    if (error.message.includes("timeout") || error.code === "ETIMEDOUT") {
      console.log("Email timeout - marking job as completed to avoid retry");
      return; // Complete job without throwing
    }

    throw error; // Throw for other types of errors
  }
}

async function sendEmailNotification(job) {
  try {
    const { notificationId } = job.data;

    // Get notification with populated data
    const notification = await Notification.findById(notificationId)
      .populate("recipient", "name email notificationPreferences")
      .populate("sender", "name email");

    if (!notification) {
      console.error("Notification not found:", notificationId);
      return;
    }

    // Check if email should be sent
    if (!notification.channels.email) {
      console.log("Email not enabled for notification:", notificationId);
      return;
    }

    // Check user's email preferences
    const recipient = notification.recipient;
    const category = getNotificationCategory(notification.type);

    if (recipient.notificationPreferences?.email?.[category] === false) {
      console.log("User has disabled email for category:", category);
      return;
    }

    // Generate email content
    const emailContent = generateEmailContent(notification);

    // Send email
    await mailer.sendEmail(
      recipient.email,
      emailContent.subject,
      emailContent.html
    );

    // Update notification status
    await Notification.findByIdAndUpdate(notificationId, {
      emailSent: true,
      emailSentAt: new Date(),
    });

    console.log("Email notification sent successfully:", notificationId);
  } catch (error) {
    console.error("Error in sendEmailNotification:", error);
    throw error; // Will be caught by the main function
  }
}

function getNotificationCategory(type) {
  const categoryMap = {
    LEAD_ASSIGNED: "leads",
    BULK_LEAD_ASSIGNED: "leads",
    LEAD_STATUS_UPDATE: "leads",
    LEAD_FOLLOWUP_DUE: "leads",
    CAB_BOOKING_APPROVED: "cabBooking",
    CAB_BOOKING_REJECTED: "cabBooking",
    CAB_BOOKING_ASSIGNED: "cabBooking",
    CAB_BOOKING_REQUEST: "cabBooking",
    VENDOR_BOOKING_UPDATE: "vendor",
    VENDOR_ASSIGNED: "vendor",
    MOU_APPROVED: "system",
    MOU_REJECTED: "system",
    MOU_PENDING: "system",
    USER_ROLE_CHANGED: "system",
    NEW_USER_ADDED: "system",
    PROPERTY_UPLOADED: "system",
    PROPERTY_STATUS_UPDATE: "system",
    SYSTEM_ANNOUNCEMENT: "system",
    REMINDER: "system",
    BULK_UPLOAD_COMPLETE: "system",
  };

  return categoryMap[type] || "system";
}

function generateEmailContent(notification) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const actionUrl = notification.metadata.actionUrl
    ? `${baseUrl}${notification.metadata.actionUrl}`
    : `${baseUrl}/dashboard`;

  let subject = `${notification.title} - Inrext CRM`;
  let customMessage = notification.message;
  
  // Customize for bulk assignment
  if (notification.type === "BULK_LEAD_ASSIGNED" || notification.metadata.isBatch) {
    const leadCount = notification.metadata.leadCount || 0;
    const batchId = notification.metadata.batchId || 'N/A';
    subject = `You've been assigned ${leadCount} new leads - Inrext CRM`;
    customMessage = `${leadCount} leads have been assigned to you in batch ${batchId}. Click below to view them.`;
  }
  // Customize for single lead assignment
  else if (notification.type === "LEAD_ASSIGNED" && !notification.metadata.isBatch) {
    const leadName = notification.metadata.leadName || 'Unnamed Lead';
    const leadPhone = notification.metadata.leadPhone || 'N/A';
    const leadLocation = notification.metadata.leadLocation || 'N/A';
    subject = `New Lead Assigned: ${leadName} - Inrext CRM`;
    customMessage = `Lead "${leadName}" (${leadPhone}) from ${leadLocation} has been assigned to you.`;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
          border: 1px solid #e9ecef;
        }
        .priority {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .priority-urgent { background: #ff4444; color: white; }
        .priority-high { background: #ff9800; color: white; }
        .priority-medium { background: #2196f3; color: white; }
        .priority-low { background: #4caf50; color: white; }
        .action-button {
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin-top: 20px;
          font-weight: 600;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #666;
        }
        .type-badge {
          background: #e9ecef;
          color: #495057;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          margin-bottom: 10px;
          display: inline-block;
        }
          .lead-details {
          background: white;
          border-left: 4px solid #007bff;
          padding: 15px;
          margin: 15px 0;
          border-radius: 4px;
        }
        .lead-details h4 {
          margin-top: 0;
          color: #2c3e50;
        }
        .lead-details p {
          margin: 5px 0;
          font-size: 14px;
        }
        .batch-info {
          background: #e8f5e9;
          padding: 10px 15px;
          border-radius: 4px;
          margin: 15px 0;
          border-left: 4px solid #4caf50;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2 style="margin: 0;">📢 New Notification</h2>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">Inrext CRM</p>
      </div>
      
      <div class="content">
        <div class="type-badge">${getTypeDisplayName(notification.type)}</div>
        
        <div style="margin-bottom: 15px;">
          <span class="priority priority-${notification.metadata.priority.toLowerCase()}">
            ${notification.metadata.priority}
          </span>
        </div>
        
        <h3 style="color: #2c3e50; margin-bottom: 15px;">${
          notification.title
        }</h3>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${notification.message}
        </p>

        ${notification.metadata.isBatch && notification.metadata.leadCount ? `
          <div class="batch-info">
            <strong>Batch Assignment Summary:</strong>
            <p>📊 <strong>${notification.metadata.leadCount}</strong> leads assigned</p>
            <p>🆔 Batch ID: ${notification.metadata.batchId || 'N/A'}</p>
          </div>
        ` : ''}
        
        ${!notification.metadata.isBatch && notification.metadata.leadName ? `
          <div class="lead-details">
            <h4>Lead Details:</h4>
            <p><strong>Name:</strong> ${notification.metadata.leadName || 'N/A'}</p>
            <p><strong>Phone:</strong> ${notification.metadata.leadPhone || 'N/A'}</p>
            <p><strong>Location:</strong> ${notification.metadata.leadLocation || 'N/A'}</p>
            <p><strong>Property Type:</strong> ${notification.metadata.leadPropertyType || 'N/A'}</p>
            <p><strong>Budget:</strong> ${notification.metadata.leadBudget || 'N/A'}</p>
          </div>
        ` : ''}
        
        ${
          notification.sender
            ? `
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            <strong>From:</strong> ${notification.sender.name} (${notification.sender.email})
          </p>
        `
            : ""
        }
        
        ${
          notification.metadata.actionUrl
            ? `
          <a href="${actionUrl}" class="action-button">
            View ${notification.metadata.isBatch ? 'Assigned Leads' : 'Lead Details'}
          </a>
        `
            : ""
        }
        
        <div class="footer">
          <p>
            This notification was sent from your Inrext CRM account.<br>
            <a href="${baseUrl}/dashboard/notifications">Manage your notification preferences</a>
          </p>
          <p style="font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} Inrext Private Limited. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

function getTypeDisplayName(type) {
  const typeMap = {
    "LEAD_ASSIGNED": "Lead Assignment",
    "BULK_LEAD_ASSIGNED": "Bulk Lead Assignment",
    "LEAD_STATUS_UPDATE": "Lead Status Update",
    "LEAD_FOLLOWUP_DUE": "Follow-up Due",
    "CAB_BOOKING_APPROVED": "Cab Booking Approved",
    "CAB_BOOKING_REJECTED": "Cab Booking Rejected",
    "CAB_BOOKING_ASSIGNED": "Cab Booking Assigned",
    "CAB_BOOKING_REQUEST": "Cab Booking Request",
    "BULK_UPLOAD_COMPLETE": "Bulk Upload Complete"
  };

  return typeMap[type] || type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
