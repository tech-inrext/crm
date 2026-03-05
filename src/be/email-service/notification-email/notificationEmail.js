import mailer from "../mailer.js";

function getTypeDisplayName(type) {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function generateEmailContent(notification) {
  const baseUrl = process.env.APP_URL || "http://localhost:3000";
  const actionUrl = notification.metadata.actionUrl
    ? `${baseUrl}${notification.metadata.actionUrl}`
    : `${baseUrl}/dashboard`;

  const subject = `${notification.title} - Inrext CRM`;

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
        
        <h3 style="color: #2c3e50; margin-bottom: 15px;">${notification.title}</h3>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          ${notification.message}
        </p>
        
        ${notification.sender
      ? `
          <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
            <strong>From:</strong> ${notification.sender.name} (${notification.sender.email})
          </p>
        `
      : ""
    }
        
        ${notification.metadata.actionUrl
      ? `
          <a href="${actionUrl}" class="action-button">
            View Details
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

export async function sendNotificationEmail(recipientEmail, notification) {
  const emailContent = generateEmailContent(notification);
  await mailer.sendEmail(recipientEmail, emailContent.subject, emailContent.html);
}

