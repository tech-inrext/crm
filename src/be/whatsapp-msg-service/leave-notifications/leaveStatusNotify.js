import twilio from "../twilio.js";

/**
 * Send WhatsApp message to Employee when their leave is Approved or Rejected.
 *
 * Template Name: leave_status_update (PENDING TWILIO APPROVAL)
 *
 * Template Body (EXACT MATCH - submit this to Twilio for approval):
 * ─────────────────────────────────────────────────────────────────
 * 📬 Leave Request Update
 *
 * Hi {{1}},
 *
 * Your leave request has been {{2}}.
 *
 * 🗂 Leave Type: {{3}}
 * 📅 Duration: {{4}} to {{5}}
 * ⏳ Days: {{6}}
 * 👤 Action by: {{7}}
 * 💬 Remarks: {{8}}
 *
 * For more details, visit the CRM portal.
 * 🔗 {{9}}
 *
 * Team Inrext
 * ─────────────────────────────────────────────────────────────────
 *
 * Variable Mapping:
 *  {{1}} → Employee's first name
 *  {{2}} → Status (Approved / Rejected)
 *  {{3}} → Leave type (e.g., Sick Leave)
 *  {{4}} → Start date (e.g., Aug 02, 2026)
 *  {{5}} → End date (e.g., Aug 04, 2026)
 *  {{6}} → Total days (e.g., 2.5)
 *  {{7}} → Name of the manager/HR who actioned it
 *  {{8}} → Manager's remarks (or "No remarks" if empty)
 *  {{9}} → CRM portal URL (my leaves section)
 */
export const sendLeaveStatusToEmployee = async ({
  employeePhone,
  employeeName,
  status,
  leaveType,
  startDate,
  endDate,
  daysRequested,
  actionByName,
  managerRemarks,
}) => {
  try {
    const cleanPhone = String(employeePhone).replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      console.warn("[LeaveNotify] Invalid employee phone number, skipping WhatsApp:", employeePhone);
      return;
    }

    const portalUrl = `${process.env.APP_URL || "https://dashboard.inrext.com"}/dashboard/leave`;
    const employeeFirstName = employeeName?.split(" ")?.[0] || employeeName || "Employee";
    const remarks = managerRemarks?.trim() || "No remarks";

    console.log(`[LeaveNotify] Sending leave ${status} notification to employee: ${employeeName} (${cleanPhone})`);

    await twilio.sendMessage({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${cleanPhone}`,
      contentSid: twilio.templates.leave_status_update,
      contentVariables: JSON.stringify({
        1: employeeFirstName,
        2: status,
        3: leaveType,
        4: startDate,
        5: endDate,
        6: String(daysRequested),
        7: actionByName || "Manager",
        8: remarks,
        9: portalUrl,
      }),
    });

    console.log(`[LeaveNotify] ✅ Leave ${status} notification sent to employee: ${employeeName}`);
  } catch (error) {
    console.error("[LeaveNotify] ❌ Error sending leave status WhatsApp to employee:", error);
  }
};
