// /pages/api/v0/cab-booking/index.js
import dbConnect from "../../../../lib/mongodb";
import CabBooking from "../../../../models/CabBooking";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import Project from "@/models/Project";
import mongoose from "mongoose";
import { sendCabBookingApprovalEmail } from "@/lib/cabBookingApproval";

// ✅ Create Booking
const createBooking = async (req, res) => {
  try {
    const {
      cabBookedBy,
      project, // (String or Project _id as string)
      clientName,
      numberOfClients,
      pickupPoint,
      dropPoint,
      employeeName, // optional
      teamLeader, // User _id (required)
      requestedDateTime, // ISO string/date
      status, // optional: pending/approved/rejected/completed/cancelled
      driver, // optional: User _id
      vehicle, // optional: Vehicle _id
      currentLocation, // optional
      estimatedArrival, // optional (string)
      notes, // optional
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
    const Employee = (await import("@/models/Employee")).default;
    const employee = await Employee.findById(loggedInUserId);
    if (!employee) {
      return res
        .status(400)
        .json({ success: false, message: "Employee not found" });
    }

    const managerObjectId = mongoose.isValidObjectId(employee.managerId)
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

    // Send email notification to manager
    try {
      const manager = await Employee.findById(employee.managerId);
      await sendCabBookingApprovalEmail({ manager, employee, booking: doc });
    } catch (err) {
      // Optionally log; don't block the request
      // console.error("Email send failed:", err);
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

// ✅ Get All Bookings (pagination + status filter)
const getAllBookings = async (req, res) => {
  const isManager = req.isManager || (res.locals && res.locals.isManager);

  // Allow exactly these statuses
  const ALLOWED_STATUSES = [
    "pending",
    "approved",
    "rejected",
    "active",
    "completed",
    "cancelled",
  ];

  try {
    const {
      page = 1,
      limit = 10,
      status, // optional: "pending" or CSV "pending,approved"
      sortBy = "createdAt", // createdAt | requestedDateTime | status
      sortOrder = "desc", // asc | desc
    } = req.query;

    const currentPage = Math.max(1, parseInt(page, 10));
    const itemsPerPage = Math.max(1, parseInt(limit, 10));
    const skip = (currentPage - 1) * itemsPerPage;
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const loggedInUserId = req.employee?._id;

    // ----- visibility: managers see theirs + direct reports; others see only theirs
    let visibilityFilter;
    let reportIds = [];
    if (isManager) {
      const Employee = (await import("@/models/Employee")).default;
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

    // ----- status filter (optional; ignore if "all" or empty)
    let statusFilter = {};
    if (typeof status !== "undefined" && String(status).trim() !== "") {
      const list = (Array.isArray(status) ? status : String(status).split(","))
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

      // if client sends "all", ignore filter
      const filteredList = list.filter((s) => s !== "all");
      const invalid = filteredList.filter((s) => !ALLOWED_STATUSES.includes(s));
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
          model: "User",
          select: "username phoneNumber",
        })
        .populate({
          path: "vehicle",
          model: "Vehicle",
          select: "model registrationNumber type capacity",
        }),
      CabBooking.countDocuments(mainFilter),
    ]);

    // add canApprove + managerName like your current code
    let data;
    if (isManager) {
      data = rows.map((b) => {
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
      data = rows.map((b) => {
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
        currentPage,
        itemsPerPage,
        totalPages: Math.ceil(total / itemsPerPage),
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
};

// ✅ Same lightweight wrapper pattern you used for leads
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    // Ensure userAuth is awaited and we await the downstream handler as well.
    return await userAuth(req, res, async () => {
      // call the handler and return its result so the wrapper doesn't finish
      // before the handler sends a response.
      return await handler(req, res);
    });
  };
}

// ✅ Main Handler

const handler = async (req, res) => {
  // Defensive ENV checks
  const missingVars = [];
  if (!process.env.MONGODB_URI) missingVars.push("MONGODB_URI");
  if (!process.env.SMTP_EMAIL) missingVars.push("SMTP_EMAIL");
  if (!process.env.SMTP_PASS) missingVars.push("SMTP_PASS");
  if (!process.env.EMAIL_FROM) missingVars.push("EMAIL_FROM");
  if (missingVars.length) {
    console.error(
      "Missing required environment variables:",
      missingVars.join(", ")
    );
    return res.status(500).json({
      success: false,
      message: `Missing required environment variables: ${missingVars.join(
        ", "
      )}`,
      error:
        "Environment misconfiguration. Please set these variables in Vercel.",
    });
  }

  try {
    await dbConnect();
  } catch (err) {
    console.error("Database connection error:", err);
    return res.status(500).json({
      success: false,
      message: "Database connection error",
      error: err.message,
    });
  }

  //it ends here

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
