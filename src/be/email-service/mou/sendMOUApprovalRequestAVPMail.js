import mailer from "../mailer.js";

const safe = (v) => (v == null ? "" : String(v));

export async function sendMOUApprovalRequestAVPMail({ avp, employee, appUrl }) {
  if (!avp?.email) return;

  const baseUrl =
    appUrl || process.env.APP_URL || "https://dashboard.inrext.com";

  const subject = `🔔 MOU Approval Required: ${safe(employee.name)}`;

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
    <div style="background-color: #f39c12; color: white; padding: 20px; text-align: center;">
      <h2 style="margin: 0;">🛎️ MOU Approval Required</h2>
    </div>
    
    <div style="padding: 30px;">
      <p>Hello <b>${safe(avp.name)}</b>,</p>
      
      <p>A new Memorandum of Understanding (MOU) has been generated and is pending for your approval.</p>
      
      <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; border-left: 4px solid #f39c12; margin: 20px 0;">
        <p style="margin: 5px 0;">👤 <b>Associate:</b> ${safe(employee.name)}</p>
        <p style="margin: 5px 0;">🆔 <b>ID:</b> ${safe(employee.employeeProfileId || employee._id)}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <p>Kindly review and approve the document here:</p>
        <a href="${baseUrl}/dashboard/mou" target="_blank" style="background-color: #f39c12; color: white; padding: 12px 25px; text-decoration:none; font-weight:bold; border-radius: 5px; display: inline-block;">
          📁 Review & Approve
        </a>
      </div>
      
      <p>Thank you,<br/>
      <b>Team Inrext</b></p>
    </div>
  </div>
  `;

  try {
    await mailer.sendEmail(avp.email, subject, html);
  } catch (err) {
    console.error("Error sending AVP MOU email:", err);
  }
}
