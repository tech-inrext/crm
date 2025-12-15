// pages/api/v0/booking-login/status.js
import dbConnect from "../../../../lib/mongodb";
import BookingLogin from "../../../../models/BookingLogin";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

const updateBookingStatus = async (req, res) => {
  const { id } = req.query;
  const { status, rejectionReason } = req.body;

  try {
    const booking = await BookingLogin.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking login not found",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'approved' or 'rejected'",
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // Check if user has permission to approve/reject
    const userRole = req.role?.name?.toLowerCase();
    const isSystemAdmin = req.isSystemAdmin;

    if (!['accounts', 'admin'].includes(userRole) && !isSystemAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only Accounts/Admin role can approve or reject bookings",
      });
    }

    booking.status = status;
    booking.approvedBy = status === "approved" ? req.employee._id : null;
    booking.rejectionReason = status === "rejected" ? rejectionReason : "";

    await booking.save();

    const updatedBooking = await BookingLogin.findById(id)
      .populate("createdBy", "name email employeeProfileId")
      .populate("approvedBy", "name email employeeProfileId");

    return res.status(200).json({
      success: true,
      message: `Booking ${status} successfully`,
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update booking status",
      error: error.message,
    });
  }
};

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

export default withAuth(updateBookingStatus);

