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
  console.log('[cab-booking PATCH] id', id, 'body', req.body);
  const booking = await CabBooking.findById(id);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
    // Prevent edit only if status is rejected or completed
    if (["rejected", "completed"].includes(booking.status)) {
      return res.status(403).json({ success: false, message: "Cannot edit booking after it is rejected or completed." });
    }
    const update = {};
    if (typeof req.body.status === "string") {
      update.status = req.body.status;
    }
    if (req.body.vendor) {
      update.vendor = req.body.vendor;
    }
    if (typeof req.body.cabOwner === "string") update.cabOwner = req.body.cabOwner;
    if (typeof req.body.driverName === "string") update.driverName = req.body.driverName;
    if (typeof req.body.aadharNumber === "string") update.aadharNumber = req.body.aadharNumber;
    if (typeof req.body.dlNumber === "string") update.dlNumber = req.body.dlNumber;
  const updated = await CabBooking.findByIdAndUpdate(id, update, { new: true });
    console.log('[cab-booking PATCH] updated', updated && updated._id);
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
