<<<<<<< HEAD
// Schedule Analytics
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function getSchedule({ employee }) {
	await dbConnect();
	const loggedInUserId = employee?._id;
	const baseQuery = loggedInUserId ? { uploadedBy: loggedInUserId } : {};
	const now = new Date();
	const currentDay = now.getDay();
	const monday = new Date(now);
	monday.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
	monday.setHours(0, 0, 0, 0);
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	sunday.setHours(23, 59, 59, 999);
	const thisWeekFollowUps = await Lead.find({
		nextFollowUp: { $gte: monday, $lte: sunday },
		status: { $nin: [/^Closed$/i, /^Dropped$/i] },
		...baseQuery,
	})
		.populate("assignedTo", "firstName lastName email")
		.populate("uploadedBy", "firstName lastName")
		.sort({ nextFollowUp: 1 })
		.select(
			"leadId fullName phone status source location nextFollowUp followUpNotes assignedTo uploadedBy createdAt"
		);
	const scheduleByDate = {};
	thisWeekFollowUps.forEach((lead) => {
		const followUpDate = new Date(lead.nextFollowUp);
		const dateKey = followUpDate.toISOString().split("T")[0];
		if (!scheduleByDate[dateKey]) scheduleByDate[dateKey] = [];
		scheduleByDate[dateKey].push({
			id: lead._id,
			leadId: lead.leadId,
			fullName: lead.fullName,
			phone: lead.phone,
			status: lead.status,
			source: lead.source,
			location: lead.location,
			nextFollowUp: lead.nextFollowUp,
			followUpTime: followUpDate.toLocaleTimeString("en-US", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: true,
			}),
			assignedTo: lead.assignedTo
				? {
					name: `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
					email: lead.assignedTo.email,
				}
				: null,
			uploadedBy: lead.uploadedBy
				? {
					name: `${lead.uploadedBy.firstName} ${lead.uploadedBy.lastName}`,
				}
				: null,
			lastNote:
				lead.followUpNotes && lead.followUpNotes.length > 0
					? lead.followUpNotes[lead.followUpNotes.length - 1]
					: null,
		});
	});
	const totalScheduled = thisWeekFollowUps.length;
	const statusCounts = thisWeekFollowUps.reduce((acc, lead) => {
		acc[lead.status] = (acc[lead.status] || 0) + 1;
		return acc;
	}, {});
	const nowDate = new Date();
	const overdueFollowUps = await Lead.countDocuments({
		nextFollowUp: { $lt: nowDate, $exists: true, $ne: null },
		status: { $nin: [/^Closed$/i, /^Dropped$/i] },
		...baseQuery,
	});
	return {
		success: true,
		weekStart: monday.toISOString().split("T")[0],
		weekEnd: sunday.toISOString().split("T")[0],
		totalScheduled,
		overdueCount: overdueFollowUps,
		statusBreakdown: statusCounts,
		scheduleByDate,
		leads: thisWeekFollowUps.map((lead) => ({
			id: lead._id,
			leadId: lead.leadId,
			fullName: lead.fullName,
			phone: lead.phone,
			status: lead.status,
			source: lead.source,
			location: lead.location,
			nextFollowUp: lead.nextFollowUp,
			assignedTo: lead.assignedTo
				? {
					name: `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
					email: lead.assignedTo.email,
				}
				: null,
			uploadedBy: lead.uploadedBy
				? {
					name: `${lead.uploadedBy.firstName} ${lead.uploadedBy.lastName}`,
				}
				: null,
			lastNote:
				lead.followUpNotes && lead.followUpNotes.length > 0
					? lead.followUpNotes[lead.followUpNotes.length - 1]
					: null,
		})),
	};
}
=======
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

class ScheduleAnalyticsService {
  async getSchedule(req, res) {
    try {
      await dbConnect();

      const employee = req.employee;
      const loggedInUserId = employee?._id;
      const baseQuery = loggedInUserId
        ? { uploadedBy: loggedInUserId }
        : {};

      // Week range (Monday → Sunday)
      const now = new Date();
      const currentDay = now.getDay();

      const monday = new Date(now);
      monday.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1));
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      const leads = await Lead.find({
        nextFollowUp: { $gte: monday, $lte: sunday },
        status: { $nin: [/^Closed$/i, /^Dropped$/i] },
        ...baseQuery,
      })
        .populate("assignedTo", "firstName lastName email")
        .populate("uploadedBy", "firstName lastName")
        .sort({ nextFollowUp: 1 })
        .lean();

      // Group by date
      const scheduleByDate = {};
      leads.forEach((lead) => {
        const followUpDate = new Date(lead.nextFollowUp);
        const dateKey = followUpDate.toISOString().split("T")[0];

        if (!scheduleByDate[dateKey]) scheduleByDate[dateKey] = [];

        scheduleByDate[dateKey].push({
          id: lead._id,
          leadId: lead.leadId,
          fullName: lead.fullName,
          phone: lead.phone,
          status: lead.status,
          source: lead.source,
          location: lead.location,
          nextFollowUp: lead.nextFollowUp,
          followUpTime: followUpDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          }),
          assignedTo: lead.assignedTo
            ? {
                name: `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
                email: lead.assignedTo.email,
              }
            : null,
          uploadedBy: lead.uploadedBy
            ? {
                name: `${lead.uploadedBy.firstName} ${lead.uploadedBy.lastName}`,
              }
            : null,
          lastNote:
            lead.followUpNotes?.length > 0
              ? lead.followUpNotes[lead.followUpNotes.length - 1]
              : null,
        });
      });

      // Status counts
      const statusBreakdown = {};
      leads.forEach((lead) => {
        statusBreakdown[lead.status] =
          (statusBreakdown[lead.status] || 0) + 1;
      });

      const overdueCount = await Lead.countDocuments({
        nextFollowUp: { $lt: new Date(), $exists: true, $ne: null },
        status: { $nin: [/^Closed$/i, /^Dropped$/i] },
        ...baseQuery,
      });

      return res.status(200).json({
        success: true,
        weekStart: monday.toISOString().split("T")[0],
        weekEnd: sunday.toISOString().split("T")[0],
        totalScheduled: leads.length,
        overdueCount,
        statusBreakdown,
        scheduleByDate,
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
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
