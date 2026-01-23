import { Controller } from "@framework";
import PropertyService from "@/be/services/PropertyService";
import * as cookie from "cookie";
import { userAuth } from "../../../../../../middlewares/auth";

class PropertyByIdController extends Controller {
  constructor() {
    super();
    this.service = new PropertyService();
    
    // Skip framework's default authn for GET
    this.skipAuth = ["get"];
  }

 async get(req, res) {
 

  console.log("Inside public property index controller");
  return this.service.getPublicProperties(req, res);
}
}

export default new PropertyByIdController().handler;