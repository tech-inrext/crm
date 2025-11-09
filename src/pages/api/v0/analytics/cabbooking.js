
import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Role from '@/models/Role';
import VendorBooking from '@/models/VendorBooking';
import CabVendor from '@/models/CabVendor';
import CabBooking from '@/models/CabBooking';

// Single combined cab analytics endpoint
export default async function handler(req, res) {
	await dbConnect();
	try {
		// Parse query params (supporting same filters as vendor analytics)
		const { vendorNames, vendorEmails, month, status, avpId, avpName } = req.query;

		// Build month filter for bookings
		let bookingDateFilter = {};
		if (month && month !== 'all') {
			const [filterYear, filterMonth] = month.split('-');
			const filterMonthNum = parseInt(filterMonth);
			const filterYearNum = parseInt(filterYear);
			const startDate = new Date(filterYearNum, filterMonthNum - 1, 1);
			const endDate = new Date(filterYearNum, filterMonthNum, 0, 23, 59, 59, 999);
			bookingDateFilter = {
				createdAt: { $gte: startDate, $lte: endDate }
			};
		}

		// Status filter
		let statusFilter = {};
		if (status && status !== 'all') {
			statusFilter = { status: new RegExp(status, 'i') };
		}

		// Vendor search conditions (names / emails)
		let vendorMatchConditions = {};
		if (vendorNames || vendorEmails) {
			const conditions = [];
			if (vendorNames) {
				const names = Array.isArray(vendorNames) ? vendorNames : vendorNames.split(',');
				conditions.push({ $or: [
					{ cabOwnerName: { $in: names.map(n => new RegExp(n.trim(), 'i')) } },
					{ driverName: { $in: names.map(n => new RegExp(n.trim(), 'i')) } }
				] });
			}
			if (vendorEmails) {
				const emails = Array.isArray(vendorEmails) ? vendorEmails : vendorEmails.split(',');
				conditions.push({ email: { $in: emails.map(e => new RegExp(e.trim(), 'i')) } });
			}
			if (conditions.length > 0) vendorMatchConditions = { $or: conditions };
		}

		// Run aggregations in parallel
		const [
			totalCabBookings,
			completedCabBookings,
			pendingCabBookings,
			totalSpend,
			vendorStats,
			vendorAnalytics,
			cabVendorsFromCollection,
			vendorBookingStats,
			cabVendorNames,
			allEmployees,
			  allRoles
			] = await Promise.all([
			CabBooking.countDocuments(),
			CabBooking.countDocuments({ status: /completed/i }),
			CabBooking.countDocuments({ status: /pending/i }),
			CabBooking.aggregate([{ $group: { _id: null, total: { $sum: '$fare' } } }]).then(r => r[0]?.total || 0),
			// vendorStats (group by vendor with billing)
			CabBooking.aggregate([
				{ $group: { _id: '$vendor', count: { $sum: 1 }, billing: { $sum: '$fare' } } },
				{ $lookup: { from: 'employees', localField: '_id', foreignField: '_id', as: 'vendor' } },
				{ $unwind: { path: '$vendor', preserveNullAndEmptyArrays: true } }
			]),
			// vendor analytics (similar to existing vendor.js aggregation)
			Employee.aggregate([
				{ $match: { $and: [{ isCabVendor: true }, vendorMatchConditions || {}] } },
				{
					$lookup: {
						from: 'cabbookings',
						let: { vendorId: '$_id' },
						pipeline: [
							{ $match: { $expr: { $eq: ['$vendor', '$$vendorId'] }, ...bookingDateFilter, ...statusFilter } }
						],
						as: 'bookings'
					}
				},
				{
					$addFields: {
						totalBookings: { $size: '$bookings' },
						completedBookings: { $size: { $filter: { input: '$bookings', cond: { $regexMatch: { input: '$$this.status', regex: /completed/i } } } } },
						pendingBookings: { $size: { $filter: { input: '$bookings', cond: { $regexMatch: { input: '$$this.status', regex: /pending/i } } } } },
						totalEarnings: { $sum: '$bookings.fare' },
						avgFare: { $avg: '$bookings.fare' }
					}
				},
				{
					$project: {
						_id: 1,
						cabOwnerName: 1,
						driverName: 1,
						name: 1,
						firstName: 1,
						lastName: 1,
						email: 1,
						phone: 1,
						vehicleType: 1,
						vehicleNumber: 1,
						totalBookings: 1,
						completedBookings: 1,
						pendingBookings: 1,
						totalEarnings: { $round: ['$totalEarnings', 2] },
						avgFare: { $round: ['$avgFare', 2] },
						bookings: 1
					}
				},
				{ $sort: { totalBookings: -1, name: 1 } }
			]),
			// CabVendor documents
			CabVendor.find((vendorMatchConditions && Object.keys(vendorMatchConditions).length > 0) ? vendorMatchConditions : {}),
			// VendorBooking aggregated stats
			VendorBooking.aggregate([
				{ $match: {} },
				{ $group: {
						_id: '$ownerName',
						totalBookings: { $sum: 1 },
						completedBookings: { $sum: { $cond: [{ $regexMatch: { input: '$status', regex: /completed|done|finished/i } }, 1, 0] } },
						pendingBookings: { $sum: { $cond: [{ $regexMatch: { input: '$status', regex: /pending|waiting|scheduled/i } }, 1, 0] } },
						totalAmount: { $sum: '$amount' },
						avgAmount: { $avg: '$amount' },
						latestBooking: { $max: '$createdAt' },
						vendorInfo: { $first: '$$ROOT' }
				} },
				{ $project: {
						name: '$_id',
						totalBookings: 1,
						completedBookings: 1,
						pendingBookings: 1,
						totalAmount: { $round: ['$totalAmount', 2] },
						avgAmount: { $round: ['$avgAmount', 2] },
						latestBooking: 1,
						contactNumber: '$vendorInfo.contactNumber',
						vehicleType: '$vendorInfo.vehicleType',
						vehicleNumber: '$vendorInfo.vehicleNumber',
						location: '$vendorInfo.location',
						email: '$vendorInfo.email'
				} },
				{ $sort: { totalBookings: -1 } }
			]),
			// distinct cab vendor names
			CabVendor.distinct('cabOwnerName'),
			// fetch all employees and roles for AVP lookup
			Employee.find({}),
			Role.find({})
			]);
				// Compute AVP users from fetched employees and roles (last two Promise results)
				let avpUsers = [];
				try {
					// allEmployees and allRoles are the last two results returned by Promise.all
					// (we destructured them above as the last two variables)
					// Find roles that look like AVP (case-insensitive match)
					const avpRoles = (allRoles || []).filter(r => {
						if (!r || !r.name) return false;
						const n = String(r.name).toLowerCase();
						return n.includes('avp') || n.includes('assistant vice president');
					});

					const avpRoleIds = avpRoles.map(r => String(r._id));

					if (avpRoleIds.length > 0) {
						avpUsers = (allEmployees || []).filter(emp => {
							if (!emp) return false;
							if (Array.isArray(emp.roles) && emp.roles.length > 0) {
								return emp.roles.some(roleId => avpRoleIds.includes(String(roleId)));
							}
							return false;
						}).map(emp => ({
							id: emp._id || emp.id,
							_id: emp._id || emp.id,
							name: emp.name || [emp.firstName, emp.lastName].filter(Boolean).join(' ') || emp.email,
							email: emp.email,
							designation: emp.designation
						}));
					} else {
						// Fallback: look for employees with 'avp' in designation
						avpUsers = (allEmployees || []).filter(emp => {
							return emp && emp.designation && String(emp.designation).toLowerCase().includes('avp');
						}).map(emp => ({
							id: emp._id || emp.id,
							_id: emp._id || emp.id,
							name: emp.name || [emp.firstName, emp.lastName].filter(Boolean).join(' ') || emp.email,
							email: emp.email,
							designation: emp.designation
						}));
					}
				} catch (e) {
					console.warn('Failed to compute avpUsers init:', e.message || e);
				}

		// Helper to pick best display name
		const getBestVendorName = (vendor) => {
			if (!vendor) return 'Cab Driver';
			if (vendor.cabOwnerName && vendor.cabOwnerName.trim()) return vendor.cabOwnerName.trim();
			if (vendor.driverName && vendor.driverName.trim()) return vendor.driverName.trim();
			if (vendor.name && vendor.name.trim() && vendor.name.trim() !== 'Unknown') return vendor.name.trim();
			if (vendor.firstName && vendor.firstName.trim()) {
				const last = vendor.lastName && vendor.lastName.trim() ? ` ${vendor.lastName.trim()}` : '';
				return `${vendor.firstName.trim()}${last}`;
			}
			if (vendor.email && vendor.email.trim()) return vendor.email.split('@')[0];
			return 'Cab Driver';
		};

		// Build allVendors array similar to vendor.js
		const allVendors = [
			...vendorAnalytics.map(v => ({
				id: v._id,
				name: getBestVendorName(v),
				type: 'cab_vendor',
				totalBookings: v.totalBookings || 0,
				completedBookings: v.completedBookings || 0,
				pendingBookings: v.pendingBookings || 0,
				totalEarnings: v.totalEarnings || 0,
				avgFare: v.avgFare || 0,
				email: v.email,
				phone: v.phone,
				vehicleType: v.vehicleType,
				vehicleNumber: v.vehicleNumber,
				cabOwnerName: v.cabOwnerName,
				driverName: v.driverName
			})),
			...cabVendorsFromCollection.map(v => ({
				id: v._id,
				name: getBestVendorName(v),
				type: 'cab_vendor_collection',
				totalBookings: 0,
				completedBookings: 0,
				pendingBookings: 0,
				totalEarnings: 0,
				avgFare: 0,
				email: v.email,
				phone: v.phone || v.contactNumber,
				vehicleType: v.vehicleType,
				vehicleNumber: v.vehicleNumber,
				cabOwnerName: v.cabOwnerName,
				driverName: v.driverName,
				location: v.location
			})),
			...vendorBookingStats.map(v => ({
				id: v._id,
				name: v.name && v.name.trim() ? v.name.trim() : 'Vendor',
				type: 'general_vendor',
				totalBookings: v.totalBookings || 0,
				completedBookings: v.completedBookings || 0,
				pendingBookings: v.pendingBookings || 0,
				totalEarnings: v.totalAmount || 0,
				avgFare: v.avgAmount || 0,
				contactNumber: v.contactNumber,
				vehicleType: v.vehicleType,
				vehicleNumber: v.vehicleNumber,
				location: v.location,
				latestBooking: v.latestBooking,
				email: v.email
			}))
		];

		// Deduplicate by name
		const uniqueVendors = allVendors.filter((vendor, index, self) =>
			index === self.findIndex(v => (v.name || '').toLowerCase() === (vendor.name || '').toLowerCase())
		).sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0));

		res.status(200).json({
			success: true,
			// cab booking totals
			totalCabBookings,
			completedCabBookings,
			pendingCabBookings,
			totalSpend,
			vendorStats,
			// vendor breakdowns
			totalVendors: uniqueVendors.length,
			totalCabVendors: vendorAnalytics.length,
			totalGeneralVendors: vendorBookingStats.length,
			totalCabVendorCollection: cabVendorsFromCollection.length,
			allVendors: uniqueVendors,
			cabVendors: vendorAnalytics,
			generalVendors: vendorBookingStats,
			cabVendorCollection: cabVendorsFromCollection,
			cabVendorNames,
				avpUsers,
			searchCriteria: { vendorNames, vendorEmails }
		});
	} catch (err) {
		console.error('CabBooking analytics error:', err);
		res.status(500).json({ error: err.message });
	}
}
