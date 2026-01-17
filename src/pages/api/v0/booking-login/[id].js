import { Controller } from "@framework";
import BookingLoginService from "../../../../be/services/BookingLoginService";

class BookingLoginByIdController extends Controller {
  constructor() {
    super();
    this.service = new BookingLoginService();
  }

  async get(req, res) {
    return this.service.getBookingLoginById(req, res);
  }

  async patch(req, res) {
    return this.service.updateBookingLogin(req, res);
  }

  async delete(req, res) {
    return this.service.deleteBookingLogin(req, res);
  }
}

export default new BookingLoginByIdController().handler;