import dbConnect from '@/lib/mongodb';
import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import CabVendor from '@/models/CabVendor';
import CabBooking from '@/models/CabBooking';
import VendorBooking from '@/models/VendorBooking';
import Role from '@/models/Role';
import { userAuth } from '@/middlewares/auth';

async function handler(req, res) {
	try {
		await dbConnect();
		
		// Get logged-in user ID from auth middleware
		const loggedInUserId = req.employee?._id;
		
		// Get all leads data from LeadService approach
		const baseQuery = { uploadedBy: loggedInUserId };
		
		// Count total leads for logged-in user (same as LeadService.getAllLeads)
		const totalLeads = await Lead.countDocuments(baseQuery);
		
		// Fetch leads with status "New" from totalLeads - show count and details
		const newLeadsList = await Lead.find({
			...baseQuery,
			status: { $regex: "^new$", $options: "i" }
		}).sort({ createdAt: -1 }).limit(10);
		
		// Count new leads (leads with status "New" from totalLeads)
		const newLeadsCount = await Lead.countDocuments({
			...baseQuery,
			status: { $regex: "^new$", $options: "i" }
		});
		
		// Count upcoming site visits (status contains "site visit")
		const siteVisitCount = await Lead.countDocuments({
			...baseQuery,
			status: { $regex: "site visit", $options: "i" }
		});
		
		// Optimized aggregations - run in parallel for better performance
		const [
			employeeResults,
			mouResults
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
			
			// MoU data aggregation - filter by logged-in user
			// Employee.aggregate([
			// 	{
			// 		$match: { _id: loggedInUserId }
			// 	},
			// 	{
			// 		$facet: {
			// 			allMou: [
			// 				{
			// 					$match: { 
			// 						$or: [
			// 							{ mouStatus: { $exists: true, $ne: null } },
			// 							{ mouPdfUrl: { $exists: true, $ne: null } }
			// 						]
			// 					}
			// 				},
			// 				{
			// 					$project: {
			// 						_id: 1,
			// 						name: 1,
			// 						email: 1,
			// 						employeeProfileId: 1,
			// 						mouStatus: 1,
			// 						mouPdfUrl: 1,
			// 						designation: 1,
			// 						branch: 1,
			// 						createdAt: 1,
			// 						updatedAt: 1
			// 					}
			// 				}
			// 			],
			// 			mouStats: [
			// 				{
			// 					$match: { 
			// 						mouStatus: { $exists: true, $ne: null, $ne: "" }
			// 					}
			// 				},
			// 				{ 
			// 					$group: { 
			// 						_id: "$mouStatus", 
			// 						count: { $sum: 1 } 
			// 					} 
			// 				}
			// 			],
			// 			totalMou: [
			// 				{
			// 					$match: { 
			// 						$or: [
			// 							{ mouStatus: { $exists: true, $ne: null, $ne: "" } },
			// 							{ mouPdfUrl: { $exists: true, $ne: null, $ne: "" } }
			// 						]
			// 					}
			// 				},
			// 				{ $count: "count" }
			// 			]
			// 		}
			// 	}
			// ]),
			
		]);

		// Process results efficiently
		// const mouList = mouResults[0]?.allMou || [];
		// const mouStats = mouResults[0]?.mouStats || [];
		// const totalMou = mouResults[0]?.totalMou[0]?.count || 0;
		// const pendingMouTotal = mouStats.find(s => s._id === 'Pending')?.count || 0;
		// const approvedMouTotal = mouStats.find(s => s._id === 'Approved')?.count || 0;
	
	// Extract total users count from employee aggregation
	const totalUsers = employeeResults[0]?.totalUsers[0]?.count || 0;

		res.status(200).json({
			loggedInUserId,
			totalLeads,
				totalUsers,
			newLeads: newLeadsCount,
			newLeadSection: newLeadsList.map(lead => ({
				_id: lead._id,
				name: lead.name,
				status: lead.status,
				createdAt: lead.createdAt
			})),
			siteVisitCount,
			// totalMou,
			// pendingMouTotal,
			// approvedMouTotal,
			success: true
		});
	} catch (err) {
		console.error('Analytics API error:', err);
		res.status(500).json({ error: err.message, success: false });
	}
}

// Export with auth middleware to ensure req.employee is populated
export default (req, res) => userAuth(req, res, handler);
