import { Controller } from "@framework";
import CabBookingService from "../../../../be/services/CabBookingService";

class CabBookingByIdController extends Controller {
  constructor() {
    super();
    this.service = new CabBookingService();
  }

  async get(req, res) {
    return this.service.getBookingById(req, res);
  }

  async patch(req, res) {
    return this.service.patchBooking(req, res);
  }
}

<<<<<<< HEAD
function withAuth(handler) {
  return async (req, res) => {
    const parsedCookies = cookie.parse(req.headers.cookie || "");
    req.cookies = parsedCookies;
    await userAuth(req, res, () => handler(req, res));
  };
}

async function handler(req, res) {
  await dbConnect();
  const { id } = req.query;

  if (req.method === "GET") {
    try {
      const booking = await CabBooking.findById(id)
        .populate("cabBookedBy", "name email phone")
        .populate("managerId", "name email")
        .populate("vendor", "name email phone")
        .lean();
      
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      
      return res.status(200).json({ success: true, data: booking });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  if (req.method === "PATCH") {
    return patchBooking(req, res);
  }

  return res.status(405).json({ success: false, message: "Method not allowed" });
}

export default withAuth(handler);
=======
export default new CabBookingByIdController().handler;
>>>>>>> b2a0ab50945edf2ee552121946fe43258068b2aa
