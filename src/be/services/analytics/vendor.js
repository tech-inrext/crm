import dbConnect from "@/lib/mongodb";
import Employee from "../../models/Employee";
import CabBooking from "../../models/CabBooking";

class VendorAnalyticsService {
  async calculateVendorStats() {
    // Total Cab Vendors
    const totalCabVendors = await Employee.countDocuments({
      isCabVendor: true,
    });

    // Total Earnings
    const earningsResult = await CabBooking.aggregate([
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$fare" },
        },
      },
    ]);

    const totalEarnings =
      earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

    return {
      totalCabVendors,
      totalEarnings: Number(totalEarnings.toFixed(2)),
    };
  }

  async getVendor(req, res) {
    await dbConnect();

    try {
      const stats = await this.calculateVendorStats();

      return res.status(200).json({
        success: true,
        totalCabVendors: stats.totalCabVendors,
        totalEarnings: stats.totalEarnings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

export default VendorAnalyticsService;
