// Overall Analytics

import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import { userAuth } from "@/middlewares/auth";

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
	const activeLeadsCount = await Lead.countDocuments({ ...leadUserQuery, status: { $in: activeLeadStatuses.map(s => new RegExp(`^${s}$`, 'i')) } });
	const newLeadsList = await Lead.find({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" } }).sort({ createdAt: -1 }).limit(10);
	const newLeadsCount = await Lead.countDocuments({ ...leadUserQuery, status: { $regex: "^new$", $options: "i" } });
	const siteVisitCount = await Lead.countDocuments({ ...leadUserQuery, status: { $regex: /site visit/i } });
	const totalLeads = await Lead.countDocuments(leadUserQuery);

	// MoU status for subordinates (manager view)
	let mouStats = { pending: 0, approved: 0 };
	if (loggedInUserId) {
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
		success: true,
	};
}

// Handler for user analytics (team/manager view)
async function handler(req, res) {
	await dbConnect();
	try {
		let managerId = req.query.managerId || req.employee?._id;
		if (!managerId) {
			return res.status(401).json({ success: false, message: "Unauthorized" });
		}
		const currentManagerId = req.employee?._id?.toString?.() || (typeof managerId === 'string' ? managerId : '');
		if (Array.isArray(managerId)) managerId = managerId[0];
		let users = [];
		let filter = {};
		if (managerId && managerId !== 'all') {
			filter.managerId = managerId;
		}
		users = await Employee.find(
			filter,
			{ _id: 1, name: 1, teamName: 1 }
		).lean();

		// For each user, fetch only their own leads (not recursive)
		const Lead = (await import("@/models/Lead")).default;
		const mongoose = (await import("mongoose")).default;
		const { getCabBooking } = await import("@/be/services/analytics/cabBooking");
		const userStats = await Promise.all(users.map(async (user) => {
			const userId = typeof user._id === 'string' ? new mongoose.Types.ObjectId(user._id) : user._id;
			// Count new leads where user is assignedTo or uploadedBy
			const newLeads = await Lead.countDocuments({
				$or: [
					{ assignedTo: userId },
					{ uploadedBy: userId }
				],
				status: { $regex: "^new$", $options: "i" }
			});
			const activeStatuses = [
				"follow-up", "follow up", "callback", "call back", "details shared", "site visit", "site visit done"
			];
			// Count unique active leads for this user (assignedTo only)
			const activeLeadsDocs = await Lead.find({
				assignedTo: userId,
				status: { $in: activeStatuses.map(s => new RegExp(`^${s}$`, 'i')) }
			}).select('_id');
			const activeLeads = new Set(activeLeadsDocs.map(l => l._id.toString())).size;
			// Site visits: status contains 'site visit' (case-insensitive), user is assignedTo or uploadedBy
			const siteVisitCount = await Lead.countDocuments({
				$or: [
					{ assignedTo: userId },
					{ uploadedBy: userId }
				],
				status: { $regex: /site visit/i }
			});

			// MoU stats for each user (only their own status)
			const mouPending = await Employee.countDocuments({ _id: userId, mouStatus: { $regex: "^Pending$", $options: "i" } });
			const mouApproved = await Employee.countDocuments({ _id: userId, mouStatus: { $regex: "^Approved$", $options: "i" } });
			const mouCompleted = await Employee.countDocuments({ _id: userId, mouStatus: { $regex: "^Completed$", $options: "i" } });

			// Fetch total vendor and total spend for this user from cab booking analytics
			const cabBookingAnalytics = await getCabBooking({ avpId: userId });
			const totalVendors = cabBookingAnalytics?.totalVendors ?? 0;
			const totalSpend = cabBookingAnalytics?.totalSpend ?? 0;

			return {
				...user,
				newLeads,
				activeLeads,
				siteVisitCount,
				mouStats: {
					pending: mouPending,
					approved: mouApproved,
					completed: mouCompleted,
				},
				totalVendors,
				totalSpend,
			};
		}));

		// Always return recursive MoU summary for the selected manager (including self and all subordinates)
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
			if (managerId && !allUserIds.has(managerId.toString())) {
				allUserIds.add(managerId.toString());
			}
		} else if (!managerId || managerId === 'all') {
			if (currentManagerId) allUserIds.add(currentManagerId);
			await collectSubordinates([currentManagerId], allUserIds);
			if (currentManagerId && !allUserIds.has(currentManagerId)) {
				allUserIds.add(currentManagerId);
			}
		}
		if (allUserIds.size > 0) {
			const mongoose = (await import("mongoose")).default;
			const userIdsArr = Array.from(allUserIds).map(id => new mongoose.Types.ObjectId(id));
			const allPending = await Employee.countDocuments({ _id: { $in: userIdsArr }, mouStatus: { $regex: "^Pending$", $options: "i" } });
			const allApproved = await Employee.countDocuments({ _id: { $in: userIdsArr }, mouStatus: { $regex: "^Approved$", $options: "i" } });
			const allCompleted = await Employee.countDocuments({ _id: { $in: userIdsArr }, mouStatus: { $regex: "^Completed$", $options: "i" } });
			summary = {
				mouPending: allPending,
				mouApproved: allApproved,
				mouCompleted: allCompleted,
			};
		}

		return res.status(200).json({ success: true, users: userStats, summary });
	} catch (err) {
		return res.status(500).json({ success: false, message: err.message });
	}
}

// Export both the analytics function and the API handler
export { getOverall };
export default (req, res) => userAuth(req, res, handler);
 