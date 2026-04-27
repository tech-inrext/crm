import Employee from "../models/Employee.js";
import Lead from "../models/Lead.js";
import FollowUp from "../models/FollowUp.js";
import twilio from "../whatsapp-msg-service/twilio.js";
import { sendWeeklySummaryEmail } from "../email-service/weekly-performance-summary/weeklyPerformanceEmail.js";
import mongoose from "mongoose";

/**
 * Weekly Performance Summary Job
 * Runs every Monday at 9:00 AM
 */
const weeklyPerformanceSummary = async (job) => {
  console.log("📊 [Job] Starting weekly performance summary...");

  try {
    const employees = await Employee.find({ email: { $exists: true } }).lean();
    console.log(`[Job] Found ${employees.length} employees to process.`);

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateRange = formatDateRange(lastWeek, now);

    for (const employee of employees) {
      try {
        const stats = await calculateEmployeeStats(employee, lastWeek);
        
        // Send WhatsApp if phone exists
        if (employee.phone) {
          await sendWeeklySummaryWhatsApp(employee, stats, dateRange);
        }

        // Send Email
        if (employee.email) {
          await sendWeeklySummaryEmail(employee, stats, dateRange);
        }

        console.log(`✅ [Job] Summary sent to ${employee.name} (${employee.employeeProfileId})`);
      } catch (err) {
        console.error(`❌ [Job] Failed to process summary for ${employee.name}:`, err.message);
      }
    }

    console.log("✅ [Job] Weekly performance summary completed.");
  } catch (error) {
    console.error("❌ [Job] Fatal error in weeklyPerformanceSummary:", error);
    throw error;
  }
};

function formatDateRange(start, end) {
  const format = (d) => {
    const day = d.getDate();
    const month = d.toLocaleString('en-IN', { month: 'long' });
    const suffix = (n) => {
      if (n > 3 && n < 21) return 'th';
      switch (n % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
      }
    };
    return `${day}${suffix(day)} ${month}`;
  };
  return `${format(start)} to ${format(end)}`;
}

export async function calculateEmployeeStats(employee, sinceDate) {
  const employeeId = employee._id;

  // 1. Leads counts (Status-wise) - Last 1 Week Snapshot vs Overall
  const leadsRaw = await Lead.find({ assignedTo: employeeId }).lean();
  
  // Last 1 week breakdown (based on updatedAt)
  const lastWeekLeads = leadsRaw.filter(l => l.updatedAt >= sinceDate);
  
  const leadStats = {
    new: lastWeekLeads.filter(l => l.status === "new").length,
    inProgress: lastWeekLeads.filter(l => l.status === "in progress").length,
    detailsShared: lastWeekLeads.filter(l => l.status === "details shared").length,
    closed: lastWeekLeads.filter(l => l.status === "closed").length,
    notInterested: lastWeekLeads.filter(l => l.status === "not interested").length,
    
    // Overall counts
    overallTotal: leadsRaw.length,
    overallInProgress: leadsRaw.filter(l => l.status === "in progress").length,
    overallClosed: leadsRaw.filter(l => l.status === "closed").length,
  };

  // 2. Activities (Calls/Site Visits) - Based on followUpDate (scheduled_at)
  const activities = await FollowUp.find({
    submittedBy: employeeId,
    followUpDate: { $gte: sinceDate, $lte: new Date() },
    outcome: "completed"
  }).lean();

  const totalPendingActivities = await FollowUp.find({
    submittedBy: employeeId,
    outcome: "pending"
  }).lean();

  const activityStats = {
    callsDone: activities.filter(a => (a.followUpType === "call back" || a.followUpType === "note")).length,
    siteVisitsDone: activities.filter(a => a.followUpType === "site visit").length,
    // Add pending for WhatsApp template compatibility
    callbacksPending: totalPendingActivities.filter(a => (a.followUpType === "call back" || a.followUpType === "note")).length,
    siteVisitsPending: totalPendingActivities.filter(a => a.followUpType === "site visit").length,
  };

  // 3. MOU Status (Downline added in last 1 week)
  const downlineLastWeek = await Employee.find({ 
    managerId: employeeId.toString(),
    createdAt: { $gte: sinceDate }
  }).lean();
  
  const mouStats = {
    generated: downlineLastWeek.length,
    approved: downlineLastWeek.filter(e => e.mouStatus === "Approved").length,
    pending: downlineLastWeek.filter(e => e.mouStatus === "Pending" || !e.mouStatus).length,
  };

  return { leadStats, activityStats, mouStats };
}

export async function sendWeeklySummaryWhatsApp(employee, stats, dateRange) {
  try {
    if (!twilio.templates.weekly_performance_summary) return;

    const { overallTotal, overallClosed } = stats.leadStats;
    const conversionRate = overallTotal > 0 ? ((overallClosed / overallTotal) * 100).toFixed(1) : "0.0";
    
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${employee.phone}`,
      contentSid: twilio.templates.weekly_performance_summary,
      contentVariables: JSON.stringify({
        1: dateRange,
        2: employee.name,
        3: String(stats.leadStats.new),
        4: String(stats.leadStats.inProgress),
        5: String(stats.leadStats.detailsShared),
        6: String(stats.leadStats.closed),
        7: String(stats.leadStats.notInterested),
        8: String(stats.activityStats.callsDone),
        9: String(stats.activityStats.siteVisitsDone),
        10: String(stats.mouStats.generated),
        11: String(stats.mouStats.approved),
        12: String(stats.mouStats.pending),
        13: String(overallTotal),
        14: String(overallClosed),
        15: String(conversionRate),
      })
    });
  } catch (error) {
    console.error(`Error sending weekly summary WhatsApp to ${employee.name}:`, error.message);
  }
}


export default weeklyPerformanceSummary;
