// src/workers/sendWhatsAppJob.js
import { sendViaGupshup } from "../service/gupshupService.js";

export default async function sendWhatsAppJob(job) {
  const { to, templateName, parameters } = job.data;

  try {
    await sendViaGupshup({ to, templateName, parameters });
    console.log("✅ WhatsApp message sent via Gupshup");
  } catch (error) {
    console.error("❌ Failed to send WhatsApp message:", error.message);
  }
}
