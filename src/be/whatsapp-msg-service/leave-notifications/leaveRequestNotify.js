import twilio from "../twilio.js";

/**
 * Send WhatsApp message to Manager when an employee submits a leave request.
 *
 * Template Name: leave_request_approval (PENDING TWILIO APPROVAL)
 *
 * Template Body (EXACT MATCH - submit this to Twilio for approval):
 * ─────────────────────────────────────────────────────────────────
 * 📋 Leave Approval Required
 *
 * Hi {{1}},
 *
 * {{2}} has submitted a leave request that requires your approval.
 *
 * 🗂 Leave Type: {{3}}
 * 📅 Duration: {{4}} to {{5}}
 * ⏳ Days Requested: {{6}}
 * 📝 Reason: {{7}}
 *
 * Please log in to the CRM portal to approve or reject this request.
 * 🔗 {{8}}
 *
 * Team Inrext
 * ─────────────────────────────────────────────────────────────────
 *
 * Variable Mapping:
 *  {{1}} → Manager's first name
 *  {{2}} → Employee's full name
 *  {{3}} → Leave type (e.g., Casual Leave)
 *  {{4}} → Start date (e.g., Aug 02, 2026)
 *  {{5}} → End date (e.g., Aug 04, 2026)
 *  {{6}} → Total days requested (e.g., 2.5)
 *  {{7}} → Employee's reason
 *  {{8}} → CRM portal URL (approvals section)
 */
export const sendLeaveRequestToManager = async ({
  managerPhone,
  managerName,
  employeeName,
  leaveType,
  startDate,
  endDate,
  daysRequested,
  reason,
}) => {
  try {
    if (!managerPhone) {
      console.warn("[LeaveNotify] Manager phone not available, skipping WhatsApp notification.");
      return;
    }

    const portalUrl = `${process.env.APP_URL || "https://dashboard.inrext.com"}/dashboard/leave`;
    const managerFirstName = managerName?.split(" ")?.[0] || managerName || "Manager";

    console.log(`[LeaveNotify] Sending leave request notification to manager: ${managerName} (${managerPhone})`);

    await twilio.sendMessage({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${managerPhone}`,
      contentSid: twilio.templates.leave_request_approval,
      contentVariables: JSON.stringify({
        1: managerFirstName,
        2: employeeName,
        3: leaveType,
        4: startDate,
        5: endDate,
        6: String(daysRequested),
        7: reason,
        8: portalUrl,
      }),
    });

    console.log(`[LeaveNotify] ✅ Leave request notification sent to manager: ${managerName}`);
  } catch (error) {
    console.error("[LeaveNotify] ❌ Error sending leave request WhatsApp to manager:", error);
  }
};
