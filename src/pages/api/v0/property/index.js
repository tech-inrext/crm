import { Controller } from "@framework";
import PropertyService from "../../../../be/services/PropertyService";

class PropertyIndexController extends Controller {
  constructor() {
    super();
    this.service = new PropertyService();
  }

  async get(req, res) {
    // Public properties listing
    if (req.query.isPublic === "true") {
      return this.service.getPublicProperties(req, res);
    }
    
    // Public sub-properties
    if (req.query.parentId && req.query.action === 'subproperties') {
      if (req.query.publicView === "true") {
        return this.service.getPublicSubProperties(req, res);
      }
      return this.service.getSubProperties(req, res);
    }

    // Default: get all properties with filtering
    return this.service.getAllProperties(req, res);
  }

  async post(req, res) {
    return this.service.createProperty(req, res);
  }
}

export default new PropertyIndexController().handler;
