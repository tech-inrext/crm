// /pages/api/v0/cab-vendor/index.js
import dbConnect from "../../../../lib/mongodb";
import CabVendor from "../../../../models/CabVendor";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";
import mongoose from "mongoose";

// ---------- helpers ----------
const isOID = (v) => mongoose.isValidObjectId(v);
const toNum = (v) => (v === undefined ? undefined : Number(v));

// ---------- CREATE ----------
const createVendorEntry = async (req, res) => {
  try {
    const loggedInUserId = req.employee?._id;

    const {
      cabOwnerName,
      driverName,
      projects, // array of Project _ids (or strings you store)
      teamHead, // User _id
      startKilometers,
      endKilometers,
      pickupPoint,
      dropPoint,
      employeeName,
    } = req.body;

    // Required check
    if (
      !cabOwnerName ||
      !driverName ||
      !Array.isArray(projects) ||
      projects.length === 0 ||
      !teamHead ||
      startKilometers === undefined ||
      endKilometers === undefined ||
      !pickupPoint ||
      !dropPoint ||
      !employeeName
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields (cabOwnerName, driverName, projects[], teamHead, startKilometers, endKilometers, pickupPoint, dropPoint, employeeName).",
      });
    }

    // Validate ObjectIds where applicable
    if (!isOID(teamHead)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid teamHead id" });
    }
    for (const pid of projects) {
      if (!isOID(pid)) {
        return res
          .status(400)
          .json({ success: false, message: `Invalid project id: ${pid}` });
      }
    }

    // Numeric sanity
    const startKm = Number(startKilometers);
    const endKm = Number(endKilometers);
    if (!Number.isFinite(startKm) || startKm < 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "startKilometers must be a non‑negative number",
        });
    }
    if (!Number.isFinite(endKm) || endKm < startKm) {
      return res
        .status(400)
        .json({
          success: false,
          message: "endKilometers must be >= startKilometers",
        });
    }

    const doc = new CabVendor({
      cabOwnerName: String(cabOwnerName).trim(),
      driverName: String(driverName).trim(),
      projects,
      teamHead,
      startKilometers: startKm,
      endKilometers: endKm,
      pickupPoint: String(pickupPoint).trim(),
      dropPoint: String(dropPoint).trim(),
      employeeName: String(employeeName).trim(),
      // NOTE: totalKilometers will be auto-computed by schema hooks
      // You could also set it explicitly:
      // totalKilometers: Math.max(0, endKm - startKm),
      createdBy: loggedInUserId, // (optional) add if you want to track creator; remove if not in schema
    });

    await doc.save();

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating cab vendor entry",
      error: error.message,
    });
  }
};

// ---------- GET ALL (pagination + filters + search) ----------
const getAllVendors = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "", // matches cabOwnerName/driverName/employeeName
      project, // filter by a single project id
      teamHead, // filter by teamHead id
      from, // createdAt >= from (ISO)
      to, // createdAt <= to (ISO)
      minKm, // totalKilometers >= minKm
      maxKm, // totalKilometers <= maxKm
      sortBy = "createdAt", // createdAt | totalKilometers | startKilometers | endKilometers
      sortOrder = "desc", // asc | desc
      populate = "true", // "true" to populate projects & teamHead
    } = req.query;

    const currentPage = parseInt(page, 10);
    const itemsPerPage = parseInt(limit, 10);
    const skip = (currentPage - 1) * itemsPerPage;

    const filter = {};

    // text search (case-insensitive)
    if (search) {
      filter.$or = [
        { cabOwnerName: { $regex: search, $options: "i" } },
        { driverName: { $regex: search, $options: "i" } },
        { employeeName: { $regex: search, $options: "i" } },
      ];
    }

    if (project && isOID(project)) filter.projects = { $in: [project] };
    if (teamHead && isOID(teamHead)) filter.teamHead = teamHead;

    // date range
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    // km range
    const min = toNum(minKm);
    const max = toNum(maxKm);
    if (min !== undefined || max !== undefined) {
      filter.totalKilometers = {};
      if (min !== undefined) filter.totalKilometers.$gte = min;
      if (max !== undefined) filter.totalKilometers.$lte = max;
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    let q = CabVendor.find(filter).skip(skip).limit(itemsPerPage).sort(sort);

    if (String(populate) === "true") {
      q = q.populate([
        { path: "projects", select: "name" },
        { path: "teamHead", select: "name email" },
      ]);
    }

    const [rows, total] = await Promise.all([
      q,
      CabVendor.countDocuments(filter),
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
      message: "Failed to fetch cab vendor entries",
      error: error.message,
    });
  }
};

// ---------- wrapper (same pattern as your leads/cab-booking) ----------
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

// ---------- main handler ----------
const handler = async (req, res) => {
  // Minimal env checks (add more if you email/queue later)
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({
      success: false,
      message: "Missing MONGODB_URI",
    });
  }

  try {
    await dbConnect();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Database connection error",
      error: err.message,
    });
  }

  if (req.method === "GET") return getAllVendors(req, res);
  if (req.method === "POST") return createVendorEntry(req, res);

  return res
    .status(405)
    .json({ success: false, message: "Method not allowed" });
};

export default withAuth(handler);
