// /pages/api/v0/cab-vendor/index.js
import dbConnect from "../../../../lib/mongodb";
import CabVendor from "../../../../be/models/CabVendor";
import Employee from "../../../../be/models/Employee"; // to verify refs
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

// ✅ Create CabVendor (WRITE)
const createCabVendor = async (req, res) => {
  try {
    const {
      cabOwnerName,
      driverName,
      startKilometers,
      endKilometers,
      pickupPoint,
      dropPoint,
      bookedBy, // Employee _id (required)
      approvedBy, // Employee _id (optional)
    } = req.body;

    // 🔎 Required fields
    if (
      !cabOwnerName ||
      !driverName ||
      startKilometers === undefined ||
      endKilometers === undefined ||
      !pickupPoint ||
      !dropPoint ||
      !bookedBy
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    // 🧭 Number sanity
    const startKm = Number(startKilometers);
    const endKm = Number(endKilometers);
    if (Number.isNaN(startKm) || Number.isNaN(endKm)) {
      return res
        .status(400)
        .json({ success: false, message: "Kilometer fields must be numbers" });
    }
    if (startKm < 0 || endKm < 0) {
      return res
        .status(400)
        .json({ success: false, message: "Kilometers cannot be negative" });
    }
    if (endKm < startKm) {
      return res.status(400).json({
        success: false,
        message:
          "End Kilometers must be greater than or equal to Start Kilometers",
      });
    }

    // ✅ Validate references
    const bookedExists = await Employee.exists({ _id: bookedBy });
    if (!bookedExists) {
      return res
        .status(404)
        .json({ success: false, message: "Booked By (Employee) not found" });
    }
    if (approvedBy) {
      const approvedExists = await Employee.exists({ _id: approvedBy });
      if (!approvedExists) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Approved By (Employee) not found",
          });
      }
    }

    // ✅ Create (totalKilometers derived via schema hook)
    const doc = new CabVendor({
      cabOwnerName: String(cabOwnerName).trim(),
      driverName: String(driverName).trim(),
      startKilometers: startKm,
      endKilometers: endKm,
      pickupPoint: String(pickupPoint).trim(),
      dropPoint: String(dropPoint).trim(),
      bookedBy,
      approvedBy: approvedBy || null,
    });

    await doc.save();

    const saved = await CabVendor.findById(doc._id)
      .populate({ path: "bookedBy", select: "name email phone designation" })
      .populate({ path: "approvedBy", select: "name email phone designation" });

    return res.status(201).json({ success: true, data: saved });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Error creating CabVendor",
        error: error.message,
      });
  }
};

// ✅ List CabVendors (GET) with pagination, search, filters
const getAllCabVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      bookedBy, // optional filter by Employee _id
      approvedBy, // optional filter by Employee _id
      dateFrom, // optional ISO
      dateTo, // optional ISO
      sortBy = "createdAt", // createdAt | startKilometers | endKilometers | totalKilometers
      sortOrder = "desc", // asc | desc
    } = req.query;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;

    const orSearch = search
      ? [
          { cabOwnerName: { $regex: search, $options: "i" } },
          { driverName: { $regex: search, $options: "i" } },
          { pickupPoint: { $regex: search, $options: "i" } },
          { dropPoint: { $regex: search, $options: "i" } },
        ]
      : [];

    const query = {};
    if (orSearch.length) query.$or = orSearch;
    if (bookedBy) query.bookedBy = bookedBy;
    if (approvedBy) query.approvedBy = approvedBy;

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        query.createdAt.$lte = to;
      }
    }

    const sort = { [sortBy]: sortOrder.toLowerCase() === "asc" ? 1 : -1 };

    const [rows, total] = await Promise.all([
      CabVendor.find(query)
        .skip(skip)
        .limit(itemsPerPage)
        .sort(sort)
        .populate({ path: "bookedBy", select: "name email phone designation" })
        .populate({
          path: "approvedBy",
          select: "name email phone designation",
        }),
      CabVendor.countDocuments(query),
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
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch CabVendors",
        error: error.message,
      });
  }
};

// ✅ withAuth wrapper (same as Employee API)
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ✅ Main handler
const handler = async (req, res) => {
  await dbConnect();

  if (req.method === "GET") return getAllCabVendors(req, res);
  if (req.method === "POST") return createCabVendor(req, res);

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
