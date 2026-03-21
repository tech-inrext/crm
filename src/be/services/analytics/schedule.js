import dbConnect from "@/lib/mongodb";
import FollowUp from "../../models/FollowUp";
import Lead from "../../models/Lead";

class ScheduleAnalyticsService {
  async getSchedule(req, res) {
    try {
      await dbConnect();

      const employee = req.employee;
      const loggedInUserId = employee?._id;
      if (!loggedInUserId) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized: No logged-in user",
        });
      }

      // ===== TODAY RANGE =====
      const now = new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(now);
      endOfToday.setHours(23, 59, 59, 999);

      // ===== WEEK RANGE (Monday - Sunday) =====
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      // ===== COMMON FILTER: only follow-ups with leads assigned to logged-in user =====
      const commonFilter = {
        followUpDate: { $exists: true, $ne: null },
      };

      // ===== POPULATION CONFIG =====
      const populateLeadAssignedTo = {
        path: "leadId",
        model: Lead,
        select: "leadId fullName phone status source location assignedTo",
        populate: {
          path: "assignedTo",
          select: "_id firstName lastName fullName email name",
        },
      };

      // ===== FETCH FOLLOWUPS =====
      const filterByAssignedTo = async (start, end) => {
        const followUps = await FollowUp.find({
          ...commonFilter,
          followUpDate: { $gte: start, $lte: end },
        })
          .populate(populateLeadAssignedTo)
          .lean();

        // Only keep follow-ups assigned to logged-in user
        return followUps.filter((doc) => {
          const lead = doc.leadId;
          if (!lead || !lead.assignedTo) return false;

          const assignedUsers = Array.isArray(lead.assignedTo)
            ? lead.assignedTo
            : [lead.assignedTo];

          return assignedUsers.some(
            (u) => u._id.toString() === loggedInUserId.toString()
          );
        });
      };

      const todays = await filterByAssignedTo(startOfToday, endOfToday);
      const weekly = await filterByAssignedTo(monday, sunday);
      const overdue = await filterByAssignedTo(new Date(0), startOfToday);

      // ===== FORMAT FUNCTION =====
      const formatFollowUps = (items) =>
        items.map((doc) => {
          const lead = doc.leadId;
          let assignedToUser = null;

          if (lead?.assignedTo) {
            assignedToUser = Array.isArray(lead.assignedTo)
              ? lead.assignedTo[0]
              : lead.assignedTo;
          }

          const assignedTo = assignedToUser
            ? {
                name:
                  assignedToUser.name?.trim() ||
                  `${assignedToUser.firstName ?? ""} ${assignedToUser.lastName ?? ""}`.trim() ||
                  assignedToUser.fullName?.trim() ||
                  assignedToUser.email ||
                  "Unassigned",
                email: assignedToUser.email ?? null,
              }
            : { name: "Unassigned", email: null };

          return {
            id: doc._id,
            followUpDate: doc.followUpDate,
            followUpTime: doc.followUpDate
              ? new Date(doc.followUpDate).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  timeZone: "Asia/Kolkata",
                })
              : null,
            note: doc.note || "",
            followUpType: doc.followUpType || "",
            lead: lead
              ? {
                  id: lead._id,
                  leadId: lead.leadId,
                  fullName: lead.fullName,
                  phone: lead.phone,
                  status: lead.status,
                  source: lead.source,
                  location: lead.location,
                  assignedTo,
                }
              : null,
          };
        });

      // ===== FINAL RESPONSE =====
      return res.status(200).json({
        success: true,
        summary: {
          todayCount: todays.length,
          weekCount: weekly.length,
          overdueCount: overdue.length,
        },
        weekRange: {
          start: monday.toISOString().split("T")[0],
          end: sunday.toISOString().split("T")[0],
        },
        data: {
          today: formatFollowUps(todays),
          week: formatFollowUps(weekly),
          overdue: formatFollowUps(overdue),
        },
      });
    } catch (error) {
      console.error("ScheduleAnalyticsService error:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default ScheduleAnalyticsService;