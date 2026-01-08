// Vendor Analytics
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import CabVendor from "@/models/CabVendor";
import VendorBooking from "@/models/VendorBooking";

export async function getVendor({ vendorNames, vendorEmails }) {
	await dbConnect();
	function getDayRange(offset = 0) {
		const now = new Date();
		now.setHours(0, 0, 0, 0);
		const start = new Date(now);
		start.setDate(now.getDate() - offset);
		const end = new Date(start);
		end.setHours(23, 59, 59, 999);
		return { start, end };
	}
	const { start: todayStart, end: todayEnd } = getDayRange(0);
	const { start: yestStart, end: yestEnd } = getDayRange(1);
	const { start: beforeYestStart, end: beforeYestEnd } = getDayRange(2);
	let vendorMatchConditions = {};
	if (vendorNames || vendorEmails) {
		const conditions = [];
		if (vendorNames) {
			const names = Array.isArray(vendorNames) ? vendorNames : vendorNames.split(",");
			conditions.push({
				$or: [
					{ cabOwnerName: { $in: names.map((name) => new RegExp(name.trim(), "i")) } },
					{ driverName: { $in: names.map((name) => new RegExp(name.trim(), "i")) } },
				],
			});
		}
		if (vendorEmails) {
			const emails = Array.isArray(vendorEmails) ? vendorEmails : vendorEmails.split(",");
			conditions.push({ email: { $in: emails.map((email) => new RegExp(email.trim(), "i")) } });
		}
		if (conditions.length > 0) vendorMatchConditions = { $or: conditions };
	}
	const cabVendorMatch = vendorMatchConditions.cabOwnerName || vendorMatchConditions.driverName || vendorMatchConditions.email ? { $and: [{ isCabVendor: true }, vendorMatchConditions] } : { isCabVendor: true };
	const [
		todayVendors,
		yesterdayVendors,
		beforeYesterdayVendors,
		vendorAnalytics,
		cabVendorsFromCollection,
		vendorBookingStats,
		cabVendorNames,
	] = await Promise.all([
		Employee.countDocuments({ isCabVendor: true, createdAt: { $gte: todayStart, $lte: todayEnd } }),
		Employee.countDocuments({ isCabVendor: true, createdAt: { $gte: yestStart, $lte: yestEnd } }),
		Employee.countDocuments({ isCabVendor: true, createdAt: { $gte: beforeYestStart, $lte: beforeYestEnd } }),
		Employee.aggregate([
			{ $match: cabVendorMatch },
			{ $lookup: { from: "cabbookings", localField: "_id", foreignField: "vendor", as: "bookings" } },
			{ $addFields: {
				totalBookings: { $size: "$bookings" },
				completedBookings: { $size: { $filter: { input: "$bookings", cond: { $regexMatch: { input: "$$this.status", regex: /completed/i } } } } },
				pendingBookings: { $size: { $filter: { input: "$bookings", cond: { $regexMatch: { input: "$$this.status", regex: /pending/i } } } } },
				totalEarnings: { $sum: "$bookings.fare" },
				avgFare: { $avg: "$bookings.fare" },
			} },
			{ $project: {
				_id: 1, name: {
					$cond: {
						if: { $and: [ { $ne: ["$cabOwnerName", null] }, { $ne: ["$cabOwnerName", ""] } ] },
						then: "$cabOwnerName",
						else: {
							$cond: {
								if: { $and: [ { $ne: ["$driverName", null] }, { $ne: ["$driverName", ""] } ] },
								then: "$driverName",
								else: {
									$cond: {
										if: { $and: [ { $ne: ["$name", null] }, { $ne: ["$name", ""] } ] },
										then: "$name",
										else: {
											$cond: {
												if: { $and: [ { $ne: ["$firstName", null] }, { $ne: ["$firstName", ""] } ] },
												then: { $concat: ["$firstName", " ", { $ifNull: ["$lastName", ""] }] },
												else: {
													$cond: {
														if: { $and: [ { $ne: ["$email", null] }, { $ne: ["$email", ""] } ] },
														then: { $arrayElemAt: [{ $split: ["$email", "@"] }, 0] },
														else: "Driver",
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
				cabOwnerName: 1, driverName: 1, name: 1, firstName: 1, lastName: 1, email: 1, phone: 1, vehicleType: 1, vehicleNumber: 1, totalBookings: 1, completedBookings: 1, pendingBookings: 1, totalEarnings: { $round: ["$totalEarnings", 2] }, avgFare: { $round: ["$avgFare", 2] }, bookings: 1,
			} },
			{ $sort: { totalBookings: -1, name: 1 } },
		]),
		(() => {
			const cabVendorSearchConditions = {};
			if (vendorNames || vendorEmails) {
				const conditions = [];
				if (vendorNames) {
					const names = Array.isArray(vendorNames) ? vendorNames : vendorNames.split(",");
					conditions.push({ cabOwnerName: { $in: names.map((name) => new RegExp(name.trim(), "i")) } });
					conditions.push({ driverName: { $in: names.map((name) => new RegExp(name.trim(), "i")) } });
				}
				if (vendorEmails) {
					const emails = Array.isArray(vendorEmails) ? vendorEmails : vendorEmails.split(",");
					conditions.push({ email: { $in: emails.map((email) => new RegExp(email.trim(), "i")) } });
				}
				if (conditions.length > 0) cabVendorSearchConditions.$or = conditions;
			}
			return CabVendor.find(cabVendorSearchConditions);
		})(),
		(() => {
			const vendorBookingMatch = vendorMatchConditions.ownerName ? { ownerName: vendorMatchConditions.ownerName } : {};
			return VendorBooking.aggregate([
				{ $match: vendorBookingMatch },
				{ $group: {
					_id: "$ownerName",
					totalBookings: { $sum: 1 },
					completedBookings: { $sum: { $cond: [ { $regexMatch: { input: "$status", regex: /completed|done|finished/i } }, 1, 0 ] } },
					pendingBookings: { $sum: { $cond: [ { $regexMatch: { input: "$status", regex: /pending|waiting|scheduled/i } }, 1, 0 ] } },
					totalAmount: { $sum: "$amount" },
					avgAmount: { $avg: "$amount" },
					latestBooking: { $max: "$createdAt" },
					vendorInfo: { $first: "$$ROOT" },
				} },
				{ $project: {
					name: "$_id", totalBookings: 1, completedBookings: 1, pendingBookings: 1, totalAmount: { $round: ["$totalAmount", 2] }, avgAmount: { $round: ["$avgAmount", 2] }, latestBooking: 1, contactNumber: "$vendorInfo.contactNumber", vehicleType: "$vendorInfo.vehicleType", vehicleNumber: "$vendorInfo.vehicleNumber", location: "$vendorInfo.location", email: "$vendorInfo.email",
				} },
				{ $sort: { totalBookings: -1 } },
			]);
		})(),
		CabVendor.distinct("cabOwnerName"),
	]);
	const getBestVendorName = (vendor) => {
		if (vendor.cabOwnerName && vendor.cabOwnerName.trim()) return vendor.cabOwnerName.trim();
		if (vendor.driverName && vendor.driverName.trim()) return vendor.driverName.trim();
		if (vendor.name && vendor.name.trim() && vendor.name.trim() !== "Unknown") return vendor.name.trim();
		if (vendor.firstName && vendor.firstName.trim()) {
			const lastName = vendor.lastName && vendor.lastName.trim() ? ` ${vendor.lastName.trim()}` : "";
			return `${vendor.firstName.trim()}${lastName}`;
		}
		if (vendor.email && vendor.email.trim()) return vendor.email.split("@")[0];
		return "Cab Driver";
	};
	const allVendors = [
		...vendorAnalytics.map((v) => ({
			id: v._id,
			name: getBestVendorName(v),
			type: "cab_vendor",
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
			driverName: v.driverName,
		})),
		...cabVendorsFromCollection.map((v) => ({
			id: v._id,
			name: getBestVendorName(v),
			type: "cab_vendor_collection",
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
			location: v.location,
		})),
		...vendorBookingStats.map((v) => ({
			id: v._id,
			name: v.name && v.name.trim() ? v.name.trim() : "Vendor",
			type: "general_vendor",
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
			email: v.email,
		})),
	];
	const uniqueVendors = allVendors.filter((vendor, index, self) => index === self.findIndex((v) => v.name.toLowerCase() === vendor.name.toLowerCase())).sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0));
	return {
		success: true,
		totalVendors: uniqueVendors.length,
		totalCabVendors: vendorAnalytics.length,
		totalGeneralVendors: vendorBookingStats.length,
		totalCabVendorCollection: cabVendorsFromCollection.length,
		allVendors: uniqueVendors,
		cabVendors: vendorAnalytics,
		generalVendors: vendorBookingStats,
		cabVendorCollection: cabVendorsFromCollection,
		cabVendorNames,
		searchCriteria: { vendorNames, vendorEmails },
		trend: {
			totalVendors: {
				today: todayVendors,
				yesterday: yesterdayVendors,
				beforeYesterday: beforeYesterdayVendors,
			},
		},
	};
}
