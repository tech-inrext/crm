// src/workers/sendOTPJob.js
import { sendOTPEmail } from "../lib/sendOTPEmail.js";

const sendOTPJob = async (job) => {
  const { email, otp } = job.data;

  try {
    await sendOTPEmail(email, otp);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send OTP to ${email}:`, error.message);
    throw error;
  }
};

export default sendOTPJob;
