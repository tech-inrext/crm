import mailer from "../mailer.js";

export const sendRoleChangeEmail = async ({
  adminEmail,
  changedByName,
  changedByEmail,
  changedEmployeeName,
  changedEmployeeEmail,
  newRole,
  addedRoles = [],
  removedRoles = [],
}) => {
  const subject = `Role Update by ${changedByName} – ${changedEmployeeName}'s Access Modified`;

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h3 style="margin-bottom: 10px;">🔔 Employee Role Change Notification</h3>

      <p>
        <strong>${changedByName}</strong> (<a href="mailto:${changedByEmail}" style="color:#0066cc;text-decoration:none;">${changedByEmail}</a>)
        has updated the role(s) of <strong>${changedEmployeeName}</strong>
        (<a href="mailto:${changedEmployeeEmail}" style="color:#0066cc;text-decoration:none;">${changedEmployeeEmail}</a>).
      </p>

      ${
        addedRoles.length > 0
          ? `<p style="color:green;"><b>Added:</b> ${addedRoles.join(", ")}</p>`
          : ""
      }
      ${
        removedRoles.length > 0
          ? `<p style="color:red;"><b>Removed:</b> ${removedRoles.join(
              ", "
            )}</p>`
          : ""
      }

      <p><b>New Role(s):</b> ${newRole || "No roles assigned"}</p>

      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">

      <p style="font-size: 13.5px; color: #666;">
        Please review if this change aligns with company policies.
      </p>
    </div>
  `;

  try {
    await mailer.sendEmail(adminEmail, subject, html);
    console.log(`✅ Role change email sent to admin (${adminEmail})`);
  } catch (error) {
    console.error("❌ Error sending role change email:", error);
  }
};
