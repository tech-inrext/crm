import { Controller } from "@framework";
import HolidayService from "@/be/services/HolidayService";

class HolidayByIdController extends Controller {
  constructor() {
    super();
    this.service = new HolidayService();
  }

  // ---------------- GET SINGLE ----------------
  async get(req, res) {
    return this.service.getHolidayById(req, res);
  }

  // ---------------- UPDATE ----------------
  async put(req, res) {
    return this.service.updateHoliday(req, res);
  }

  // ---------------- DELETE ----------------
  async delete(req, res) {
    return this.service.deleteHoliday(req, res);
  }
}

export default new HolidayByIdController().handler;