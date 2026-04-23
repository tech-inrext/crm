import { Controller } from "@framework";
import LeaveService from "../../../../be/services/LeaveService";

class LeaveIndexController extends Controller {
  constructor() {
    super();
    this.service = new LeaveService();
  }

  // ================= EMPLOYEE LEAVES =================
  async get(req, res) {
    return this.service.getAllLeaves(req, res);
  }

  async post(req, res) {
    return this.service.createLeave(req, res);
  }

  // ================= MANAGER LEAVES =================
  async getManager(req, res) {
    return this.service.getManagerLeaves(req, res);
  }
}

export default new LeaveIndexController().handler;