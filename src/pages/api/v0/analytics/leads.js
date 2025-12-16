
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';
import { userAuth } from '@/middlewares/auth';

async function handler(req, res) {
	await dbConnect();
	try {
		// logged in user filter (if available)
		const loggedInUserId = req.employee?._id;
		const baseQuery = loggedInUserId ? { uploadedBy: loggedInUserId } : {};


		   // Total leads (scoped to logged-in user when available)
		   const totalLeads = await Lead.countDocuments(baseQuery);

		   // Helper: get site visit done counts by month or weekday
		   const { period = "month" } = req.query;
		   let siteVisitDoneData = [];
		   if (period === "month") {
			   // Group by month (0=Jan, 11=Dec)
			   const byMonth = await Lead.aggregate([
				   ...(loggedInUserId ? [{ $match: baseQuery }] : []),
				   { $match: { status: { $regex: /^site visit done$/i } } },
				   { $group: {
					   _id: { $month: "$createdAt" },
					   count: { $sum: 1 }
				   } }
			   ]);
			   // Map to month labels
			   const months = [
				   "Jan", "Feb", "Mar", "Apr", "May", "Jun",
				   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
			   ];
			   const monthMap = {};
			   byMonth.forEach(m => { monthMap[m._id] = m.count; });
			   siteVisitDoneData = months.map((label, idx) => ({
				   label,
				   siteVisitDone: monthMap[idx + 1] || 0
			   }));
		   } else if (period === "week") {
			   // Group by weekday (1=Sun, 7=Sat in Mongo $dayOfWeek)
			   const byWeekday = await Lead.aggregate([
				   ...(loggedInUserId ? [{ $match: baseQuery }] : []),
				   { $match: { status: { $regex: /^site visit done$/i } } },
				   { $group: {
					   _id: { $dayOfWeek: "$createdAt" },
					   count: { $sum: 1 }
				   } }
			   ]);
			   // Map to weekday labels (Mongo: 1=Sun, 7=Sat)
			   const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
			   const weekdayMap = {};
			   byWeekday.forEach(w => { weekdayMap[w._id] = w.count; });
			   siteVisitDoneData = weekdays.map((label, idx) => ({
				   label,
				   siteVisitDone: weekdayMap[idx + 1] || 0
			   }));
		   }

		   // Count of conversions where status is 'site visit done' (case-insensitive) (for backward compatibility, sum all)
		   const siteVisitConversions = siteVisitDoneData.reduce((sum, d) => sum + d.siteVisitDone, 0);

		// Define which statuses count as a conversion (case-insensitive)
		const CONVERTED_STATUSES = [
			"site visit done",
			"call back",
			"follow up",
			"details shared"
		];

		// Helper: include match stage only when baseQuery has uploadedBy
		const matchStage = loggedInUserId ? [{ $match: baseQuery }] : [];

		// Group by source (scoped)
		const bySource = await Lead.aggregate([
			...matchStage,
			{ $group: {
				_id: "$source",
				count: { $sum: 1 },
				converted: { $sum: { $cond: [ { $in: [ { $toLower: "$status" }, CONVERTED_STATUSES ] }, 1, 0 ] } },
				totalCost: { $sum: 0 } // Placeholder for cost - not implemented in Lead model yet
			} }
		]);
		// Build map and order
		const map = {};
		const sourcesOrder = [];
		const slices = [];
		bySource.forEach(s => {
			map[s._id || 'Unknown'] = s;
			sourcesOrder.push(s._id || 'Unknown');
			slices.push({ label: s._id || 'Unknown', value: s.count });
		});
		
		// Group by property name
		const byProperty = await Lead.aggregate([
			...matchStage,
			{ $group: {
				_id: "$propertyName",
				count: { $sum: 1 },
				converted: { $sum: { $cond: [ { $in: [ { $toLower: "$status" }, CONVERTED_STATUSES ] }, 1, 0 ] } }
			} }
		]);
		
		// Build property map with labels
		const propertyLabels = {
			"dholera": "Dholera",
			"migsun-rohini-center": "Migsun Rohini Center",
			"eco-village": "Eco-Village",
			"corbett-country": "Corbett Country"
		};
		
		const propertyData = byProperty.map(p => ({
			value: p._id || 'Unknown',
			count: p.count,
			label: propertyLabels[p._id] || p._id || 'Unknown',
			converted: p.converted
		}));
		
		   res.status(200).json({
			   totalLeads,
			   siteVisitConversions,
			   siteVisitDoneData, // <-- new array for chart
			   map,
			   sourcesOrder,
			   slices,
			   propertyData
		   });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
// Export with auth wrapper so req.employee is populated (falls back to global when unauthenticated)
export default (req, res) => userAuth(req, res, handler);
