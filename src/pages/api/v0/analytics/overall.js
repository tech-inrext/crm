import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import CabVendor from '@/models/CabVendor';
import CabBooking from '@/models/CabBooking';
import VendorBooking from '@/models/VendorBooking';
import Role from '@/models/Role';

export default async function handler(req, res) {
	try {
		await dbConnect();
		
		// Get logged-in user ID (fallback to null if not authenticated)
		const loggedInUserId = req.user?.id || req.user?._id;
		
		// Optimized aggregations - run in parallel for better performance
		const [
			employeeResults,
			leadResults,
			mouResults,
			vendorResults,
			cabBookingTotal,
			totalRoles,
			cabVendorNames
		] = await Promise.all([
			// Single aggregation for all Employee data
			Employee.aggregate([
				{
					$facet: {
						totalUsers: [{ $count: "count" }],
						cabVendors: [
							{ $match: { isCabVendor: true } },
							{ $project: { password: 0, __v: 0 } }
						],
						cabVendorCount: [
							{ $match: { isCabVendor: true } },
							{ $count: "count" }
						],
						// Get team members if authenticated
						...(loggedInUserId ? {
							teamMembers: [
								{
									$match: {
										$or: [
											{ _id: loggedInUserId },
											{ managerId: loggedInUserId }
										]
									}
								},
								{
									$project: {
										_id: 1, name: 1, designation: 1,
										branch: 1, managerId: 1, employeeProfileId: 1,
										email: 1, phone: 1
									}
								}
							]
						} : {})
					}
				}
			]),
			
			// Lead data aggregation
			Lead.aggregate([
				{
					$facet: {
						newLeads: [
							{ $match: { createdAt: { $gte: new Date(Date.now() - 7*24*60*60*1000) } } },
							{ $count: "count" }
						],
						siteVisitCount: [
							{ $match: { status: /site visit/i } },
							{ $count: "count" }
						]
					}
				}
			]),
			
			// MoU data aggregation - fix to get real MOU data
			Employee.aggregate([
				{
					$facet: {
						allMou: [
							{
								$match: { 
									$or: [
										{ mouStatus: { $exists: true, $ne: null } },
										{ mouPdfUrl: { $exists: true, $ne: null } }
									]
								}
							},
							{
								$project: {
									_id: 1,
									name: 1,
									email: 1,
									employeeProfileId: 1,
									mouStatus: 1,
									mouPdfUrl: 1,
									designation: 1,
									branch: 1,
									createdAt: 1,
									updatedAt: 1
								}
							}
						],
						mouStats: [
							{
								$match: { 
									mouStatus: { $exists: true, $ne: null, $ne: "" }
								}
							},
							{ 
								$group: { 
									_id: "$mouStatus", 
									count: { $sum: 1 } 
								} 
							}
						],
						totalMou: [
							{
								$match: { 
									$or: [
										{ mouStatus: { $exists: true, $ne: null, $ne: "" } },
										{ mouPdfUrl: { $exists: true, $ne: null, $ne: "" } }
									]
								}
							},
							{ $count: "count" }
						]
					}
				}
			]),
			
			// Optimized vendor booking aggregation
			VendorBooking.aggregate([
				{
					$group: {
						_id: "$ownerName",
						doc: { $first: "$$ROOT" }
					}
				},
				{
					$facet: {
						vendorNames: [
							{ $group: { _id: null, names: { $push: "$_id" } } }
						],
						vendorDetails: [
							{ $replaceRoot: { newRoot: "$doc" } }
						]
					}
				}
			]),
			
			// Cab booking total
			CabBooking.aggregate([
				{ $group: { _id: null, total: { $sum: "$fare" } } }
			]).then(r => r[0]?.total || 0),
			
			// Simple counts
			Role.countDocuments(),
			CabVendor.distinct('cabOwnerName')
		]);

		// Process results efficiently
		const totalUsers = employeeResults[0]?.totalUsers[0]?.count || 0;
		const totalCabVendors = employeeResults[0]?.cabVendorCount[0]?.count || 0;
		const cabVendorList = employeeResults[0]?.cabVendors || [];
		
		const newLeads = leadResults[0]?.newLeads[0]?.count || 0;
		const siteVisitCount = leadResults[0]?.siteVisitCount[0]?.count || 0;
		
		const mouList = mouResults[0]?.allMou || [];
		const mouStats = mouResults[0]?.mouStats || [];
		const totalMou = mouResults[0]?.totalMou[0]?.count || 0;
		const pendingMouTotal = mouStats.find(s => s._id === 'Pending')?.count || 0;
		const approvedMouTotal = mouStats.find(s => s._id === 'Approved')?.count || 0;
		
		const vendorNames = vendorResults[0]?.vendorNames[0]?.names || [];
		const totalVendors = vendorNames.length;
		const vendorDetails = vendorResults[0]?.vendorDetails || [];
		
		// Process team data
		const teamMembers = employeeResults[0]?.teamMembers || [];
		const connectedTeamData = {
			count: teamMembers.length || 3, // Default to 3 if no data
			members: teamMembers
		};

		res.status(200).json({
			totalUsers,
			newLeads,
			siteVisitCount,
			totalVendors,
			totalCabVendors,
			vendorDetails,
			cabVendorNames,
			cabVendorList,
			mouList,
			totalMou,
			totalBilling: cabBookingTotal,
			pendingMouTotal,
			approvedMouTotal,
			totalRoles,
			totalTeams: connectedTeamData.count,
			connectedTeamMembers: connectedTeamData.members,
			loggedInUserId,
			success: true
		});
	} catch (err) {
		console.error('Analytics API error:', err);
		res.status(500).json({ error: err.message, success: false });
	}
}
