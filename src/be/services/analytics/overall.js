// Overall Analytics
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

export async function getOverall({ userId, employee }) {
	await dbConnect();
	const loggedInUserId = employee?._id;
	userId = userId || loggedInUserId;
	const leadUserQuery = { $or: [{ assignedTo: userId }, { uploadedBy: userId }] };
	const employeeUserQuery = { _id: userId };
	const activeLeadStatuses = [
		"followup",
		"follow up",
		"callback",
		"call back",
		"details shared",
		"site visit",
		"site visit done",
	];
	function getDayRange(offset = 0) {
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const start = new Date(now);
		start.setDate(now.getDate() - offset);
		const end = new Date(start);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}
	const { start: todayStart, end: todayEnd } = getDayRange(0);
	const { start: yestStart, end: yestEnd } = getDayRange(1);
	const { start: beforeYestStart, end: beforeYestEnd } = getDayRange(2);
	const activeLeadsCount = await Lead.countDocuments({ ...leadUserQuery, status: { $in: activeLeadStatuses.map(s => new RegExp(`^${s}$`, 'i')) } });
	const newLeadsList = await Lead.find({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" } }).sort({ createdAt: -1 }).limit(10);
	const newLeadsCount = await Lead.countDocuments({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" } });
	const siteVisitCount = await Lead.countDocuments({ ...leadUserQuery, status: { $regex: /site visit/i } });
	const totalLeads = await Lead.countDocuments(leadUserQuery);

	// MoU status for subordinates (manager view)
	let mouStats = { pending: 0, approved: 0 };
	if (loggedInUserId) {
		// Lazy import to avoid circular deps if any
		const Employee = (await import("@/models/Employee")).default;
		mouStats.pending = await Employee.countDocuments({ managerId: loggedInUserId.toString(), mouStatus: { $regex: "^Pending$", $options: "i" } });
		mouStats.approved = await Employee.countDocuments({ managerId: loggedInUserId.toString(), mouStatus: { $regex: "^Approved$", $options: "i" } });
	}

	return {
		loggedInUserId,
		totalLeads,
		activeLeads: activeLeadsCount,
		newLeads: newLeadsCount,
		newLeadSection: newLeadsList.map((lead) => ({ _id: lead._id, name: lead.name, status: lead.status, createdAt: lead.createdAt })),
		siteVisitCount,
		mouStats, // { pending, approved }
		// Add more trend and stats as needed
		success: true,
	};
}
