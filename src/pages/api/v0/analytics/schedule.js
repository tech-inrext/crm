import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export default async function handler(req, res) {
	await dbConnect();
	try {
		// Get start and end of current week (Monday to Sunday)
		const now = new Date();
		const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
		const monday = new Date(now);
		monday.setDate(now.getDate() - currentDay + (currentDay === 0 ? -6 : 1)); // Adjust for Monday start
		monday.setHours(0, 0, 0, 0);
		
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);
		sunday.setHours(23, 59, 59, 999);

		// Fetch leads with follow-ups scheduled for this week
		const thisWeekFollowUps = await Lead.find({
			nextFollowUp: {
				$gte: monday,
				$lte: sunday
			}
		})
		.populate('assignedTo', 'firstName lastName email')
		.populate('uploadedBy', 'firstName lastName')
		.sort({ nextFollowUp: 1 })
		.select('leadId fullName phone status source location nextFollowUp followUpNotes assignedTo uploadedBy createdAt');

		// Group by date for easier display
		const scheduleByDate = {};
		thisWeekFollowUps.forEach(lead => {
			const followUpDate = new Date(lead.nextFollowUp);
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
				nextFollowUp: lead.nextFollowUp,
				followUpTime: followUpDate.toLocaleTimeString('en-US', { 
					hour: '2-digit', 
					minute: '2-digit',
					hour12: true 
				}),
				assignedTo: lead.assignedTo ? {
					name: `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
					email: lead.assignedTo.email
				} : null,
				uploadedBy: lead.uploadedBy ? {
					name: `${lead.uploadedBy.firstName} ${lead.uploadedBy.lastName}`
				} : null,
				lastNote: lead.followUpNotes && lead.followUpNotes.length > 0 
					? lead.followUpNotes[lead.followUpNotes.length - 1] 
					: null
			});
		});

		// Get additional stats
		const totalScheduled = thisWeekFollowUps.length;
		const statusCounts = thisWeekFollowUps.reduce((acc, lead) => {
			acc[lead.status] = (acc[lead.status] || 0) + 1;
			return acc;
		}, {});

		// Get overdue follow-ups (past due but not completed)
		const overdueFollowUps = await Lead.find({
			nextFollowUp: { $lt: monday },
			status: { $nin: ['Closed', 'Dropped'] }
		}).countDocuments();

		res.status(200).json({
			success: true,
			weekStart: monday.toISOString().split('T')[0],
			weekEnd: sunday.toISOString().split('T')[0],
			totalScheduled,
			overdueCount: overdueFollowUps,
			statusBreakdown: statusCounts,
			scheduleByDate,
			leads: thisWeekFollowUps.map(lead => ({
				id: lead._id,
				leadId: lead.leadId,
				fullName: lead.fullName,
				phone: lead.phone,
				status: lead.status,
				source: lead.source,
				location: lead.location,
				nextFollowUp: lead.nextFollowUp,
				assignedTo: lead.assignedTo ? {
					name: `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}`,
					email: lead.assignedTo.email
				} : null,
				uploadedBy: lead.uploadedBy ? {
					name: `${lead.uploadedBy.firstName} ${lead.uploadedBy.lastName}`
				} : null,
				lastNote: lead.followUpNotes && lead.followUpNotes.length > 0 
					? lead.followUpNotes[lead.followUpNotes.length - 1] 
					: null
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