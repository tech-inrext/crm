// /lib/emails/newEmployeeWelcome.js
import mailer from "../mailer.js";

const safe = (v) => (v == null ? "" : String(v));

export async function sendNewEmployeeWelcomeEmail({ employee, appUrl }) {
  if (!employee?.email) return;

  const baseUrl =
    appUrl || process.env.APP_URL || "https://dashboard.inrext.com";

  const html = `
  <p>Dear ${safe(employee.name)},</p>
  <p>We’re excited to have you onboard!</p>
  <p>Your employee account has been created successfully.</p>
  <p><b>Temporary Password:</b> Inrext@123</p>
  <p>
    For security reasons, please <b>reset your password immediately</b> using the 
    <i>Forgot Password</i> option on the login page:<br/>
    <a href="${baseUrl}/login">${baseUrl}/login</a>
  </p>
  <p>If you didn’t request this account, please contact your administrator right away.</p>
  <p>Thanks,<br/>Team Inrext</p>
`;

  await mailer.sendEmail(employee.email, "Welcome to Inrext !!!", html);
}
