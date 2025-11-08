
import dbConnect from '@/lib/mongodb';
import CabBooking from '@/models/CabBooking';
import CabVendor from '@/models/CabVendor';

export default async function handler(req, res) {
	await dbConnect();
	try {
		// Aggregate cab booking stats
		const [
			total,
			completed,
			pending,
			spend,
			vendorStats
		] = await Promise.all([
			CabBooking.countDocuments(),
			CabBooking.countDocuments({ status: /completed/i }),
			CabBooking.countDocuments({ status: /pending/i }),
			CabBooking.aggregate([
				{ $group: { _id: null, total: { $sum: "$fare" } } }
			]).then(r => r[0]?.total || 0),
			CabBooking.aggregate([
				{ $group: { _id: "$vendor", count: { $sum: 1 }, billing: { $sum: "$fare" } } },
				{ $lookup: { from: "employees", localField: "_id", foreignField: "_id", as: "vendor" } },
				{ $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } }
			])
		]);

		res.status(200).json({
			total,
			completed,
			pending,
			spend,
			vendorStats
		});
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
}
