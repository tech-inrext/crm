import { Service } from "@framework";
import CabBooking from "../models/CabBooking";
import Employee from "../models/Employee";
import Vehicle from "../models/Vehicle"; // implicit registration
import mongoose from "mongoose";
import { isSystemAdminAllowed } from "../middlewares/auth";
import { sendCabBookingApprovalEmail } from "../../lib/cabBookingApproval";
import { NotificationHelper } from "../../lib/notification-helpers";
import { sendCabBookingStatusEmail } from "../../lib/emails/cabBookingStatus";
import { sendCabVendorAssignmentEmail } from "../../lib/emails/cabVendorAssignment";

class CabBookingService extends Service {
  constructor() {
    super();
  }

  // Helper: check if a string is a valid ObjectId
  _isValidObjectId(str) {
    return mongoose.isValidObjectId(str);
  }

  async createBooking(req, res) {
    try {
      const {
        cabBookedBy,
        project,
        clientName,
        numberOfClients,
        pickupPoint,
        dropPoint,
        employeeName,
        teamLeader,
        requestedDateTime,
        status,
        driver,
        vehicle,
        currentLocation,
        estimatedArrival,
        notes,
      } = req.body;

      const loggedInUserId = req.employee?._id;

      if (
        !project ||
        !clientName ||
        !Number.isFinite(Number(numberOfClients)) ||
        !pickupPoint ||
        !dropPoint ||
        !requestedDateTime
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing required fields: project, clientName, numberOfClients, pickupPoint, dropPoint, teamLeader, requestedDateTime",
        });
      }

      if (Number(numberOfClients) < 1) {
        return res.status(400).json({
          success: false,
          message: "numberOfClients must be at least 1",
        });
      }

      const idsToValidate = [
        ["driver", driver],
        ["vehicle", vehicle],
      ].filter(([, v]) => !!v);

      for (const [field, value] of idsToValidate) {
        if (!this._isValidObjectId(value)) {
          return res
            .status(400)
            .json({ success: false, message: `Invalid ${field} id` });
        }
      }

      const employee = await Employee.findById(loggedInUserId);
      if (!employee) {
        return res
          .status(400)
          .json({ success: false, message: "Employee not found" });
      }

      const managerObjectId = this._isValidObjectId(employee.managerId)
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

      try {
        const manager = await Employee.findById(employee.managerId);
        await sendCabBookingApprovalEmail({ manager, employee, booking: doc });
      } catch (err) {
        // console.error("Email send failed:", err);
      }

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

      return res.status(201).json({ success: true, data: doc });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error creating booking",
        error: error.message,
      });
    }
  }

  async getAllBookings(req, res) {
    const isManager = req.isManager || (res.locals && res.locals.isManager);
    const isSystemAdmin =
      req.isSystemAdmin || (res.locals && res.locals.isSystemAdmin);

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
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const currentPage = Math.max(1, parseInt(page, 10));
      const itemsPerPage = Math.max(1, parseInt(limit, 10));
      const skip = (currentPage - 1) * itemsPerPage;
      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

      const loggedInUserId = req.employee?._id;

      let visibilityFilter;
      let reportIds = [];
      if (isSystemAdmin) {
        visibilityFilter = {};
      } else if (isManager) {
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

      let statusFilter = {};
      if (typeof status !== "undefined" && String(status).trim() !== "") {
        const list = (
          Array.isArray(status) ? status : String(status).split(",")
        )
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean);

        const filteredList = list.filter((s) => s !== "all");
        const invalid = filteredList.filter(
          (s) => !ALLOWED_STATUSES.includes(s)
        );
        if (invalid.length) {
          return res.status(400).json({
            success: false,
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

      const computedTotalPages = Math.max(1, Math.ceil(total / itemsPerPage));

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
      }

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

      return res.status(200).json({
        success: true,
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
      return res.status(500).json({
        success: false,
        message: "Failed to fetch bookings",
        error: error.message,
      });
    }
  }

  async patchBooking(req, res) {
    const { id } = req.query;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: "Missing booking id" });

    try {
      const booking = await CabBooking.findById(id);
      if (!booking)
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });

      if (["rejected", "completed"].includes(booking.status)) {
        return res.status(403).json({
          success: false,
          message: "Cannot edit booking after it is rejected or completed.",
        });
      }

      const prevStatus = booking.status;
      const prevVendorId = booking.vendor ? booking.vendor.toString() : null;

      const update = {};
      if (typeof req.body.status === "string") update.status = req.body.status;
      if (req.body.vendor) update.vendor = req.body.vendor;
      if (typeof req.body.cabOwner === "string")
        update.cabOwner = req.body.cabOwner;
      if (typeof req.body.driverName === "string")
        update.driverName = req.body.driverName;
      if (typeof req.body.aadharNumber === "string")
        update.aadharNumber = req.body.aadharNumber;
      if (typeof req.body.dlNumber === "string")
        update.dlNumber = req.body.dlNumber;
      if (req.body.odometerStartImageUrl) {
        update.odometerStartImageUrl = String(req.body.odometerStartImageUrl);
      }
      if (req.body.odometerEndImageUrl) {
        update.odometerEndImageUrl = String(req.body.odometerEndImageUrl);
      }
      if (req.body.fare !== undefined && req.body.fare !== null) {
        const coerced = Number(req.body.fare);
        if (!Number.isNaN(coerced)) update.fare = coerced;
      }
      if (req.body.driver) update.driver = req.body.driver;
      if (req.body.vehicle) update.vehicle = req.body.vehicle;
      if (req.body.managerId) update.managerId = req.body.managerId;

      if (update.status === "completed" && booking.status === "payment_due") {
        const rawFlag =
          req.isSystemAdmin ||
          (res.locals && res.locals.isSystemAdmin) ||
          (req.role &&
            (req.role.isSystemAdmin || req.role.isSystemAdmin === "true"));
        const roleBased = req.role
          ? isSystemAdminAllowed(req.role, "write", "cab-booking")
          : false;

        if (!rawFlag && !roleBased) {
          return res.status(403).json({
            success: false,
            message:
              "Only system administrators with write permission to cab-booking can mark a payment-due booking as completed.",
          });
        }
      }

      const updated = await CabBooking.findByIdAndUpdate(id, update, {
        new: true,
      });

      const newStatus = updated?.status;
      const statusChanged = prevStatus !== newStatus;
      const shouldNotifyStatus =
        statusChanged && ["approved", "rejected"].includes(newStatus);

      if (shouldNotifyStatus) {
        try {
          const [employee, manager] = await Promise.all([
            updated.cabBookedBy
              ? Employee.findById(updated.cabBookedBy).lean()
              : null,
            updated.managerId
              ? Employee.findById(updated.managerId).lean()
              : null,
          ]);

          if (employee?.email) {
            await sendCabBookingStatusEmail({
              employee,
              manager,
              booking: updated,
              status: newStatus,
            });
          }
        } catch (mailErr) {
          console.error("[cab-booking PATCH] Status email failed:", mailErr);
        }
      }

      const newVendorId = updated.vendor ? updated.vendor.toString() : null;
      const vendorChanged = prevVendorId !== newVendorId && !!newVendorId;

      if (vendorChanged) {
        try {
          const [vendor, employee, manager] = await Promise.all([
            Employee.findById(newVendorId).lean(),
            updated.cabBookedBy
              ? Employee.findById(updated.cabBookedBy).lean()
              : null,
            updated.managerId
              ? Employee.findById(updated.managerId).lean()
              : null,
          ]);

          if (vendor?.email) {
            await sendCabVendorAssignmentEmail({
              vendor,
              booking: updated,
              employee,
              manager,
            });
          } else {
            console.warn(
              "[cab-booking PATCH] Assigned vendor has no email:",
              newVendorId
            );
          }
        } catch (mailErr) {
          console.error(
            "[cab-booking PATCH] Vendor assignment email failed:",
            mailErr
          );
        }
      }

      if (statusChanged) {
        try {
          await NotificationHelper.notifyCabBookingStatusChange(
            updated._id,
            updated.toObject(),
            prevStatus,
            newStatus,
            req.employee?._id
          );
          console.log("✅ Cab booking status change notification sent");
        } catch (error) {
          console.error("❌ Cab booking status notification failed:", error);
        }
      }

      if (vendorChanged) {
        try {
          await NotificationHelper.notifyCabBookingVendorAssignment(
            updated._id,
            updated.toObject(),
            newVendorId,
            req.employee?._id
          );
          console.log("✅ Cab booking vendor assignment notification sent");
        } catch (error) {
          console.error(
            "❌ Cab booking vendor assignment notification failed:",
            error
          );
        }
      }

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  async getBookingById(req, res) {
    const { id } = req.query;

    try {
      const booking = await CabBooking.findById(id)
        .populate("cabBookedBy", "name email phone")
        .populate("managerId", "name email")
        .populate("vendor", "name email phone")
        .lean();

      if (!booking) {
        return res
          .status(404)
          .json({ success: false, message: "Booking not found" });
      }

      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default CabBookingService;
