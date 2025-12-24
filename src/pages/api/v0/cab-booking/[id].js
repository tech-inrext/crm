// /pages/api/v0/cab-booking/[id].js
import { HttpStatus } from "inrext-framework";
import CabBooking from "../../../../models/CabBooking";
import Employee from "../../../../models/Employee";
import { isSystemAdminAllowed } from "../../../../middlewares/auth";
import { sendCabBookingStatusEmail } from "@/lib/emails/cabBookingStatus";
import { sendCabVendorAssignmentEmail } from "@/lib/emails/cabVendorAssignment"; // <<< added
import { NotificationHelper } from "../../../../lib/notification-helpers";

async function patchBooking(req, res) {
  const { id } = req.query;
  if (!id) {
    return HttpStatus.badRequest(res, { message: "Missing booking id" });
  }

  try {
    const booking = await CabBooking.findById(id);
    if (!booking)
      return HttpStatus.notFound(res, { message: "Booking not found" });

    if (["rejected", "completed"].includes(booking.status)) {
      return HttpStatus.forbidden(res, {
        success: false,
        message: "Cannot edit booking after it is rejected or completed.",
      });
    }

    const prevStatus = booking.status;
    const prevVendorId = booking.vendor ? booking.vendor.toString() : null; // <<< added

    const update = {};
    if (typeof req.body.status === "string") update.status = req.body.status;
    if (req.body.vendor) update.vendor = req.body.vendor; // Employee ref (assignment) ✅
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
    if (req.body.driver) update.driver = req.body.driver; // User ref
    if (req.body.vehicle) update.vehicle = req.body.vehicle; // Vehicle ref
    if (req.body.managerId) update.managerId = req.body.managerId;

    // Permission guard: only system-admins (or system-admin roles granted the
    // special 'write' permission for 'cab-booking') may move a booking from
    // payment_due -> completed.
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
        return HttpStatus.forbidden(res, {
          success: false,
          message:
            "Only system administrators with write permission to cab-booking can mark a payment-due booking as completed.",
        });
      }
    }

    const updated = await CabBooking.findByIdAndUpdate(id, update, {
      new: true,
    });

    // === STATUS EMAIL (employee) ===
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

    // === VENDOR ASSIGNMENT EMAIL (vendor) ===
    const newVendorId = updated.vendor ? updated.vendor.toString() : null; // <<< added
    const vendorChanged = prevVendorId !== newVendorId && !!newVendorId; // <<< added

    if (vendorChanged) {
      // fire whenever a real vendor gets assigned/changed
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
    // === /VENDOR ASSIGNMENT EMAIL ===

    // Send notifications for status change
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

    // Send notifications for vendor assignment
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

    return HttpStatus.success(res, { data: updated });
  } catch (error) {
    return HttpStatus.badRequest(res, { message: error.message });
  }
}

class PatchBookingController extends Controller {
  constructor() {
    super();
  }
  patch(req, res) {
    return patchBooking(req, res);
  }
}

const handler = new PatchBookingController().handler;
export default handler;
