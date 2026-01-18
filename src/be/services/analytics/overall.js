import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";

// Analytics for overall stats (for dashboard)
async function getOverall({ userId, employee }) {
	await dbConnect();
	const Lead = (await import("@/models/Lead")).default;
	const loggedInUserId = employee?._id;
	userId = userId || loggedInUserId;

	const leadUserQuery = { $or: [{ assignedTo: userId }, { uploadedBy: userId }] };

	const activeLeadStatuses = [
		"followup",
		"follow up",
		"callback",
		"call back",
		"details shared",
		"site visit",
		"site visit done",
	];

	const activeLeadsCount = await Lead.countDocuments({
		...leadUserQuery,
		status: { $in: activeLeadStatuses.map(s => new RegExp(`^${s}$`, "i")) },
	});

	const newLeadsList = await Lead.find({
		...leadUserQuery,
		status: { $regex: "^new$", $options: "i" },
	})
		.sort({ createdAt: -1 })
		.limit(10);

	const newLeadsCount = await Lead.countDocuments({
		...leadUserQuery,
		status: { $regex: "^new$", $options: "i" },
	});

	const siteVisitCount = await Lead.countDocuments({
		...leadUserQuery,
		status: { $regex: /site visit/i },
	});

	const totalLeads = await Lead.countDocuments(leadUserQuery);

	// MoU status for subordinates (manager view)
	let mouStats = { pending: 0, approved: 0 };
	if (loggedInUserId) {
		mouStats.pending = await Employee.countDocuments({
			managerId: loggedInUserId.toString(),
			mouStatus: { $regex: "^Pending$", $options: "i" },
		});
		mouStats.approved = await Employee.countDocuments({
			managerId: loggedInUserId.toString(),
			mouStatus: { $regex: "^Approved$", $options: "i" },
		});
	}

	return {
		loggedInUserId,
		totalLeads,
		activeLeads: activeLeadsCount,
		newLeads: newLeadsCount,
		newLeadSection: newLeadsList.map((lead) => ({
			_id: lead._id,
			name: lead.name,
			status: lead.status,
			createdAt: lead.createdAt,
		})),
		siteVisitCount,
		mouStats, // { pending, approved }
		success: true,
	};
}

// Handler for team/manager analytics
async function handler(req, res) {
	await dbConnect();
	try {
		let managerId = req.query.managerId || req.employee?._id;
		if (!managerId) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}

		const currentManagerId = req.employee?._id?.toString?.() || (typeof managerId === "string" ? managerId : '');
		if (Array.isArray(managerId)) managerId = managerId[0];

		let filter = {};
		if (managerId && managerId !== "all") {
			filter.managerId = managerId;
		}

		const users = await Employee.find(filter, { _id: 1, name: 1, teamName: 1 }).lean();
		const userIds = users.map(u => u._id);

		const mongoose = (await import("mongoose")).default;
		const Lead = (await import("@/models/Lead")).default;
		const { getCabBooking } = await import("@/be/services/analytics/cabBooking");

		// Batch: new leads per user
		const newLeadsAgg = await Lead.aggregate([
			{ $match: { $or: [{ assignedTo: { $in: userIds } }, { uploadedBy: { $in: userIds } }], status: { $regex: "^new$", $options: "i" } } },
			{ $group: { _id: "$assignedTo", count: { $sum: 1 } } }
		]);
		const newLeadsMap = Object.fromEntries(newLeadsAgg.map(x => [x._id?.toString?.(), x.count]));

		// Batch: active leads per user (assignedTo only)
		const activeStatuses = ["follow-up", "follow up", "callback", "call back", "details shared", "site visit", "site visit done"];
		const activeLeadsAgg = await Lead.aggregate([
			{ $match: { assignedTo: { $in: userIds }, status: { $in: activeStatuses.map(s => new RegExp(`^${s}$`, "i")) } } },
			{ $group: { _id: "$assignedTo", count: { $sum: 1 } } }
		]);
		const activeLeadsMap = Object.fromEntries(activeLeadsAgg.map(x => [x._id?.toString?.(), x.count]));

		// Batch: site visit count per user
		const siteVisitAgg = await Lead.aggregate([
			{ $match: { $or: [{ assignedTo: { $in: userIds } }, { uploadedBy: { $in: userIds } }], status: { $regex: /site visit/i } } },
			{ $group: { _id: "$assignedTo", count: { $sum: 1 } } }
		]);
		const siteVisitMap = Object.fromEntries(siteVisitAgg.map(x => [x._id?.toString?.(), x.count]));

		// Batch: MoU stats per user
		const mouAgg = await Employee.aggregate([
			{ $match: { _id: { $in: userIds } } },
			{ $group: {
				_id: "$_id",
				pending: { $sum: { $cond: [{ $regexMatch: { input: "$mouStatus", regex: /^Pending$/i } }, 1, 0] } },
				approved: { $sum: { $cond: [{ $regexMatch: { input: "$mouStatus", regex: /^Approved$/i } }, 1, 0] } },
				completed: { $sum: { $cond: [{ $regexMatch: { input: "$mouStatus", regex: /^Completed$/i } }, 1, 0] } }
			} }
		]);
		const mouMap = Object.fromEntries(mouAgg.map(x => [x._id?.toString?.(), { pending: x.pending, approved: x.approved, completed: x.completed }]));

		// Cab booking analytics
		const cabBookingResults = await Promise.all(userIds.map(userId => getCabBooking({ avpId: userId })));

		// Merge stats
		const userStats = users.map((user, idx) => {
			const userIdStr = user._id?.toString?.();
			return {
				...user,
				newLeads: newLeadsMap[userIdStr] || 0,
				activeLeads: activeLeadsMap[userIdStr] || 0,
				siteVisitCount: siteVisitMap[userIdStr] || 0,
				mouStats: mouMap[userIdStr] || { pending: 0, approved: 0, completed: 0 },
				totalVendors: cabBookingResults[idx]?.totalVendors ?? 0,
				totalSpend: cabBookingResults[idx]?.totalSpend ?? 0,
			};
		});

		// Recursive MoU summary
		let summary = undefined;
		const collectSubordinates = async (managerIds, allUserIds) => {
			const subs = await Employee.find({ managerId: { $in: managerIds } }, { _id: 1 }).lean();
			for (const sub of subs) {
				if (!allUserIds.has(sub._id.toString())) {
					allUserIds.add(sub._id.toString());
					await collectSubordinates([sub._id], allUserIds);
				}
			}
		};

		const allUserIds = new Set();
		if (managerId && managerId !== 'all') {
			if (managerId) allUserIds.add(managerId.toString());
			await collectSubordinates([managerId], allUserIds);
			if (managerId && !allUserIds.has(managerId.toString())) allUserIds.add(managerId.toString());
		} else if (!managerId || managerId === 'all') {
			if (currentManagerId) allUserIds.add(currentManagerId);
			await collectSubordinates([currentManagerId], allUserIds);
			if (currentManagerId && !allUserIds.has(currentManagerId)) allUserIds.add(currentManagerId);
		}

		if (allUserIds.size > 0) {
			const userIdsArr = Array.from(allUserIds).map(id => new mongoose.Types.ObjectId(id));
			const allMouAgg = await Employee.aggregate([
				{ $match: { _id: { $in: userIdsArr } } },
				{ $group: {
					_id: null,
					mouPending: { $sum: { $cond: [{ $regexMatch: { input: "$mouStatus", regex: /^Pending$/i } }, 1, 0] } },
					mouApproved: { $sum: { $cond: [{ $regexMatch: { input: "$mouStatus", regex: /^Approved$/i } }, 1, 0] } },
					mouCompleted: { $sum: { $cond: [{ $regexMatch: { input: "$mouStatus", regex: /^Completed$/i } }, 1, 0] } }
				} }
			]);
			if (allMouAgg.length > 0) {
				summary = {
					mouPending: allMouAgg[0].mouPending,
					mouApproved: allMouAgg[0].mouApproved,
					mouCompleted: allMouAgg[0].mouCompleted,
				};
			}
		}

		return res.status(200).json({ success: true, users: userStats, summary });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
}

// Export both functions
export { getOverall };
export default (req, res) => userAuth(req, res, handler);
