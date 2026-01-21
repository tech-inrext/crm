import { Controller } from "@framework";
import PropertyService from "@/be/services/PropertyService";
import * as cookie from "cookie";
import { userAuth } from "../../../../../../middlewares/auth";

class PropertyByIdController extends Controller {
  constructor() {
    super();
    this.service = new PropertyService();

    // ✅ Public access
    this.skipAuth = ["get"];
  }

  async get(req, res) {
    console.log("Inside public property by id controller");

    /**
     * 🔓 PUBLIC SUB-PROPERTIES
     * Example:
     * /api/v0/public/property?id=123&publicSub=true
     */
    if (req.query.publicSub === "true") {
      return this.service.getPublicSubProperties(req, res);
    }

    /**
     * 🔓 PUBLIC SINGLE PROPERTY (Parent Project)
     * Example:
     * /api/v0/public/property/some-slug
     */
    return this.service.getPublicPropertyById(req, res);
  }
}

export default new PropertyByIdController().handler;
