// CabBookingController.js
import CabBooking from "../models/CabBooking";

import Vehicle from "../models/Vehicle";
 
import User from "../models/User";

 
import mongoose from "mongoose";

// Helper function to filter fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Create a new cab booking
exports.createBooking = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields
  const filteredBody = filterObj(
    req.body,
    "project",
    "clientName",
    "numberOfClients",
    "pickupPoint",
    "dropPoint",
    "employeeName",
    "requestedDateTime",
    "notes"
  );

  // 2) Add team leader (current user)
  filteredBody.teamLeader = req.user.id;

  // 3) Get managerId from Employee model
  const Employee = require("../models/Employee").default || require("../models/Employee");
  const employee = await Employee.findById(req.user.id);
  if (!employee) {
    return res.status(400).json({ status: "fail", message: "Employee not found" });
  }
  filteredBody.managerId = employee.managerId;
  filteredBody.cabBookedBy = req.user.id;
  filteredBody.status = "pending";

  // 4) Create booking
  const newBooking = await CabBooking.create(filteredBody);

  // 4) Populate response (remove project population)
  const booking = await CabBooking.findById(newBooking._id)
    .populate("teamLeader", "username email phoneNumber");

  res.status(201).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Get all bookings
exports.getAllBookings = catchAsync(async (req, res, next) => {
  // 1) Build query
  const filter = {};

  // For team heads, only show their own bookings
  if (req.user.role === "team_head") {
    filter.teamLeader = req.user.id;
  }

  // Filter by status if provided
  if (req.query.status) {
    filter.status = req.query.status;
  }

  // Date range filter
  if (req.query.startDate && req.query.endDate) {
    filter.requestedDateTime = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate),
    };
  }

  // 2) Execute query
  const bookings = await CabBooking.find(filter)
    .populate("project", "name location")
    .populate("teamLeader", "username email")
    .populate("driver", "username phoneNumber")
    .populate("vehicle", "registrationNumber model type")
    .sort("-requestedDateTime");

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

// Get a single booking
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await CabBooking.findById(req.params.id)
    .populate("project", "name location")
    .populate("teamLeader", "username email phoneNumber")
    .populate("driver", "username phoneNumber")
    .populate("vehicle", "registrationNumber model type capacity");

  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  // Authorization check
  if (
    req.user.role === "team_head" &&
    booking.teamLeader._id.toString() !== req.user.id
  ) {
    return next(
      new AppError("You are not authorized to view this booking", 403)
    );
  }

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Update booking status (for cab management)
exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  // 1) Check if booking exists
  const booking = await CabBooking.findById(req.params.id);
  if (!booking) {
    return next(new AppError("No booking found with that ID", 404));
  }

  // 2) Filter body
  const filteredBody = filterObj(
    req.body,
    "status",
    "driver",
    "vehicle",
    "notes"
  );

  // 3) Additional validation for driver and vehicle
  if (filteredBody.driver) {
    const driver = await User.findById(filteredBody.driver);
    if (!driver || driver.role !== "driver") {
      return next(new AppError("Invalid driver specified", 400));
    }
  }

  if (filteredBody.vehicle) {
    const vehicle = await Vehicle.findById(filteredBody.vehicle);
    if (!vehicle || !vehicle.isAvailable) {
      return next(
        new AppError("Invalid or unavailable vehicle specified", 400)
      );
    }
  }

  // 4) Update booking
  const updatedBooking = await CabBooking.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("project", "name location")
    .populate("teamLeader", "username email")
    .populate("driver", "username phoneNumber")
    .populate("vehicle", "registrationNumber model type");
  
    // Send email to cab booker if status changed to approved or rejected
    if (filteredBody.status && ["approved", "rejected"].includes(filteredBody.status)) {
      try {
        // Get cab booker details
        const Employee = require("../models/Employee").default || require("../models/Employee");
        const cabBooker = await Employee.findById(updatedBooking.cabBookedBy);
        if (cabBooker && cabBooker.email) {
          const { mailer } = require("../lib/mailer");
          const subject = `Cab Booking ${filteredBody.status.charAt(0).toUpperCase() + filteredBody.status.slice(1)}`;
          const html = `<p>Dear ${cabBooker.name},</p>
            <p>Your cab booking request for <b>${updatedBooking.project}</b> on <b>${new Date(updatedBooking.requestedDateTime).toLocaleString()}</b> has been <b>${filteredBody.status}</b> by the manager.</p>
            <p>Pickup: ${updatedBooking.pickupPoint}<br>Drop: ${updatedBooking.dropPoint}</p>
            <p>Status: <b>${filteredBody.status}</b></p>
            <p>Notes: ${updatedBooking.notes || "-"}</p>
            <p>Regards,<br>Cab Management Team</p>`;
          await mailer({ to: cabBooker.email, subject, html });
        }
      } catch (err) {
        console.error("Error sending cab booking status email:", err);
      }
    }

  res.status(200).json({
    status: "success",
    data: {
      booking: updatedBooking,
    },
  });
});

// Update tracking info (for drivers)
exports.updateTrackingInfo = catchAsync(async (req, res, next) => {
  // 1) Check if booking exists and is assigned to current driver
  const booking = await CabBooking.findOne({
    _id: req.params.id,
    driver: req.user.id,
  });

  if (!booking) {
    return next(
      new AppError("No booking found with that ID or not assigned to you", 404)
    );
  }

  // 2) Filter body
  const filteredBody = filterObj(
    req.body,
    "currentLocation",
    "estimatedArrival",
    "notes"
  );

  // 3) Update booking
  const updatedBooking = await CabBooking.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("project", "name location")
    .populate("teamLeader", "username email")
    .populate("driver", "username phoneNumber")
    .populate("vehicle", "registrationNumber model type");

  res.status(200).json({
    status: "success",
    data: {
      booking: updatedBooking,
    },
  });
});

// Cancel booking (for team leaders)
exports.cancelBooking = catchAsync(async (req, res, next) => {
  // 1) Check if booking exists and belongs to current user
  const booking = await CabBooking.findOne({
    _id: req.params.id,
    teamLeader: req.user.id,
  });

  if (!booking) {
    return next(
      new AppError("No booking found with that ID or not created by you", 404)
    );
  }

  // 2) Can only cancel pending or approved bookings
  if (!["pending", "approved"].includes(booking.status)) {
    return next(
      new AppError("Only pending or approved bookings can be cancelled", 400)
    );
  }

  // 3) Update booking
  booking.status = "cancelled";
  await booking.save();

  res.status(200).json({
    status: "success",
    data: {
      booking,
    },
  });
});

// Get available vehicles
exports.getAvailableVehicles = catchAsync(async (req, res, next) => {
  const vehicles = await Vehicle.find({
    isAvailable: true,
    status: "active",
  }).select("registrationNumber model type capacity");

  res.status(200).json({
    status: "success",
    results: vehicles.length,
    data: {
      vehicles,
    },
  });
});

