import mailer from "../mailer.js";

export async function sendMOUApprovalMail(
  to,
  name,
  employeeProfileId,
  mouPdfS3Url
) {
  const subject = "MOU Approved – Welcome to Our Network!";

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
    <h2 style="color:#0066cc;">MOU Approved!</h2>
    <p>Dear <b>${name}</b>,</p>
    
    <p>We are delighted to inform you that your <b>Memorandum of Understanding (MOU)</b> with us has been approved. 
    Welcome aboard! 🎉</p>
    
    <p>Your unique Associate ID is: <b>${employeeProfileId}</b></p>
    
    <p>As part of our network, you will have access to resources, expert support, and business opportunities designed 
    to help you succeed. We are confident that this partnership will create lasting value and growth for both sides.</p>
    
    <p>
      Please review your approved MOU document by clicking the link below:<br/>
      <a href="${mouPdfS3Url}" target="_blank" style="color:#0066cc; text-decoration:none; font-weight:bold;">
        Download MOU PDF
      </a>
    </p>
    
    <p>Kindly review and confirm by replying to this email as a token of acceptance.</p>
    
    <p>We look forward to building a successful journey together.</p>
    
    <p style="margin-top:20px;">Best regards,<br/>
    <b>Team Inrext</b><br/>
    Inrext Private Limited<br/>
    Noida, Uttar Pradesh</p>
  </div>
  `;

  try {
    await mailer.sendEmail(to, subject, html);
    console.log("MOU approval mail sent successfully with S3 link!");
  } catch (err) {
    console.error("Error sending email:", err);
  }
}
