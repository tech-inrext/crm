// pages/api/v0/booking-login/[id].js
import dbConnect from "../../../../lib/mongodb";
import BookingLogin from "../../../../models/BookingLogin";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

const getBookingLoginById = async (req, res) => {
  const { id } = req.query;

  try {
    const booking = await BookingLogin.findById(id)
      .populate("createdBy", "name email employeeProfileId")
      .populate("approvedBy", "name email employeeProfileId");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking login not found",
      });
    }

    // Check if user is admin/accounts or the creator of the booking
    const userRole = req.role?.name?.toLowerCase();
    const isAccountsUser = userRole === 'accounts' || userRole === 'admin';
    const isSystemAdmin = req.isSystemAdmin;
    const isCreator = String(booking.createdBy._id) === String(req.employee._id);

    if (!isAccountsUser && !isSystemAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only view your own bookings.",
      });
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking login",
      error: error.message,
    });
  }
};

const updateBookingLogin = async (req, res) => {
  const { id } = req.query;

  try {
    const booking = await BookingLogin.findById(id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking login not found",
      });
    }

    // Check user role
    const userRole = req.role?.name?.toLowerCase();
    const isAccountsUser = userRole === 'accounts' || userRole === 'admin';
    const isSystemAdmin = req.isSystemAdmin;
    const isCreator = String(booking.createdBy) === String(req.employee._id);

    // Non-accounts users cannot edit submitted bookings
    if (!isAccountsUser && !isSystemAdmin && booking.status !== 'draft') {
      return res.status(403).json({
        success: false,
        message: "Cannot edit submitted booking. Only draft bookings can be edited.",
      });
    }

    // Check if non-accounts/admin user is trying to change status to approved/rejected
    if (req.body.status && ['approved', 'rejected'].includes(req.body.status)) {
      if (!isAccountsUser && !isSystemAdmin) {
        return res.status(403).json({
          success: false,
          message: "Only Accounts/Admin role can approve or reject bookings",
        });
      }
    }

    // Prevent updates if already approved/rejected for non-accounts/admin users
    if ((booking.status === 'approved' || booking.status === 'rejected') && 
        !isAccountsUser && !isSystemAdmin) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify approved or rejected booking",
      });
    }

    const updatedBooking = await BookingLogin.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email employeeProfileId");

    return res.status(200).json({
      success: true,
      message: "Booking login updated successfully",
      data: updatedBooking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update booking login",
      error: error.message,
    });
  }
};

const deleteBookingLogin = async (req, res) => {
  const { id } = req.query;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required",
      });
    }

    const booking = await BookingLogin.findById(id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking login not found",
      });
    }

    // Get user role from auth middleware
    const userRole = req.role?.name?.toLowerCase();
    const isAccountsUser = userRole === 'accounts';

    // 🔒 Role-based access control for deletion
    if (!isAccountsUser) {
      // Non-accounts users can only delete draft bookings
      if (booking.status !== 'draft') {
        return res.status(403).json({
          success: false,
          message: "Only draft bookings can be deleted. Contact accounts team for assistance.",
        });
      }
    }

    // Accounts users can delete any booking (no restrictions)
    // Proceed with deletion
    const result = await BookingLogin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Booking login deleted successfully",
      data: {
        id: result._id,
        projectName: result.projectName,
        customer1Name: result.customer1Name,
      },
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete booking login",
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

const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    return getBookingLoginById(req, res);
  }

  if (req.method === "PATCH") {
    return updateBookingLogin(req, res);
  }

  if (req.method === "DELETE") {
    return deleteBookingLogin(req, res);
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default withAuth(handler);