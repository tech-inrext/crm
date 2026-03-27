import { Controller } from "@framework";
import NoticeService from "../../../../be/services/NoticeService";

class NoticeMetaController extends Controller {
  constructor() {
    super();
    this.service = new NoticeService();
  }

  async get(req, res) {
    return this.service.getNoticeMeta(req, res);
  }
}

export default new NoticeMetaController().handler;