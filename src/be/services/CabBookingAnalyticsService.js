import { Service } from "@framework";
import CabBooking from "../models/CabBooking";
import Employee from "../models/Employee";
import dbConnect from "../../lib/mongodb";
import mongoose from "mongoose";

class CabBookingAnalyticsService extends Service {
  async getCabBookingStats(req, res) {
    try {
      await dbConnect();
      const loggedInUserId = req.employee?._id;
      if (!loggedInUserId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const isManager = req.isManager || (res.locals && res.locals.isManager) || false;
      const isSystemAdmin = req.isSystemAdmin || (res.locals && res.locals.isSystemAdmin) || false;

      // 1. Fetch direct reports / team members based on role
      let directReports = [];
      let teamVisibilityFilter;

      if (isSystemAdmin) {
        // System Admin sees ALL employees in the system
        directReports = await Employee.find({
          _id: { $ne: loggedInUserId },
        })
          .select("_id name email designation employeeProfileId")
          .lean();

        teamVisibilityFilter = {};
      } else if (isManager) {
        // Manager sees employees reporting to them
        directReports = await Employee.find({
          managerId: String(loggedInUserId),
        })
          .select("_id name email designation employeeProfileId")
          .lean();

        const reportIds = directReports.map((e) => String(e._id));
        teamVisibilityFilter =
          reportIds.length > 0
            ? { cabBookedBy: { $in: reportIds } }
            : { _id: null };
      } else {
        // Regular employee with no team members
        directReports = [];
        teamVisibilityFilter = { _id: null };
      }

      const reportIds = directReports.map((e) => String(e._id));

      // 2. Fetch My Bookings (booked by logged-in user)
      const myBookings = await CabBooking.find({ cabBookedBy: String(loggedInUserId) })
        .populate({ path: "vendor", model: "Employee", select: "name" })
        .sort({ createdAt: -1 })
        .lean();

      let myPending = 0;
      let myCompleted = 0;
      let myCancelled = 0;
      let mySpent = 0;

      const myStatusCounts = {
        pending: 0,
        approved: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
      };

      myBookings.forEach((b) => {
        const s = b.status?.toLowerCase() || "pending";
        if (myStatusCounts.hasOwnProperty(s)) {
          myStatusCounts[s]++;
        }
        if (["pending", "active", "approved"].includes(s)) {
          myPending++;
        } else if (["completed", "payment_due"].includes(s)) {
          myCompleted++;
          mySpent += b.fare || 0;
        } else if (["cancelled", "rejected"].includes(s)) {
          myCancelled++;
        }
      });

      const myBookingStats = {
        totalBookings: myBookings.length,
        pending: myPending,
        completed: myCompleted,
        cancelled: myCancelled,
        totalSpent: mySpent,
        statusBreakdown: myStatusCounts,
      };

      // 3. Fetch Team Bookings
      const teamBookingsDocs = directReports.length > 0 || isSystemAdmin
        ? await CabBooking.find(teamVisibilityFilter)
            .populate({ path: "cabBookedBy", model: "Employee", select: "name email employeeProfileId" })
            .populate({ path: "vendor", model: "Employee", select: "name phone" })
            .sort({ createdAt: -1 })
            .lean()
        : [];

      let teamPending = 0;
      let teamCompleted = 0;
      let teamCancelled = 0;
      let teamSpent = 0;
      const activeMemberIds = new Set();

      const teamStatusCounts = {
        pending: 0,
        approved: 0,
        active: 0,
        completed: 0,
        cancelled: 0,
        rejected: 0,
      };

      const teamBookingsList = teamBookingsDocs.map((b) => {
        const s = b.status?.toLowerCase() || "pending";
        if (teamStatusCounts.hasOwnProperty(s)) {
          teamStatusCounts[s]++;
        }
        if (["pending", "active", "approved"].includes(s)) {
          teamPending++;
        } else if (["completed", "payment_due"].includes(s)) {
          teamCompleted++;
          teamSpent += b.fare || 0;
        } else if (["cancelled", "rejected"].includes(s)) {
          teamCancelled++;
        }

        if (b.cabBookedBy?._id) {
          activeMemberIds.add(String(b.cabBookedBy._id));
        }

        return {
          _id: b._id,
          bookingId: b.bookingId || `CAB-${b._id.toString().substring(0, 6)}`,
          employeeName: b.cabBookedBy?.name || b.employeeName || "Team Member",
          employeeEmail: b.cabBookedBy?.email || "",
          employeeProfileId: b.cabBookedBy?.employeeProfileId || "",
          project: b.project || "N/A",
          clientName: b.clientName || "N/A",
          pickupPoint: b.pickupPoint || "N/A",
          dropPoint: b.dropPoint || "N/A",
          requestedDateTime: b.requestedDateTime,
          status: b.status || "pending",
          vendorName: b.vendor?.name || b.cabOwner || "Unassigned",
          driverName: b.driverName || "Not assigned",
          fare: b.fare || 0,
          createdAt: b.createdAt,
        };
      });

      const teamStats = {
        totalTeamBookings: teamBookingsList.length,
        pending: teamPending,
        completed: teamCompleted,
        cancelled: teamCancelled,
        totalSpent: teamSpent,
        activeMembersCount: activeMemberIds.size,
        totalTeamMembers: directReports.length,
        teamMembers: directReports.map((e) => ({
          _id: String(e._id),
          name: e.name,
          email: e.email,
          employeeProfileId: e.employeeProfileId,
        })),
        statusBreakdown: teamStatusCounts,
      };

      // 4. Overall pipeline and hotspots calculation (combining all visible bookings)
      const allVisibleBookings = await CabBooking.find(
        isSystemAdmin
          ? {}
          : { cabBookedBy: { $in: [String(loggedInUserId), ...reportIds] } }
      )
        .select("status fare pickupPoint")
        .lean();

      let pipelinePending = 0;
      let pipelineCompleted = 0;
      let pipelineCancelled = 0;

      allVisibleBookings.forEach((b) => {
        const s = b.status?.toLowerCase();
        if (["pending", "active", "approved"].includes(s)) {
          pipelinePending++;
        } else if (["completed", "payment_due"].includes(s)) {
          pipelineCompleted++;
        } else if (["cancelled", "rejected"].includes(s)) {
          pipelineCancelled++;
        }
      });

      const totalSpent = allVisibleBookings.reduce((sum, b) => sum + (b.fare || 0), 0);
      const costPerVisit = pipelineCompleted > 0 ? totalSpent / pipelineCompleted : 0;

      const hotspotsMap = {};
      allVisibleBookings.forEach((b) => {
        if (b.pickupPoint) {
          hotspotsMap[b.pickupPoint] = (hotspotsMap[b.pickupPoint] || 0) + 1;
        }
      });
      const hotspots = Object.keys(hotspotsMap)
        .map((area) => ({ area, count: hotspotsMap[area] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);

      return res.status(200).json({
        success: true,
        data: {
          myBookingStats,
          teamStats,
          teamBookingsList,
          pipeline: {
            totalScheduled: pipelinePending + pipelineCompleted + pipelineCancelled,
            pending: pipelinePending,
            completed: pipelineCompleted,
            cancelled: pipelineCancelled,
          },
          roi: {
            totalSpent,
            costPerVisit,
            mousGenerated: pipelineCompleted,
          },
          vendors: [
            { name: "Uber Fleet", onTimeRate: 95, trips: pipelineCompleted },
            { name: "Ola Corporate", onTimeRate: 88, trips: pipelinePending },
          ],
          hotspots,
        },
      });
    } catch (error) {
      console.error("[CabBookingAnalyticsService] Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default CabBookingAnalyticsService;
