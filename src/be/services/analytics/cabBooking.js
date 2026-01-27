import dbConnect from "@/lib/mongodb";
import CabBooking from "@/models/CabBooking";
import Employee from "@/models/Employee";
import CabVendor from "@/models/CabVendor";
import VendorBooking from "@/models/VendorBooking";

class CabBookingService {
  async getCabBooking({ vendorNames, vendorEmails, month, status }) {
    try {
      await dbConnect();

      /* ---------------- Filters ---------------- */
      const filters = {};

      if (month && month !== "all") {
        const [year, mon] = month.split("-");
        const start = new Date(parseInt(year), parseInt(mon) - 1, 1);
        const end = new Date(parseInt(year), parseInt(mon), 0, 23, 59, 59, 999);
        filters.createdAt = { $gte: start, $lte: end };
      }

      if (status && status !== "all") {
        filters.status = new RegExp(status, "i");
      }

      let vendorCond = {};
      if (vendorNames || vendorEmails) {
        const or = [];

        if (vendorNames) {
          const names = Array.isArray(vendorNames)
            ? vendorNames
            : vendorNames.split(",");
          or.push({
            cabOwnerName: { $in: names.map((n) => new RegExp(n.trim(), "i")) },
          });
          or.push({
            driverName: { $in: names.map((n) => new RegExp(n.trim(), "i")) },
          });
        }

        if (vendorEmails) {
          const emails = Array.isArray(vendorEmails)
            ? vendorEmails
            : vendorEmails.split(",");
          or.push({
            email: { $in: emails.map((e) => new RegExp(e.trim(), "i")) },
          });
        }

        if (or.length) vendorCond = { $or: or };
      }

      /* ---------------- Totals ---------------- */
      const [
        totalCabBookings,
        completedCabBookings,
        pendingCabBookings,
        totalSpend,
        cabVendorNames,
      ] = await Promise.all([
        CabBooking.countDocuments(filters),
        CabBooking.countDocuments({ ...filters, status: /completed/i }),
        CabBooking.countDocuments({ ...filters, status: /pending/i }),
        CabBooking.aggregate([
          { $match: filters },
          { $group: { _id: null, total: { $sum: "$fare" } } },
        ]).then((r) => r[0]?.total || 0),
        CabVendor.distinct("cabOwnerName", vendorCond),
      ]);

      /* ---------------- Cab Vendor Analytics ---------------- */
      const vendorAnalytics = await Employee.aggregate([
        { $match: { isCabVendor: true, ...vendorCond } },
        {
          $lookup: {
            from: "cabbookings",
            let: { vendorId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$vendor", "$$vendorId"] },
                  ...filters,
                },
              },
            ],
            as: "bookings",
          },
        },
        {
          $addFields: {
            totalBookings: { $size: "$bookings" },
            completedBookings: {
              $size: {
                $filter: {
                  input: "$bookings",
                  cond: {
                    $regexMatch: {
                      input: "$$this.status",
                      regex: /completed/i,
                    },
                  },
                },
              },
            },
            pendingBookings: {
              $size: {
                $filter: {
                  input: "$bookings",
                  cond: {
                    $regexMatch: {
                      input: "$$this.status",
                      regex: /pending/i,
                    },
                  },
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
            cabOwnerName: 1,
            driverName: 1,
            name: 1,
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
        { $sort: { totalBookings: -1 } },
      ]);

      /* ---------------- Vendor Booking Analytics ---------------- */
      const vendorBookingStats = await VendorBooking.aggregate([
        { $match: vendorCond },
        {
          $group: {
            _id: "$ownerName",
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$status",
                      regex: /completed|done|finished/i,
                    },
                  },
                  1,
                  0,
                ],
              },
            },
            pendingBookings: {
              $sum: {
                $cond: [
                  {
                    $regexMatch: {
                      input: "$status",
                      regex: /pending|waiting|scheduled/i,
                    },
                  },
                  1,
                  0,
                ],
              },
            },
            totalAmount: { $sum: "$amount" },
            avgAmount: { $avg: "$amount" },
            latestBooking: { $max: "$createdAt" },
            vendorInfo: { $first: "$$ROOT" },
          },
        },
        {
          $project: {
            name: "$_id",
            totalBookings: 1,
            completedBookings: 1,
            pendingBookings: 1,
            totalAmount: { $round: ["$totalAmount", 2] },
            avgAmount: { $round: ["$avgAmount", 2] },
            latestBooking: 1,
            contactNumber: "$vendorInfo.contactNumber",
            vehicleType: "$vendorInfo.vehicleType",
            vehicleNumber: "$vendorInfo.vehicleNumber",
            location: "$vendorInfo.location",
            email: "$vendorInfo.email",
          },
        },
        { $sort: { totalBookings: -1 } },
      ]);

      /* ---------------- Final Response ---------------- */
      const getBestVendorName = (v) =>
        v?.cabOwnerName ||
        v?.driverName ||
        v?.name ||
        v?.email?.split("@")[0] ||
        "Cab Driver";

      const allVendors = [
        ...vendorAnalytics.map((v) => ({
          id: v._id,
          name: getBestVendorName(v),
          type: "cab_vendor",
          totalBookings: v.totalBookings || 0,
          completedBookings: v.completedBookings || 0,
          pendingBookings: v.pendingBookings || 0,
          totalSpendings: v.totalEarnings || 0,
          avgFare: v.avgFare || 0,
          email: v.email,
          phone: v.phone,
          vehicleType: v.vehicleType,
          vehicleNumber: v.vehicleNumber,
        })),
        ...vendorBookingStats.map((v) => ({
          id: v._id,
          name: v.name || "Vendor",
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

      const uniqueVendors = allVendors.filter(
        (v, i, self) =>
          i ===
          self.findIndex(
            (x) =>
              (x.name || "").toLowerCase() === (v.name || "").toLowerCase()
          )
      );

      return {
        success: true,
        totalCabBookings,
        completedCabBookings,
        pendingCabBookings,
        totalSpend,
        totalVendors: uniqueVendors.length,
        allVendors: uniqueVendors,
        cabVendors: vendorAnalytics,
        generalVendors: vendorBookingStats,
        cabVendorNames,
        searchCriteria: { vendorNames, vendorEmails },
      };
    } catch (err) {
      console.error("CabBooking Service Error:", err);
      throw err; // 🔥 API will handle response
    }
  }
}

export default new CabBookingService();
