// /pages/api/v0/cab-booking/[id].js
import dbConnect from "../../../../lib/mongodb";
import CabBooking from "../../../../models/CabBooking";
import Employee from "../../../../models/Employee";
import * as cookie from "cookie";
import { userAuth, isSystemAdminAllowed } from "../../../../middlewares/auth";
import { sendCabBookingStatusEmail } from "@/lib/emails/cabBookingStatus";
import { sendCabVendorAssignmentEmail } from "@/lib/emails/cabVendorAssignment"; // <<< added

async function patchBooking(req, res) {
  if (req.method !== "PATCH") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  await dbConnect();
  const { id } = req.query;
  if (!id)
    return res
      .status(400)
      .json({ success: false, message: "Missing booking id" });

  try {
    console.log("[cab-booking PATCH] id", id, "body", req.body);

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
        (req.role && (req.role.isSystemAdmin || req.role.isSystemAdmin === "true"));
      const roleBased = req.role ? isSystemAdminAllowed(req.role, "write", "cab-booking") : false;

      // Debug: log computed flags to help diagnose permission failures
      console.log("[cab-booking PATCH] admin-check", {
        rawFlag,
        roleBased,
  roleId: req.role ? (req.role._id || req.role.id) : null,
  roleName: req.role ? req.role.name : null,
  roleIsSystemAdminFlag: req.role ? req.role.isSystemAdmin : null,
      });

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
    console.log("[cab-booking PATCH] updated", updated && updated._id);

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

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

export default withAuth(patchBooking);
