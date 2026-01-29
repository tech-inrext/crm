import { Service } from "@framework";
import CabBooking from "../models/CabBooking";
import mongoose from "mongoose";

class CabVendorService extends Service {
  constructor() {
    super();
  }

  async getBookingsForLoggedInVendor(req, res) {
    const ALLOWED_STATUSES = [
      "pending",
      "approved",
      "rejected",
      "active",
      "completed",
      "cancelled",
      "payment_due",
    ];

    try {
      const loggedInUserId = req.employee?._id;
      if (!loggedInUserId || !mongoose.isValidObjectId(loggedInUserId)) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      const vendorObjectId = new mongoose.Types.ObjectId(loggedInUserId);

      // ---- If you want to enforce vendor role, uncomment this block ----
      // const emp = await Employee.findById(vendorObjectId).select("isCabVendor");
      // if (!emp || !emp.isCabVendor) {
      //   return res.status(403).json({ success: false, message: "Not a vendor user" });
      // }

      const {
        page = 1,
        limit = 10,
        status, // optional: "pending" or "pending,approved"
        from, // optional ISO date string
        to, // optional ISO date string
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
      const itemsPerPage = Math.max(1, parseInt(String(limit), 10) || 10);
      const skip = (currentPage - 1) * itemsPerPage;
      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      // base filter: only this vendor's bookings
      const filter = { vendor: vendorObjectId };

      // status filter (optional)
      if (typeof status !== "undefined" && String(status).trim() !== "") {
        const list = (
          Array.isArray(status) ? status : String(status).split(",")
        )
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
          .filter((s) => s !== "all");
        const invalid = list.filter((s) => !ALLOWED_STATUSES.includes(s));
        if (invalid.length) {
          return res.status(400).json({
            success: false,
            message: `Invalid status value(s): ${invalid.join(
              ", "
            )}. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
          });
        }
        if (list.length) filter.status = { $in: list };
      }

      // optional date range on requestedDateTime
      if (from || to) {
        filter.requestedDateTime = {};
        if (from) filter.requestedDateTime.$gte = new Date(from);
        if (to) filter.requestedDateTime.$lte = new Date(to);
      }

      const [rows, total] = await Promise.all([
        CabBooking.find(filter)
          .skip(skip)
          .limit(itemsPerPage)
          .sort(sort)
          .populate({
            path: "managerId",
            model: "Employee",
            select: "name username email",
          })
          .populate({
            path: "driver",
            model: "User",
            select: "username phoneNumber",
          })
          .populate({
            path: "vehicle",
            model: "Vehicle",
            select: "model registrationNumber type capacity",
          })
          .populate({
            path: "vendor",
            model: "Employee",
            select: "name email phone isCabVendor",
          })
          .populate({
            path: "cabBookedBy",
            model: "Employee",
            select: "name username email",
          })
          .lean(),
        CabBooking.countDocuments(filter),
      ]);

      const data = rows.map((obj) => ({
        ...obj,
        managerName: obj.managerId?.name || obj.managerId?.username || null,
      }));

      return res.status(200).json({
        success: true,
        data,
        pagination: {
          totalItems: total,
          currentPage,
          itemsPerPage,
          totalPages: Math.ceil(total / itemsPerPage),
        },
        appliedFilter: {
          vendorId: String(vendorObjectId),
          status: typeof status === "undefined" ? null : String(status),
          from: from || null,
          to: to || null,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch vendor bookings",
        error: error.message,
      });
    }
  }
}

export default CabVendorService;
