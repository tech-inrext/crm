import { Controller } from "@framework";
import PropertyService from "@/be/services/PropertyService";
import * as cookie from "cookie";
import { userAuth } from "../../../../../middlewares/auth";

class PropertyIndexController extends Controller {
  constructor() {
    super();
    this.service = new PropertyService();
    this.skipAuth = ["get"];
  }

  async get(req, res) {


  console.log("Inside public property index controller");
  return this.service.getPublicProperties(req, res);
}


  // async post(req, res) {
  //   return this.service.createProperty(req, res);
  // }
}

export default new PropertyIndexController().handler;
