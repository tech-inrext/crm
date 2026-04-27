import mailer from "../mailer.js";

/**
 * Generate Weekly Email HTML
 */
export const generateEmailContent = (employee, stats, dateRange) => {
  const name = employee?.name || "Team Member";

  const leadStats = stats?.leadStats || {};
  const activityStats = stats?.activityStats || {};
  const mouStats = stats?.mouStats || {};

  const totalLeads = leadStats.overallTotal || 0;
  const closedLeads = leadStats.overallClosed || 0;

  const conversionRate =
    totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : 0;

  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0; padding:0; background:#f4f7f9; font-family: Arial, sans-serif;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f9; padding:20px;">
      <tr>
        <td align="center">

          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">
            
            <!-- HEADER -->
            <tr>
              <td style="background:#2a5298; color:#fff; text-align:center; padding:20px;">
                <h2 style="margin:0;">📊 Weekly Performance</h2>
                <p style="margin:5px 0 0;">${dateRange}</p>
              </td>
            </tr>

            <!-- CONTENT -->
            <tr>
              <td style="padding:20px;">

                <p><strong>Hi ${name},</strong></p>

                <!-- LEADS -->
                <h3>📌 Leads Overview</h3>
                <table width="100%" cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse; font-size:14px;">
                  <tr>
                    <td>🆕 New</td>
                    <td>${leadStats.new || 0}</td>
                  </tr>
                  <tr>
                    <td>🔄 In Progress</td>
                    <td>${leadStats.inProgress || 0}</td>
                  </tr>
                  <tr>
                    <td>📤 Details Shared</td>
                    <td>${leadStats.detailsShared || 0}</td>
                  </tr>
                  <tr>
                    <td>✅ Closed</td>
                    <td>${leadStats.closed || 0}</td>
                  </tr>
                  <tr>
                    <td>❌ Not Interested</td>
                    <td>${leadStats.notInterested || 0}</td>
                  </tr>
                </table>

                <!-- ACTIVITIES -->
                <h3>📞 Activities</h3>
                <table width="100%" cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse; font-size:14px;">
                  <tr>
                    <td>📲 Calls Done</td>
                    <td>${activityStats.callsDone || 0}</td>
                  </tr>
                  <tr>
                    <td>🏡 Site Visits</td>
                    <td>${activityStats.siteVisitsDone || 0}</td>
                  </tr>
                </table>

                <!-- MOU -->
                <h3>📄 MOU Status</h3>
                <table width="100%" cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse; font-size:14px;">
                  <tr>
                    <td>📝 Generated</td>
                    <td>${mouStats.generated || 0}</td>
                  </tr>
                  <tr>
                    <td>✅ Approved</td>
                    <td>${mouStats.approved || 0}</td>
                  </tr>
                  <tr>
                    <td>⏳ Pending</td>
                    <td>${mouStats.pending || 0}</td>
                  </tr>
                </table>

                <!-- OVERALL -->
                <h3>📊 Overall Performance</h3>
                <table width="100%" cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse; font-size:14px;">
                  <tr>
                    <td>Total Leads</td>
                    <td>${totalLeads}</td>
                  </tr>
                  <tr>
                    <td>Closed Leads</td>
                    <td>${closedLeads}</td>
                  </tr>
                  <tr>
                    <td><strong>Conversion Rate</strong></td>
                    <td><strong>${conversionRate}%</strong></td>
                  </tr>
                </table>

                <br/>

                <p style="font-size:13px; color:#555;">
                  ⚡ Keep pushing towards higher conversions and better engagement!
                </p>

              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#777;">
                This is an automated weekly summary.<br/>
                © ${new Date().getFullYear()} Your Company
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};


/**
 * Send Weekly Summary Email
 */
export const sendWeeklySummaryEmail = async (employee, stats, dateRange) => {
  try {
    // ✅ Validate
    if (!employee?.email) {
      console.warn(`⚠️ Missing email for ${employee?.name || "Unknown User"}`);
      return;
    }

    const subject = `📊 Your Weekly Performance Summary (${dateRange})`;

    const html = generateEmailContent(employee, stats, dateRange);

    await mailer.sendEmail(employee.email, subject, html);

    console.log(`✅ Email sent to ${employee.name} (${employee.email})`);
  } catch (error) {
    console.error(
      `❌ Error sending email to ${employee?.name || "Unknown"}:`,
      error?.message || error
    );
  }
};


/**
 * Send Emails to All Employees
 */
export const sendWeeklySummaryToAll = async (employees, statsMap, dateRange) => {
  for (const emp of employees) {
    const stats = statsMap[emp.id] || {};
    await sendWeeklySummaryEmail(emp, stats, dateRange);
  }
};