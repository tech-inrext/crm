import { Controller } from "@framework";
import PropertyService from "../../../../../../be/services/PropertyService";

class PropertyByIdController extends Controller {
  constructor() {
    super();
    this.service = new PropertyService();

    // Skip framework's default authn for GET
    this.skipAuth = ["get"];
  }
  async get(req, res) {
    console.log("Inside public property by id controller");

    return this.service.getPublicPropertyById(req, res);
  }
}

export default new PropertyByIdController().handler;