import mailer from "../mailer.js";

export async function sendOTPEmail(to, otp) {
  if (!to) {
    throw new Error("No recipient specified for OTP email");
  }

  const subject = "Your OTP for Password Reset";
  const html = `
    <p>Use the following OTP to reset your password:</p>
    <h2>${otp}</h2>
    <p>This OTP is valid for 10 minutes.</p>
  `;

  await mailer.sendEmail(to, subject, html);
}
