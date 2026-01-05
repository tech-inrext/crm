import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import FollowUp from '@/models/FollowUp';
import mongoose from 'mongoose';
import { userAuth } from '@/middlewares/auth';

async function handler(req, res) {
	await dbConnect();
	try {
		// logged-in user id for scoping schedule and overdue
		const loggedInUserId = req.employee?._id;
		// base filter for scoping queries to the logged-in user (if present)
		const baseQuery = loggedInUserId ? { uploadedBy: new mongoose.Types.ObjectId(loggedInUserId) } : {};
		
		// Get start and end of current week (Monday to Sunday)
		const now = new Date();
		const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		const monday = new Date(now);
		monday.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust for Monday start
		monday.setHours(0, 0, 0, 0);
		
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);
		sunday.setHours(23, 59, 59, 999);

		// Implementation Note: Since nextFollowUp and followUpNotes are moved to FollowUp collection,
		// we use an aggregation pipeline to join and filter.
		const pipeline = [
			{ $match: { ...baseQuery, status: { $nin: [/^Closed$/i, /^Dropped$/i] } } },
			{
				$lookup: {
					from: 'followups',
					localField: '_id',
					foreignField: 'leadId',
					as: 'followUpData'
				}
			},
			{ $unwind: { path: '$followUpData', preserveNullAndEmptyArrays: true } },
			{
				$addFields: {
					// Extract the latest follow-up date from the array
					latestFollowUp: { $arrayElemAt: ['$followUpData.followUps', -1] }
				}
			},
			{
				$match: {
					'latestFollowUp.followUpDate': {
						$gte: monday,
						$lte: sunday
					}
				}
			},
			{
				$lookup: {
					from: 'employees',
					localField: 'assignedTo',
					foreignField: '_id',
					as: 'assignedTo'
				}
			},
			{ $unwind: { path: '$assignedTo', preserveNullAndEmptyArrays: true } },
			{
				$lookup: {
					from: 'employees',
					localField: 'uploadedBy',
					foreignField: '_id',
					as: 'uploadedBy'
				}
			},
			{ $unwind: { path: '$uploadedBy', preserveNullAndEmptyArrays: true } },
			{ $sort: { 'latestFollowUp.followUpDate': 1 } }
		];

		const thisWeekLeads = await Lead.aggregate(pipeline);

		// Group by date for easier display
		const scheduleByDate = {};
		thisWeekLeads.forEach(lead => {
			const followUpDate = new Date(lead.latestFollowUp.followUpDate);
			const dateKey = followUpDate.toISOString().split('T')[0]; // YYYY-MM-DD
			
			if (!scheduleByDate[dateKey]) {
				scheduleByDate[dateKey] = [];
			}
			
			scheduleByDate[dateKey].push({
				id: lead._id,
				leadId: lead.leadId,
				fullName: lead.fullName,
				phone: lead.phone,
				status: lead.status,
				source: lead.source,
				location: lead.location,
				nextFollowUp: lead.latestFollowUp.followUpDate,
				followUpTime: followUpDate.toLocaleTimeString('en-US', { 
					hour: '2-digit', 
					minute: '2-digit',
					hour12: true 
				}),
				assignedTo: lead.assignedTo ? {
					name: lead.assignedTo.name,
					email: lead.assignedTo.email
				} : null,
				uploadedBy: lead.uploadedBy ? {
					name: lead.uploadedBy.name
				} : null,
				lastNote: lead.latestFollowUp.note || null
			});
		});

		// Get total scheduled
		const totalScheduled = thisWeekLeads.length;
		const statusCounts = thisWeekLeads.reduce((acc, lead) => {
			acc[lead.status] = (acc[lead.status] || 0) + 1;
			return acc;
		}, {});

		// Overdue follow-ups count
		const overduePipeline = [
			{ $match: { ...baseQuery, status: { $nin: [/^Closed$/i, /^Dropped$/i] } } },
			{
				$lookup: {
					from: 'followups',
					localField: '_id',
					foreignField: 'leadId',
					as: 'followUpData'
				}
			},
			{ $unwind: '$followUpData' },
			{
				$addFields: {
					latestFollowUp: { $arrayElemAt: ['$followUpData.followUps', -1] }
				}
			},
			{
				$match: {
					'latestFollowUp.followUpDate': { $lt: now }
				}
			},
			{ $count: 'count' }
		];
		const overdueResult = await Lead.aggregate(overduePipeline);
		const overdueCount = overdueResult.length > 0 ? overdueResult[0].count : 0;

		res.status(200).json({
			success: true,
			weekStart: monday.toISOString().split('T')[0],
			weekEnd: sunday.toISOString().split('T')[0],
			totalScheduled,
			overdueCount,
			statusBreakdown: statusCounts,
			scheduleByDate,
			leads: thisWeekLeads.map(lead => ({
				id: lead._id,
				leadId: lead.leadId,
				fullName: lead.fullName,
				phone: lead.phone,
				status: lead.status,
				source: lead.source,
				location: lead.location,
				nextFollowUp: lead.latestFollowUp.followUpDate,
				assignedTo: lead.assignedTo ? {
					name: lead.assignedTo.name,
					email: lead.assignedTo.email
				} : null,
				uploadedBy: lead.uploadedBy ? {
					name: lead.uploadedBy.name
				} : null,
				lastNote: lead.latestFollowUp.note || null
			}))
		});
	} catch (err) {
		console.error('Schedule API error:', err);
		res.status(500).json({ 
			success: false, 
			error: err.message 
		});
	}
}

// Export with auth wrapper so req.employee is populated (scopes to logged-in user)
export default (req, res) => userAuth(req, res, handler);