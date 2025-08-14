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
    const Employee = (await import('@/models/Employee')).default;
    const employee = await Employee.findById(loggedInUserId);
    if (!employee) {
      return res.status(400).json({ success: false, message: "Employee not found" });
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
      status: "pending",
      driver,
      vehicle,
      currentLocation,
      estimatedArrival,
      notes,
      managerId: employee.managerId,
    });

    await doc.save();

    // Send email notification to manager
    try {
      const manager = await Employee.findById(employee.managerId);
      if (manager && manager.email) {
        const mailer = (await import('@/lib/mailer')).mailer;
        await mailer({
          to: manager.email,
          subject: "Cab Booking Approval Request",
          html: `
            <p>Dear ${manager.name || "Manager"},</p>
            <p>You have a new cab booking request from <b>${employee.name}</b> that requires your approval.</p>
            <ul>
              <li><b>Project:</b> ${doc.project}</li>
              <li><b>Client Name:</b> ${doc.clientName}</li>
              <li><b>Pickup Point:</b> ${doc.pickupPoint}</li>
              <li><b>Drop Point:</b> ${doc.dropPoint}</li>
              <li><b>Date/Time:</b> ${doc.requestedDateTime}</li>
            </ul>
            <p>Please <a href="${process.env.APP_URL || "http://localhost:3000"}/dashboard/cab-booking">log in</a> to review and approve or reject this request.</p>
            <p>Thank you.</p>
          `,
        });
      }
    } catch (err) {
      // Optionally log error, but do not block
    }

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
  const isManager = req.isManager || (res.locals && res.locals.isManager);
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

    // Robust: managers see all bookings where managerId matches their user ID (as string), users see their own bookings
  let filter;
  if (isManager) {
      // Find all employees whose managerId matches the logged-in manager's _id
      const Employee = (await import('@/models/Employee')).default;
      const directReports = await Employee.find({ managerId: String(loggedInUserId) }).select('_id name managerId');
      const reportIds = directReports.map(e => String(e._id));
      // Include manager's own bookings as well
      filter = { cabBookedBy: { $in: [String(loggedInUserId), ...reportIds] } };
    } else {
      filter = { cabBookedBy: String(loggedInUserId) };
    }
    const [rows, total] = await Promise.all([
      CabBooking.find(filter)
        .skip(skip)
        .limit(itemsPerPage)
        .sort(sort),
      CabBooking.countDocuments(filter),
    ]);

    // Add canApprove property for each booking if the logged-in user is the manager for that booking
    let bookingsWithApproval = rows;
    if (isManager) {
      // Get all direct report IDs
      const Employee = (await import('@/models/Employee')).default;
      const directReports = await Employee.find({ managerId: String(loggedInUserId) }).select('_id');
      const reportIds = directReports.map(e => String(e._id));
      bookingsWithApproval = rows.map(b => ({
        ...b.toObject(),
        canApprove:
          String(b.managerId) === String(loggedInUserId) ||
          reportIds.includes(String(b.cabBookedBy)),
      }));
    } else {
      bookingsWithApproval = rows.map(b => ({ ...b.toObject(), canApprove: false }));
    }

    return res.status(200).json({
      success: true,
      data: bookingsWithApproval,
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