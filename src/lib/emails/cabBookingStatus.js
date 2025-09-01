// /lib/emails/cabBookingStatus.js
import { mailer } from "@/lib/mailer";

export async function sendCabBookingStatusEmail({
  employee,
  manager,
  booking,
  status, // "approved" | "rejected"
  appUrl,
}) {
  if (!employee || !employee.email) return; // nothing to send

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

  const statusText =
    status === "approved"
      ? "✅ Your cab booking request has been approved."
      : "❌ Unfortunately, your cab booking request has been rejected.";

  const html = `
    <p>Dear ${safe(employee.name) || "Employee"},</p>
    <p>${statusText}</p>
    <ul>
      <li><b>Project:</b> ${safe(booking?.project)}</li>
      <li><b>Client Name:</b> ${safe(booking?.clientName)}</li>
      <li><b>Pickup Point:</b> ${safe(booking?.pickupPoint)}</li>
      <li><b>Drop Point:</b> ${safe(booking?.dropPoint)}</li>
      <li><b>Date/Time:</b> ${safe(when)}</li>
      <li><b>Booking ID:</b> ${safe(booking?.bookingId)}</li>
      <li><b>Reviewed By:</b> ${safe(manager?.name) || "Manager"}</li>
    </ul>
    <p>You can <a href="${baseUrl}/dashboard/cab-booking">log in</a> to view more details.</p>
    <p>Thank you.</p>
  `;

  await mailer({
    to: employee.email,
    subject: `Cab Booking ${status === "approved" ? "Approved" : "Rejected"}`,
    html,
  });
}
