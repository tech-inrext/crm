
import dbConnect from '@/lib/mongodb';
import Lead from '@/models/Lead';

export default async function handler(req, res) {
	await dbConnect();
	try {
		// Total leads
		const totalLeads = await Lead.countDocuments();
		// Group by source
		const bySource = await Lead.aggregate([
			{ $group: {
				_id: "$source",
				count: { $sum: 1 },
				converted: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
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
		res.status(200).json({
			totalLeads,
			map,
			sourcesOrder,
			slices
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
