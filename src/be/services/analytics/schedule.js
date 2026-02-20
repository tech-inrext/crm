import dbConnect from "@/lib/mongodb";
import FollowUp from "../../models/FollowUp";
import Lead from "../../models/Lead";

class ScheduleAnalyticsService {
  async getSchedule(req, res) {
    try {
      await dbConnect();

      const employee = req.employee;
      const loggedInUserId = employee?._id;
      const baseQuery = loggedInUserId
        ? { submittedBy: loggedInUserId }
        : {};
      const now = new Date();
      // TODAY RANGE
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);
      // WEEK RANGE (Monday - Sunday)
      const day = now.getDay();
      const diffToMonday = (day === 0 ? -6 : 1) - day;
      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      // COMMON FILTER
      const commonFilter = {
        followUpDate: { $exists: true, $ne: null },
        ...baseQuery,
      };
      // TODAY FOLLOWUPS
      const todays = await FollowUp.find({
        ...commonFilter,
        followUpDate: { $gte: startOfToday, $lte: endOfToday },
      })
        .populate({
          path: "leadId",
          model: Lead,
          select: "leadId fullName phone status source location assignedTo",
          populate: {
            path: "assignedTo",
            select: "firstName lastName email",
          },
        })
        .lean();
      // WEEK FOLLOWUPS
      const weekly = await FollowUp.find({
        ...commonFilter,
        followUpDate: { $gte: monday, $lte: sunday },
      })
        .populate({
          path: "leadId",
          model: Lead,
          select: "leadId fullName phone status source location assignedTo",
          populate: {
            path: "assignedTo",
            select: "firstName lastName email",
          },
        })
        .lean();
      // OVERDUE FOLLOWUPS
      const overdue = await FollowUp.find({
        ...commonFilter,
        followUpDate: { $lt: startOfToday },
      })
        .populate({
          path: "leadId",
          model: Lead,
          select: "leadId fullName phone status source location assignedTo",
          populate: {
            path: "assignedTo",
            select: "firstName lastName email",
          },
        })
        .lean();
      // FORMAT FUNCTION
      const format = (items) =>
        items.map((doc) => ({
          id: doc._id,
          followUpDate: doc.followUpDate,
          followUpTime: new Date(doc.followUpDate).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            }
          ),
          note: doc.note,
          followUpType: doc.followUpType,

          lead: doc.leadId
            ? {
                id: doc.leadId._id,
                leadId: doc.leadId.leadId,
                fullName: doc.leadId.fullName,
                phone: doc.leadId.phone,
                status: doc.leadId.status,
                source: doc.leadId.source,
                location: doc.leadId.location,
                assignedTo: doc.leadId.assignedTo
                  ? {
                      name: `${doc.leadId.assignedTo.firstName} ${doc.leadId.assignedTo.lastName}`,
                      email: doc.leadId.assignedTo.email,
                    }
                  : null,
              }
            : null,
        }));
      // FINAL RESPONSE
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
          today: format(todays),
          week: format(weekly),
          overdue: format(overdue),
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
