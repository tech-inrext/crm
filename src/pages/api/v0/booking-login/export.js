import { Controller } from "@framework";
import BookingLoginService from "../../../../be/services/BookingLoginService";

class BookingLoginExportController extends Controller {
  constructor() {
    super();
    this.service = new BookingLoginService();
  }

  async get(req, res) {
    return this.service.exportBookingsToExcel(req, res);
  }
}

export default new BookingLoginExportController().handler;