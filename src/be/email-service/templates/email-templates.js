// File: pages/api/emails/templates.js

// Reusable HTML templates for lead emails

export const emailTemplates = {
  welcome: ({ name }) => `
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for your interest in our properties. Our team will contact you shortly.</p>
    `,

  followUp: ({ name }) => `
      <h2>Hi ${name}, just following up!</h2>
      <p>We noticed you showed interest in one of our listings. Let us know if you'd like a site visit or more info.</p>
    `,

  siteVisitReminder: ({ name, date }) => `
      <h2>Site Visit Reminder</h2>
      <p>Hi ${name}, this is a reminder for your scheduled site visit on <strong>${date}</strong>.</p>
      <p>Our team is excited to show you around!</p>
    `,

  thankYou: ({ name }) => `
      <h2>Thank You, ${name}!</h2>
      <p>We appreciate your visit. Please reach out if you have any questions or need further assistance.</p>
    `,

  feedbackRequest: ({ name, feedbackUrl }) => `
      <h2>We value your feedback, ${name}!</h2>
      <p>Thank you for visiting the site. Please take a moment to share your feedback by clicking the link below:</p>
      <p><a href="${feedbackUrl}" style="display:inline-block;padding:10px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:5px;">Share Feedback</a></p>
      <p>Or copy this link: ${feedbackUrl}</p>
    `,
};
