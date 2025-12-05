// pages/api/v0/booking-login/index.js
import dbConnect from "../../../../lib/mongodb";
import BookingLogin from "../../../../models/BookingLogin";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

const createBookingLogin = async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      createdBy: req.employee._id, // From auth middleware
    };

    const bookingLogin = new BookingLogin(bookingData);
    await bookingLogin.save();

    return res.status(201).json({
      success: true,
      message: "Booking login created successfully",
      data: bookingLogin,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create booking login",
      error: error.message,
    });
  }
};

const getAllBookingLogins = async (req, res) => {
  try {
    // Disable caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      projectName = "",
      teamHeadName = "",
    } = req.query;

    const currentPage = parseInt(page);
    const itemsPerPage = parseInt(limit);
    const skip = (currentPage - 1) * itemsPerPage;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { customer1Name: { $regex: search, $options: "i" } },
        { customer2Name: { $regex: search, $options: "i" } },
        { phoneNo: { $regex: search, $options: "i" } },
        { unitNo: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (projectName) {
      query.projectName = { $regex: projectName, $options: "i" };
    }

    if (teamHeadName) {
      query.teamHeadName = { $regex: teamHeadName, $options: "i" };
    }

    const [bookings, totalBookings] = await Promise.all([
      BookingLogin.find(query)
        .populate("createdBy", "name email employeeProfileId")
        .populate("approvedBy", "name email employeeProfileId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),
      BookingLogin.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        totalItems: totalBookings,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(totalBookings / itemsPerPage),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch booking logins",
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

  if (req.method === "POST") {
    return createBookingLogin(req, res);
  }

  if (req.method === "GET") {
    return getAllBookingLogins(req, res);
  }

  return res.status(405).json({
    success: false,
    message: "Method not allowed",
  });
};

export default withAuth(handler);