// /pages/api/v0/cab-booking/index.js
import dbConnect from "../../../../lib/mongodb";
import CabBooking from "../../../../models/CabBooking";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import Project from "@/models/Project";
import mongoose from "mongoose";

// ✅ Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      cabBookedBy,
      project,              // (String or Project _id as string)
      clientName,
      numberOfClients,
      pickupPoint,
      dropPoint,
      employeeName,        // optional
      teamLeader,          // User _id (required)
      requestedDateTime,   // ISO string/date
      status,              // optional: pending/approved/rejected/completed/cancelled
      driver,              // optional: User _id
      vehicle,             // optional: Vehicle _id
      currentLocation,     // optional
      estimatedArrival,    // optional (string)
      notes,               // optional
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
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: project, clientName, numberOfClients, pickupPoint, dropPoint, teamLeader, requestedDateTime",
      });
    }

    // numberOfClients minimum
    if (Number(numberOfClients) < 1) {
      return res.status(400).json({
        success: false,
        message: "numberOfClients must be at least 1",
      });
    }

    // Validate ObjectIds where applicable
    const idsToValidate = [
      // ["teamLeader", teamLeader],
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
      status, // defaults to "pending" if not provided
      driver,
      vehicle,
      currentLocation,
      estimatedArrival,
      notes,
    });

    await doc.save();

    // populate common refs for immediate UI use
    // await doc.populate([
    //   { path: "teamLeaderDetails", select: "name email phone" },
    //   { path: "driverDetails", select: "name email phone" },
    //   { path: "projectDetails", select: "name code" },
    // ]);

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// ✅ Get All Bookings (pagination + search + filters)
const getAllBookings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,           // optional filter
      // teamLeader,       // optional User _id
      driver,           // optional User _id
      from,             // optional ISO date (requestedDateTime >= from)
      to,               // optional ISO date (requestedDateTime <= to)
      sortBy = "createdAt",   // createdAt | requestedDateTime | status
      sortOrder = "desc",     // asc | desc
    } = req.query;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;


    // Remove all filters: always return all bookings
    const sort = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const loggedInUserId = req.employee?._id;

    const [rows, total] = await Promise.all([
      CabBooking.find({ cabBookedBy: loggedInUserId })
        .skip(skip)
        .limit(itemsPerPage)
        .sort(sort),
      CabBooking.countDocuments({ cabBookedBy: loggedInUserId }),
    ]);

    return res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        totalItems: total,
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(total / itemsPerPage),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

// ✅ Same lightweight wrapper pattern you used for leads
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res)); // no explicit checks
  };
}

// ✅ Main Handler
const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") {
    return getAllBookings(req, res);
  }

  if (req.method === "POST") {
    return createBooking(req, res);
  }

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);