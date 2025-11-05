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

    // Prevent updates if already approved/rejected
    if (booking.status === "approved" || booking.status === "rejected") {
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

    // Permanent deletion
    const result = await BookingLogin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Booking login permanently deleted",
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