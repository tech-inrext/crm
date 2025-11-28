
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
