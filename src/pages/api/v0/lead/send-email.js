// File: pages/api/send-lead-mail.js
import nodemailer from "nodemailer";
import { emailTemplates } from "../emails/templates";


// Setup reusable transporter using SMTP (e.g., Gmail or Mailtrap)
const transporter = nodemailer.createTransport({
  service: "gmail", // or use 'Mailtrap', 'SendinBlue', etc.
  auth: {
    user: process.env.SMTP_EMAIL, // your email
    pass: process.env.SMTP_PASS, // your email password or app password
  },
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST allowed" });
  }

   const { to, subject, templateName, templateData } = req.body;

   if (!to || !subject || !templateName || !templateData) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields (to, subject, templateName, templateData)",
    });
  }

  const templateFunc = emailTemplates[templateName];

  if (!templateFunc) {
    return res.status(400).json({ success: false, message: "Invalid template name" });
  }

  const htmlContent = templateFunc(templateData);

  try {
    const mailOptions = {
      from: process.env.SMTP_EMAIL,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
