import { Controller } from "@framework";
import BookingLoginService from "../../../../be/services/BookingLoginService";

class BookingLoginStatusController extends Controller {
  constructor() {
    super();
    this.service = new BookingLoginService();
  }

  async patch(req, res) {
    return this.service.updateBookingStatus(req, res);
  }
}

export default new BookingLoginStatusController().handler;
