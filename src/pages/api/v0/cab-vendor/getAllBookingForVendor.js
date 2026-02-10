import { Controller } from "@framework";
import CabVendorService from "../../../../be/services/CabVendorService";

class CabVendorController extends Controller {
  constructor() {
    super();
    this.service = new CabVendorService();
  }

  async get(req, res) {
    return this.service.getBookingsForLoggedInVendor(req, res);
  }
}

export default new CabVendorController().handler;
