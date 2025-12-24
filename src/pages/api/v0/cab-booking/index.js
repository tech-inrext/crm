// /pages/api/v0/cab-booking/index.js
import { Controller, HttpStatus } from "@framework";
import CabBooking from "../../../../models/CabBooking";
import Project from "@/models/Project";
// Ensure Vehicle model is registered with mongoose before any populate calls
import "@/models/Vehicle";
import mongoose from "mongoose";

import { sendCabBookingApprovalEmail } from "@/lib/cabBookingApproval";
import { NotificationHelper } from "../../../../lib/notification-helpers";

// ✅ Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      cabBookedBy,
      project, // (String or Project _id as string)
      clientName,
      numberOfClients,
      pickupPoint,
      dropPoint,
      employeeName, // optional
      teamLeader, // User _id (required)
      requestedDateTime, // ISO string/date
      status, // optional: pending/approved/rejected/completed/cancelled
      driver, // optional: User _id
      vehicle, // optional: Vehicle _id
      currentLocation, // optional
      estimatedArrival, // optional (string)
      notes, // optional
    } = req.body;

    const loggedInUserId = req.employee?._id;
    // Required fields check (per schema)
    if (
      !project ||
      !clientName ||
      !Number.isFinite(Number(numberOfClients)) ||
      !pickupPoint ||
      !dropPoint ||
      !requestedDateTime
    ) {
      return HttpStatus.badRequest(res, {
        success: false,
        message:
          "Missing required fields: project, clientName, numberOfClients, pickupPoint, dropPoint, teamLeader, requestedDateTime",
      });
    }

    // numberOfClients minimum
    if (Number(numberOfClients) < 1) {
      return HttpStatus.badRequest(res, {
        message: "numberOfClients must be at least 1",
      });
    }

    // Validate ObjectIds where applicable
    const idsToValidate = [
      ["driver", driver],
      ["vehicle", vehicle],
    ].filter(([, v]) => !!v);

    for (const [field, value] of idsToValidate) {
      if (!mongoose.isValidObjectId(value)) {
        return res
          .status(400)
          .json({ success: false, message: `Invalid ${field} id` });
      }
    }

    // Get managerId from Employee model
    const Employee = (await import("@/models/Employee")).default;
    const employee = await Employee.findById(loggedInUserId);
    if (!employee) {
      return HttpStatus.badRequest(res, {
        message: "Employee not found",
      });
    }

    const managerObjectId = mongoose.isValidObjectId(employee.managerId)
      ? new mongoose.Types.ObjectId(employee.managerId)
      : undefined;

    const doc = new CabBooking({
      project,
      clientName,
      cabBookedBy: loggedInUserId,
      numberOfClients: Number(numberOfClients),
      pickupPoint,
      dropPoint,
      employeeName,
      teamLeader,
      requestedDateTime: new Date(requestedDateTime),
      status: "pending",
      driver,
      vehicle,
      currentLocation,
      estimatedArrival,
      notes,
      managerId: managerObjectId,
    });

    await doc.save();

    // Send email notification to manager
    try {
      const manager = await Employee.findById(employee.managerId);
      await sendCabBookingApprovalEmail({ manager, employee, booking: doc });
    } catch (err) {
      // Optionally log; don't block the request
      // console.error("Email send failed:", err);
    }

    // Send notification for cab booking request
    try {
      await NotificationHelper.notifyCabBookingRequest(
        doc._id,
        doc.toObject(),
        loggedInUserId,
        employee.managerId
      );
      console.log("✅ Cab booking request notification sent");
    } catch (error) {
      console.error("❌ Cab booking request notification failed:", error);
    }

    return HttpStatus.created(res, { data: doc });
  } catch (error) {
    return HttpStatus.badRequest(res, { message: "Error creating booking" });
  }
};

// ✅ Get All Bookings (pagination + status filter)
const getAllBookings = async (req, res) => {
  const isManager = req.isManager || (res.locals && res.locals.isManager);
  // If middleware attached isSystemAdmin, allow full visibility across all bookings
  const isSystemAdmin =
    req.isSystemAdmin || (res.locals && res.locals.isSystemAdmin);

  // Allow exactly these statuses
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
    const {
      page = 1,
      limit = 10,
      status, // optional: "pending" or CSV "pending,approved"
      sortBy = "createdAt", // createdAt | requestedDateTime | status
      sortOrder = "desc", // asc | desc
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * itemsPerPage;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const loggedInUserId = req.employee?._id;

    // ----- visibility: system-admins see all; managers see theirs + direct reports; others see only theirs
    let visibilityFilter;
    let reportIds = [];
    if (isSystemAdmin) {
      // no visibility restrictions for system admins
      visibilityFilter = {};
    } else if (isManager) {
      const Employee = (await import("@/models/Employee")).default;
      const directReports = await Employee.find({
        managerId: String(loggedInUserId),
      })
        .select("_id")
        .lean();
      reportIds = directReports.map((e) => String(e._id));
      visibilityFilter = {
        cabBookedBy: { $in: [String(loggedInUserId), ...reportIds] },
      };
    } else {
      visibilityFilter = { cabBookedBy: String(loggedInUserId) };
    }

    // ----- status filter (optional; ignore if "all" or empty)
    let statusFilter = {};
    if (typeof status !== "undefined" && String(status).trim() !== "") {
      const list = (Array.isArray(status) ? status : String(status).split(","))
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // if client sends "all", ignore filter
      const filteredList = list.filter((s) => s !== "all");
      const invalid = filteredList.filter((s) => !ALLOWED_STATUSES.includes(s));
      if (invalid.length) {
        return HttpStatus.badRequest(res, {
          message: `Invalid status value(s): ${invalid.join(
            ", "
          )}. Allowed: ${ALLOWED_STATUSES.join(", ")}`,
        });
      }
      if (filteredList.length) {
        statusFilter = { status: { $in: filteredList } };
      }
    }

    const mainFilter = { ...visibilityFilter, ...statusFilter };

    const [rows, total] = await Promise.all([
      CabBooking.find(mainFilter)
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
          model: "Employee",
          select: "username phoneNumber",
        })
        .populate({
          path: "vehicle",
          model: "Vehicle",
          select: "model registrationNumber type capacity",
        }),
      CabBooking.countDocuments(mainFilter),
    ]);

    // Ensure totalPages is at least 1 to avoid client-side division/zero issues
    const computedTotalPages = Math.max(1, Math.ceil(total / itemsPerPage));

    // If client requested a page beyond the total pages, fetch the last page instead
    let rowsToUse = rows;
    if (currentPage > computedTotalPages) {
      const lastSkip = (computedTotalPages - 1) * itemsPerPage;
      rowsToUse = await CabBooking.find(mainFilter)
        .skip(lastSkip)
        .limit(itemsPerPage)
        .sort(sort)
        .populate({
          path: "managerId",
          model: "Employee",
          select: "name username email",
        })
        .populate({
          path: "driver",
          model: "Employee",
          select: "username phoneNumber",
        })
        .populate({
          path: "vehicle",
          model: "Vehicle",
          select: "model registrationNumber type capacity",
        });
      // adjust currentPage so response reflects the actual page returned
      // (client may wish to update its UI accordingly)
      // Note: we will return computedTotalPages in pagination below
    }

    // add canApprove + managerName like your current code
    let data;
    if (isManager) {
      data = rowsToUse.map((b) => {
        const obj = b.toObject();
        return {
          ...obj,
          canApprove:
            String(b.managerId?._id || b.managerId) ===
              String(loggedInUserId) ||
            reportIds.includes(String(b.cabBookedBy)),
          managerName: obj.managerId?.name || obj.managerId?.username || null,
        };
      });
    } else {
      data = rowsToUse.map((b) => {
        const obj = b.toObject();
        return {
          ...obj,
          canApprove: false,
          managerName: obj.managerId?.name || obj.managerId?.username || null,
        };
      });
    }

    return HttpStatus.success(res, {
      data,
      pagination: {
        totalItems: total,
        currentPage: Math.min(currentPage, computedTotalPages),
        itemsPerPage,
        totalPages: computedTotalPages,
      },
      appliedFilter: {
        status: typeof status === "undefined" ? null : String(status),
      },
    });
  } catch (error) {
    return HttpStatus.badRequest(res, { message: "Failed to fetch bookings" });
  }
};

class CabBookingIndexController extends Controller {
  constructor() {
    super();
    this.handler = this.handler.bind(this);
  }
  get(req, res) {
    return getAllBookings(req, res);
  }
  post(req, res) {
    return createBooking(req, res);
  }
}
export default new CabBookingIndexController().handler;
