import nodemailer from "nodemailer";

class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASS,
      },
      // Enhanced timeout configurations
      connectionTimeout: 30000, // 30 seconds
      greetingTimeout: 10000, // 10 seconds
      socketTimeout: 60000, // 60 seconds
      // Enhanced pool settings
      pool: true,
      maxConnections: 10,
      maxMessages: 100,
      rateDelta: 1000, // 1 second
      rateLimit: 5, // Max 5 emails per second
    });

    this.senderEmail = process.env.SMTP_EMAIL;

    // Verify transporter on startup
    this.verifyConnection();
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
    } catch (error) {
      console.error("❌ SMTP connection verification failed:", error.message);
    }
  }

  async sendEmail(to, subject, html, options = {}) {
    const maxRetries = options.maxRetries || 3;
    const retryDelay = options.retryDelay || 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mailOptions = {
          from: `"Inrext CRM" <${this.senderEmail}>`,
          to,
          subject,
          html,
          // Add message ID for tracking
          messageId: options.messageId || undefined,
          // Add headers for better deliverability
          headers: {
            "X-Entity-Ref-ID": options.entityId || "notification",
            "X-Notification-Type": options.notificationType || "system",
          },
        };

        const result = await this.transporter.sendMail(mailOptions);
        console.log(`✅ Email sent successfully on attempt ${attempt}:`, {
          to,
          subject,
          messageId: result.messageId,
          response: result.response,
        });
        return result;
      } catch (error) {
        console.error(`❌ Email attempt ${attempt} failed:`, {
          to,
          subject,
          error: error.message,
          code: error.code,
        });

        // Don't retry on certain permanent errors
        if (this.isPermanentError(error)) {
          console.error(
            `Permanent email error, not retrying: ${error.message}`
          );
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempt)
        );
      }
    }
  }

  isPermanentError(error) {
    const permanentCodes = ["EENVELOPE", "EMESSAGE"];
    const permanentMessages = [
      "invalid recipient",
      "mailbox unavailable",
      "user unknown",
    ];

    return (
      permanentCodes.includes(error.code) ||
      permanentMessages.some((msg) => error.message.toLowerCase().includes(msg))
    );
  }

  // Batch email sending with rate limiting
  async sendBulkEmails(emails) {
    const results = [];
    const batchSize = 5;

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      const batchPromises = batch.map(async (emailData) => {
        try {
          const result = await this.sendEmail(
            emailData.to,
            emailData.subject,
            emailData.html,
            emailData.options
          );
          return { success: true, result, ...emailData };
        } catch (error) {
          return { success: false, error: error.message, ...emailData };
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      results.push(
        ...batchResults.map(
          (r) => r.value || { success: false, error: r.reason?.message }
        )
      );

      // Rate limiting delay between batches
      if (i + batchSize < emails.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

const mailer = new Mailer();

export default mailer;
