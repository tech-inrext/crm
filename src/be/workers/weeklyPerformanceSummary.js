import Employee from "../models/Employee.js";
import Lead from "../models/Lead.js";
import FollowUp from "../models/FollowUp.js";
import twilio from "../whatsapp-msg-service/twilio.js";
import mongoose from "mongoose";

/**
 * Weekly Performance Summary Job
 * Runs every Tuesday at 9:30 AM
 */
const weeklyPerformanceSummary = async (job) => {
  console.log("📊 [Job] Starting weekly performance summary...");

  try {
    const employees = await Employee.find({}).lean();
    console.log(`[Job] Found ${employees.length} employees to process.`);

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    for (const employee of employees) {
      try {
        if (!employee.phone) continue;

        const stats = await calculateEmployeeStats(employee, lastWeek);
        
        await sendWeeklySummaryWhatsApp(employee, stats);
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

async function calculateEmployeeStats(employee, sinceDate) {
  const employeeId = employee._id;

  // 1. Leads counts (Status-wise) - Current Snapshot
  const leads = await Lead.find({ assignedTo: employeeId }).lean();
  const leadStats = {
    new: leads.filter(l => l.status === "new").length,
    inProgress: leads.filter(l => l.status === "in progress").length,
    detailsShared: leads.filter(l => l.status === "details shared").length,
    closed: leads.filter(l => l.status === "closed").length,
    notInterested: leads.filter(l => l.status === "not interested").length,
  };

  // 2. Activities (Calls/Notes/Site Visits)
  const activities = await FollowUp.find({
    submittedBy: employeeId,
    createdAt: { $gte: sinceDate }
  }).lean();

  const totalActivities = await FollowUp.find({
    submittedBy: employeeId,
    outcome: "pending"
  }).lean();

  const activityStats = {
    callsDone: activities.filter(a => (a.followUpType === "call back" || a.followUpType === "note") && a.outcome === "completed").length,
    callbacksPending: totalActivities.filter(a => (a.followUpType === "call back" || a.followUpType === "note")).length,
    siteVisitsDone: activities.filter(a => a.followUpType === "site visit" && a.outcome === "completed").length,
    siteVisitsPending: totalActivities.filter(a => a.followUpType === "site visit").length,
  };

  // 3. MOU Status (Downline)
  // Get direct reports to calculate MOU summary for managers
  const downline = await Employee.find({ managerId: employeeId.toString() }).lean();
  
  const mouStats = {
    generated: downline.length, // Total employees under this person
    completed: downline.filter(e => e.mouStatus === "Approved").length,
    pending: downline.filter(e => e.mouStatus === "Pending").length,
  };

  return { leadStats, activityStats, mouStats };
}

async function sendWeeklySummaryWhatsApp(employee, stats) {
  try {
    await twilio.client.messages.create({
      from: twilio.whatsappNumber,
      to: `whatsapp:+91${employee.phone}`,
      contentSid: twilio.templates.weekly_performance_summary,
      contentVariables: JSON.stringify({
        1: employee.name,
        2: String(stats.leadStats.new),
        3: String(stats.leadStats.inProgress),
        4: String(stats.leadStats.detailsShared),
        5: String(stats.leadStats.closed),
        6: String(stats.leadStats.notInterested),
        7: String(stats.activityStats.callsDone),
        8: String(stats.activityStats.callbacksPending),
        9: String(stats.activityStats.siteVisitsDone),
        10: String(stats.activityStats.siteVisitsPending),
        11: String(stats.mouStats.generated),
        12: String(stats.mouStats.completed),
        13: String(stats.mouStats.pending),
      })
    });
  } catch (error) {
    console.error(`Error sending weekly summary to ${employee.name}:`, error.message);
  }
}

export default weeklyPerformanceSummary;
