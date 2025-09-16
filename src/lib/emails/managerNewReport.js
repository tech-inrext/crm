import mailer from "../mailer";

const safe = (v) => (v == null ? "" : String(v));

export async function sendManagerNewReportEmail({ manager, employee, appUrl }) {
  if (!manager?.email) return;

  const baseUrl =
    appUrl || process.env.APP_URL || "https://dashboard.inrext.com";

  const html = `
    <p>Dear ${safe(manager.name)},</p>
    <p>A new employee has been added under your supervision.</p>
    <ul>
      <li><b>Name:</b> ${safe(employee.name)}</li>
      <li><b>Email:</b> ${safe(employee.email)}</li>
      <li><b>Phone:</b> ${safe(employee.phone)}</li>
      <li><b>Designation:</b> ${safe(employee.designation || "-")}</li>
    </ul>
    <p>You can review their details in the dashboard:</p>
    <p><a href="${baseUrl}/dashboard/employees">${baseUrl}/dashboard/employees</a></p>
    <p>Thanks,<br/>Team Inrext</p>
  `;

  await mailer.sendEmail({
    to: manager.email,
    subject: "New Team Member Assigned To You",
    html,
  });
}
