// Lead Generation Analytics
import dbConnect from "@/lib/mongodb";
import Lead from "@/models/Lead";

const CONVERTED_STATUSES = [
	"site visit done",
	"call back",
	"follow up",
	"details shared",
];

export async function getLeadGeneration({ period, employee }) {
	await dbConnect();
	period = (period || "month").toString();
	const loggedInUserId = employee?._id;
	const baseMatch = {};
	if (loggedInUserId) baseMatch.uploadedBy = loggedInUserId;

	if (period === "week") {
		const now = new Date();
		const day = now.getDay();
		const diffToMonday = day === 0 ? 6 : day - 1;
		const monday = new Date(now);
		monday.setHours(0, 0, 0, 0);
		monday.setDate(now.getDate() - diffToMonday);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);
		sunday.setHours(23, 59, 59, 999);
		const weekMatch = { createdAt: { $gte: monday, $lte: sunday } };
		if (loggedInUserId) weekMatch.uploadedBy = loggedInUserId;
		const allWeekLeads = await Lead.find(weekMatch).lean();
		const convertedLeads = allWeekLeads.filter((lead) => {
			const statusNorm = (lead.status || "").toLowerCase().replace(/-/g, " ").trim();
			return CONVERTED_STATUSES.includes(statusNorm);
		});
		const countsByDay = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
		convertedLeads.forEach((lead) => {
			const dayOfWeek = new Date(lead.createdAt).getDay();
			countsByDay[dayOfWeek]++;
		});
		const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
		const data = [
			countsByDay[1],
			countsByDay[2],
			countsByDay[3],
			countsByDay[4],
			countsByDay[5],
			countsByDay[6],
			countsByDay[0],
		];
		return { success: true, labels, data };
	}
	// Default: month period — return last 6 months (including current month)
	const now = new Date();
	const monthsToReturn = 6;
	const startMonth = new Date(now.getFullYear(), now.getMonth() - (monthsToReturn - 1), 1);
	startMonth.setHours(0, 0, 0, 0);
	const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	endMonth.setHours(23, 59, 59, 999);
	const pipeline = [
		{
			$match: {
				...baseMatch,
				createdAt: { $gte: startMonth, $lte: endMonth },
			},
		},
		{
			$project: {
				year: { $year: "$createdAt" },
				month: { $month: "$createdAt" },
				statusNorm: {
					$trim: {
						input: {
							$toLower: {
								$replaceAll: {
									input: { $ifNull: ["$status", ""] },
									find: "-",
									replacement: " ",
								},
							},
						},
					},
				},
			},
		},
		{ $match: { statusNorm: { $in: CONVERTED_STATUSES } } },
		{
			$group: { _id: { year: "$year", month: "$month" }, count: { $sum: 1 } },
		},
		{ $sort: { "_id.year": 1, "_id.month": 1 } },
	];
	const results = await Lead.aggregate(pipeline);
	const labels = [];
	const data = [];
	const months = [];
	for (let i = monthsToReturn - 1; i >= 0; i--) {
		const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
		months.push({
			year: d.getFullYear(),
			month: d.getMonth() + 1,
			label: d.toLocaleString("en-US", { month: "short" }),
		});
	}
	const map = {};
	results.forEach((r) => {
		map[`${r._id.year}-${r._id.month}`] = r.count;
	});
	months.forEach((m) => {
		labels.push(m.label);
		data.push(map[`${m.year}-${m.month}`] || 0);
	});
	return { success: true, labels, data };
}
