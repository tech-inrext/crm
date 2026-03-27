import { Controller } from "@framework";
import NoticeService from "../../../../be/services/NoticeService";

class NoticeIndexController extends Controller {
  constructor() {
    super();
    this.service = new NoticeService();
  }

  async get(req, res) {
    return this.service.getAllNotices(req, res);
  }

  async post(req, res) {
    return this.service.createNotice(req, res);
  }
}

export default new NoticeIndexController().handler;
