import { Controller } from "@framework";
import CabBookingService from "../../../../be/services/CabBookingService";

class CabBookingIndexController extends Controller {
  constructor() {
    super();
    this.service = new CabBookingService();
  }

  async get(req, res) {
    return this.service.getAllBookings(req, res);
  }

  async post(req, res) {
    return this.service.createBooking(req, res);
  }
}

export default new CabBookingIndexController().handler;
