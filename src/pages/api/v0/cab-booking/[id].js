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

 
export default new CabBookingByIdController().handler;
 