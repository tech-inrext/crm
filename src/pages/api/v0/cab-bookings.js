import dbConnect from "@/lib/mongodb";
import CabBooking from "@/models/CabBooking";
import { userAuth } from "@/middlewares/auth";
import * as cookie from "cookie";

export default async function handler(req, res) {
  await dbConnect();

  // Parse cookies for auth
  const parsedCookies = cookie.parse(req.headers.cookie || "");
  req.cookies = parsedCookies;

  // Authenticate
  await new Promise((resolve) => userAuth(req, res, resolve));

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  // ✅ Permission check — using the same name as Role model
  if (req.method === "GET") {
    if (!req.user.role?.read?.includes("cab-booking")) {
      return res.status(403).json({
        success: false,
        message: "Access denied: No READ access to cab-booking",
      });
    }

    try {
      const bookings = await CabBooking.find();
      return res.status(200).json({ success: true, data: bookings });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  if (req.method === "POST") {
    if (!req.user.role?.write?.includes("cab-booking")) {
      return res.status(403).json({
        success: false,
        message: "Access denied: No WRITE access to cab-booking",
      });
    }

    try {
      const booking = await CabBooking.create(req.body);
      return res.status(201).json({ success: true, data: booking });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}
