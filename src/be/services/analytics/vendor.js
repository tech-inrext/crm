 
import dbConnect from "@/lib/mongodb";
import Employee from "@/models/Employee";
import VendorBooking from "@/models/VendorBooking";
import CabVendor from "@/models/CabVendor";
import CabBooking from "@/models/CabBooking";

class VendorAnalyticsService {
  async getVendor(req, res) {
    await dbConnect();

    try {
      const { vendorNames, vendorEmails } = req.query;

      function getDayRange(offset = 0) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const start = new Date(now);
        start.setDate(start.getDate() - offset);
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
          const names = Array.isArray(vendorNames)
            ? vendorNames
            : vendorNames.split(",");
          conditions.push({
            $or: [
              { cabOwnerName: { $in: names.map(n => new RegExp(n.trim(), "i")) } },
              { driverName: { $in: names.map(n => new RegExp(n.trim(), "i")) } },
            ],
          });
        }

        if (vendorEmails) {
          const emails = Array.isArray(vendorEmails)
            ? vendorEmails
            : vendorEmails.split(",");
          conditions.push({
            email: { $in: emails.map(e => new RegExp(e.trim(), "i")) },
          });
        }

        if (conditions.length > 0) {
          vendorMatchConditions = { $or: conditions };
        }
      }

      const cabVendorMatch =
        Object.keys(vendorMatchConditions).length > 0
          ? { isCabVendor: true, ...vendorMatchConditions }
          : { isCabVendor: true };

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
          {
            $addFields: {
              totalBookings: { $size: "$bookings" },
              completedBookings: {
                $size: {
                  $filter: {
                    input: "$bookings",
                    cond: { $regexMatch: { input: "$$this.status", regex: /completed/i } },
                  },
                },
              },
              pendingBookings: {
                $size: {
                  $filter: {
                    input: "$bookings",
                    cond: { $regexMatch: { input: "$$this.status", regex: /pending/i } },
                  },
                },
              },
              totalEarnings: { $sum: "$bookings.fare" },
              avgFare: { $avg: "$bookings.fare" },
            },
          },
          {
            $project: {
              _id: 1,
              name: { $ifNull: ["$cabOwnerName", "$driverName"] },
              cabOwnerName: 1,
              driverName: 1,
              email: 1,
              phone: 1,
              vehicleType: 1,
              vehicleNumber: 1,
              totalBookings: 1,
              completedBookings: 1,
              pendingBookings: 1,
              totalEarnings: { $round: ["$totalEarnings", 2] },
              avgFare: { $round: ["$avgFare", 2] },
            },
          },
          { $sort: { totalBookings: -1, name: 1 } },
        ]),

        CabVendor.find(vendorMatchConditions),

        VendorBooking.aggregate([
          { $match: { createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
          {
            $group: {
              _id: "$ownerName",
              totalBookings: { $sum: 1 },
              completedBookings: { $sum: { $cond: [{ $regexMatch: { input: "$status", regex: /completed/i } }, 1, 0] } },
              pendingBookings: { $sum: { $cond: [{ $regexMatch: { input: "$status", regex: /pending/i } }, 1, 0] } },
              totalAmount: { $sum: "$amount" },
              avgAmount: { $avg: "$amount" },
              latestBooking: { $max: "$createdAt" },
            },
          },
          {
            $project: {
              name: "$_id",
              totalBookings: 1,
              completedBookings: 1,
              pendingBookings: 1,
              totalEarnings: "$totalAmount",
              avgFare: "$avgAmount",
              latestBooking: 1,
            },
          },
          { $sort: { totalBookings: -1 } },
        ]),

        CabVendor.distinct("cabOwnerName"),
      ]);

      const getBestVendorName = v =>
        v.cabOwnerName || v.driverName || v.name || "Cab Driver";

      const allVendors = [
        ...vendorAnalytics.map(v => ({ id: v._id, name: getBestVendorName(v), type: "cab_vendor", ...v })),
        ...cabVendorsFromCollection.map(v => ({ id: v._id, name: getBestVendorName(v), type: "cab_vendor_collection", ...v })),
        ...vendorBookingStats.map(v => ({ id: v._id, name: v.name || "Vendor", type: "general_vendor", ...v })),
      ];

      const uniqueVendors = allVendors.filter(
        (v, i, arr) => i === arr.findIndex(x => x.name.toLowerCase() === v.name.toLowerCase())
      );

      return res.status(200).json({
        success: true,
        totalVendors: uniqueVendors.length,
        totalCabVendors: vendorAnalytics.length,
        totalCabVendorCollection: cabVendorsFromCollection.length,
        totalGeneralVendors: vendorBookingStats.length,
        allVendors: uniqueVendors,
        cabVendors: vendorAnalytics,
        cabVendorCollection: cabVendorsFromCollection,
        generalVendors: vendorBookingStats,
        cabVendorNames,
        searchCriteria: { vendorNames, vendorEmails },
        trend: {
          totalVendors: {
            today: todayVendors,
            yesterday: yesterdayVendors,
            beforeYesterday: beforeYesterdayVendors,
          },
        },
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

export default VendorAnalyticsService;
 