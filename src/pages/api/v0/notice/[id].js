import { Controller } from "@framework";
import NoticeService from "../../../../be/services/NoticeService";
class NoticeByIdController extends Controller {
  constructor() {
    super();
    this.service = new NoticeService();
  }

  // GET
  get(req, res) {
    return this.service.getNoticeById(req, res);
  }

  // UPDATE
  put(req, res) {
    return this.service.updateNotice(req, res);
  }

  // DELETE
  delete(req, res) {
    return this.service.deleteNotice(req, res);
  }
}

export default new NoticeByIdController().handler;