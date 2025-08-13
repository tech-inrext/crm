// /pages/api/v0/cab-booking/[id].js
import dbConnect from "../../../../lib/mongodb";
import CabBooking from "../../../../models/CabBooking";
import * as cookie from "cookie";
import { userAuth } from "../../../../middlewares/auth";

async function patchBooking(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  await dbConnect();
  const { id } = req.query;
  if (!id) return res.status(400).json({ success: false, message: "Missing booking id" });

  try {
    const booking = await CabBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    // Prevent edit if status is approved or rejected
    if (["approved", "rejected"].includes(booking.status)) {
      return res.status(403).json({ success: false, message: "Cannot edit booking after it is approved or rejected." });
    }
    const update = {};
    if (typeof req.body.status === "string") {
      update.status = req.body.status;
    }
    // Add more fields as needed
    const updated = await CabBooking.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

export default withAuth(patchBooking);
