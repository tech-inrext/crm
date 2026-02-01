import { Controller } from "@framework";
import PropertyService from "../../../../be/services/PropertyService";

class PropertyByIdController extends Controller {
  constructor() {
    super();
    this.service = new PropertyService();
  }

  async get(req, res) {
    // Public single property
    if (req.query.publicView === "true") {
      return this.service.getPublicPropertyById(req, res);
    }

    // Default: get property by ID
    return this.service.getPropertyById(req, res);
  }

  async patch(req, res) {
    return this.service.updateProperty(req, res);
  }

  async delete(req, res) {
    return this.service.deleteProperty(req, res);
  }
}

export default new PropertyByIdController().handler;

