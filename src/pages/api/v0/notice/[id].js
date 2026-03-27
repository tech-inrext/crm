import { Controller } from "@framework";
import NoticeService from "../../../../be/services/NoticeService";

class NoticeByIdController extends Controller {
  constructor() {
    super();
    this.service = new NoticeService();
  }

  //  Get Notice by ID
  get(req, res) {
    return this.service.getNoticeById(req, res);
  }

  //  Update Notice
  put(req, res) {
    return this.service.updateNotice(req, res);
  }
}

export default new NoticeByIdController().handler;
