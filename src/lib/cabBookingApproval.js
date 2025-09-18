// /lib/emails/cabBookingApproval.js
import mailer from "./mailer.js";

export async function sendCabBookingApprovalEmail({
  manager,
  employee,
  booking,
  appUrl,
}) {
  if (!manager || !manager.email) return; // nothing to send

  const baseUrl =
    appUrl || process.env.APP_URL || "https://dashboard.inrext.com";
  const safe = (v) => (v == null ? "" : String(v));

  const when = booking?.requestedDateTime
    ? new Date(booking.requestedDateTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const html = `
    <p>Dear ${safe(manager.name) || "Manager"},</p>
    <p>You have a new cab booking request from <b>${
      safe(employee?.name) || "An employee"
    }</b> that requires your approval.</p>
    <ul>
      <li><b>Project:</b> ${safe(booking?.project)}</li>
      <li><b>Client Name:</b> ${safe(booking?.clientName)}</li>
      <li><b>Pickup Point:</b> ${safe(booking?.pickupPoint)}</li>
      <li><b>Drop Point:</b> ${safe(booking?.dropPoint)}</li>
      <li><b>Date/Time:</b> ${safe(when)}</li>
      <li><b>Booking ID:</b> ${safe(booking?.bookingId)}</li>
    </ul>
    <p>Please <a href="${baseUrl}/dashboard/cab-booking">log in</a> to review and approve or reject this request.</p>
    <p>Thank you.</p>
  `;

  await mailer.sendEmail(manager.email, "Cab Booking Approval Request", html);
}
