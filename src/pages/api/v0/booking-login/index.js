import { Controller } from "@framework";
import BookingLoginService from "../../../../be/services/BookingLoginService";

class BookingLoginIndexController extends Controller {
  constructor() {
    super();
    this.service = new BookingLoginService();
  }

  async get(req, res) {
    return this.service.getAllBookingLogins(req, res);
  }

  async post(req, res) {
    return this.service.createBookingLogin(req, res);
  }
}

export default new BookingLoginIndexController().handler;
