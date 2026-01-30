// /pages/api/v0/vendor-booking/index.js
import dbConnect from "../../../../lib/mongodb";
import VendorBooking from "../../../../be/models/VendorBooking";
import * as cookie from "cookie";
import { userAuth } from "../../../../be/middlewares/auth";

const createBooking = async (req, res) => {
  try {
    const {
      ownerName,
      driverName,
      startKm,
      endKm,
      pickupPoint,
      dropPoint,
      employeeName,
      teamHead,
    } = req.body;
    await dbConnect();
    const totalKm = Math.max(Number(endKm) - Number(startKm), 0);
    const booking = await VendorBooking.create({
      ownerName,
      driverName,
      startKm,
      endKm,
      totalKm,
      pickupPoint,
      dropPoint,
      employeeName,
      teamHead,
    });
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllBookings = async (req, res) => {
  try {
    await dbConnect();
    const bookings = await VendorBooking.find().sort("-createdAt");
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handler = async (req, res) => {
  if (req.method === "GET") {
    return getAllBookings(req, res);
  }
  if (req.method === "POST") {
    return createBooking(req, res);
  }
  return res.status(405).json({ success: false, message: "Method not allowed" });
};

export default userAuth(handler);
