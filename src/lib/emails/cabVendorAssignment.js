// /lib/emails/cabVendorAssignment.js
import { mailer } from "@/lib/mailer";

export async function sendCabVendorAssignmentEmail({
  vendor, // Employee doc (must have email)
  booking, // CabBooking doc
  employee, // Employee who booked (optional but useful)
  manager, // Approver (optional)
  appUrl,
}) {
  if (!vendor || !vendor.email) return;

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
    <p>Dear ${safe(vendor.name) || "Vendor"},</p>
    <p>You have been assigned a new cab booking.</p>
    <ul>
      <li><b>Booking ID:</b> ${safe(booking?.bookingId)}</li>
      <li><b>Project:</b> ${safe(booking?.project)}</li>
      <li><b>Client Name:</b> ${safe(booking?.clientName)}</li>
      <li><b>Pickup Point:</b> ${safe(booking?.pickupPoint)}</li>
      <li><b>Drop Point:</b> ${safe(booking?.dropPoint)}</li>
      <li><b>Date/Time:</b> ${safe(when)}</li>
      ${
        employee
          ? `<li><b>Booked By:</b> ${safe(employee.name)} (${safe(
              employee.email
            )})</li>`
          : ""
      }
      ${
        manager
          ? `<li><b>Manager:</b> ${safe(manager.name)} (${safe(
              manager.email
            )})</li>`
          : ""
      }
    </ul>
    <p>Please <a href="${baseUrl}/dashboard/cab-booking">log in</a> to view full details and proceed.</p>
    <p>Thank you.</p>
  `;

  await mailer({
    to: vendor.email,
    subject: `New Cab Assignment • ${safe(booking?.bookingId)}`,
    html,
  });
}
