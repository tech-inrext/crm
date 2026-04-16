import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class LeaveIndexController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
 
  }
  
  async get(req, res) {
    return this.service.getAllLeaves(req, res);
  }

  async post(req, res) {
    return this.service.createLeave(req, res);
  }
}

export default new LeaveIndexController().handler;