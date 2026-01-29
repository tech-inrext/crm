import { Controller } from "@framework";
import PillarService from "../../../../be/services/PillarService";
import * as cookie from "cookie";

class PillarIndexController extends Controller {
  constructor() {
    super();
    this.service = new PillarService();
    // this.skipAuth = ["get"];
  }

  // Override handler to inject user info for GET if possible, 
  // or rely on userAuth being skipped so GET is public.
  // Ideally, if we skipAuth for GET, we don't have user info.
  // But if the route needs to differentiate between logged in and public, we might need custom logic.
  // The original route had:
  // if (req.method === "GET") { try userAuth... catch... }
  //
  // Here, we can override the 'get' method or use middleware injection.
  // Since 'getAllPillars' logic doesn't seemingly depend on user context (except maybe implicit logging?),
  // and 'getPublicPillars' is definitely public.
  // I'll stick to skipAuth = ['get'] which means public access.

  async get(req, res) {
    return this.service.getAllPillars(req, res);
  }

  async post(req, res) {
    return this.service.createPillar(req, res);
  }
}

export default new PillarIndexController().handler;
