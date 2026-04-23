import { Service } from "@framework";
import Leave from "../models/Leave";
import mongoose from "mongoose";
import TeamService from "./analytics/TeamService";

class LeaveService extends Service {
  constructor() {
    super();
    this.teamService = new TeamService();
  }

  // ================= HELPER =================
  getDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }

  // ================= APPLY LEAVE =================
  async createLeave(req, res) {
    try {
      const { leave_type, start_date, end_date, reason, handover_to } =
        req.body;

      if (!leave_type || !start_date || !end_date || !reason) {
        return res.status(400).json({
          success: false,
          message: "All required fields must be filled",
        });
      }

      const employeeId = req.employee?._id;

      if (!employeeId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const managerId = await this.teamService.getMyManager(employeeId);

      const leave = await Leave.create({
        leave_type,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        reason: reason.trim(),
        handover_to: handover_to || null,
        employeeId,
        assignedTo: managerId || null,
        duration: this.getDays(start_date, end_date),
        status: "pending",
      });

      return res.status(201).json({
        success: true,
        message: "Leave created",
        data: leave,
      });
    } catch (error) {
      console.error("Create Leave Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to apply leave",
      });
    }
  }

  // ================= GET LEAVES (SMART ROLE BASED) =================
  async getAllLeaves(req, res) {
    try {
      const userId = req.employee?._id;
      const role = req.employee?.role;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      let query = {};

      // ✅ Manager → team leaves
      if (role === "manager") {
        query.assignedTo = userId;
      } 
      // ✅ Employee → own leaves
      else {
        query.employeeId = userId;
      }

      const leaves = await Leave.find(query)
        .populate("employeeId", "name email")
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: leaves || [],
      });
    } catch (error) {
      console.error("Fetch Leave Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leaves",
      });
    }
  }

  // ================= UPDATE STATUS =================
async updateLeaveStatus(req, res) {
  try {
    const id = req.params?.id;
    const { status } = req.body;
    const managerId = req.employee?._id;
    const role = req.employee?.role;

    // 🔒 ONLY MANAGER CAN UPDATE
    if (role !== "manager") {
      return res.status(403).json({
        success: false,
        message: "Only manager can update leave status",
      });
    }

    // ✅ VALIDATE ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave ID",
      });
    }

    // ✅ VALIDATE STATUS
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave not found",
      });
    }

    // 🔒 MUST BELONG TO THIS MANAGER
    if (!leave.assignedTo || String(leave.assignedTo) !== String(managerId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this leave",
      });
    }

    // 🔒 MANAGER CANNOT APPROVE OWN LEAVE
    if (String(leave.employeeId) === String(managerId)) {
      return res.status(403).json({
        success: false,
        message: "You cannot approve your own leave",
      });
    }

    // ❌ PREVENT DOUBLE ACTION
    if (leave.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Leave already processed",
      });
    }

    // ✅ UPDATE
    leave.status = status;

    if (status === "approved") {
      leave.approvedBy = managerId;
      leave.rejectedBy = null;
      leave.approvedAt = new Date();
      leave.rejectedAt = null;
    } else {
      leave.rejectedBy = managerId;
      leave.approvedBy = null;
      leave.rejectedAt = new Date();
      leave.approvedAt = null;
    }

    await leave.save();

    return res.json({
      success: true,
      message: `Leave ${status} successfully`,
      data: leave,
    });
  } catch (error) {
    console.error("Update Leave Error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
}
}

export default LeaveService;