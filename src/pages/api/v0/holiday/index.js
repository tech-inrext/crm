import { Controller } from "@framework";
import HolidayService from "@/be/services/holidayService";

class HolidayIndexController extends Controller {
  constructor() {
    super();
    this.service = new HolidayService();
  }

  // ---------------- GET ALL HOLIDAYS ----------------
  async get(req, res) {
    return this.service.getAllHolidays(req, res);
  }

  // ---------------- CREATE HOLIDAY ----------------
  async post(req, res) {
    return this.service.createHoliday(req, res);
  }
}

export default new HolidayIndexController().handler;