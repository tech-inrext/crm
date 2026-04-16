import { Service } from "@framework";
import Leave from "../models/Leave";
import mongoose from "mongoose";

class LeaveService extends Service {
  constructor() {
    super();
  }

  // ================= HELPER =================
  getDays(start, end) {
    const s = new Date(start);
    const e = new Date(end);

    return Math.ceil(
      (e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;
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
          message: "Unauthorized: employee not found",
        });
      }

      const newLeave = new Leave({
        leave_type,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        reason: reason.trim(),
        handover_to: handover_to || null,

        employeeId,

        duration: this.getDays(start_date, end_date),

        status: "pending",
      });

      await newLeave.save();

      return res.status(201).json({
        success: true,
        message: "Leave applied successfully",
        data: newLeave,
      });
    } catch (error) {
      console.error("Apply Leave Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to apply leave",
        error: error.message,
      });
    }
  }

  // ================= GET LEAVES =================
  async getLeave(req, res) {
    try {
      const employeeId = req.employee?._id;

      const leaves = await Leave.find({ employeeId })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        data: leaves,
      });
    } catch (error) {
      console.error("Fetch Leave Error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch leaves",
        error: error.message,
      });
    }
  }

  // ================= APPROVE =================
  async approveLeave(req, res) {
    try {
      const id = req.params?.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave ID",
        });
      }

      const updated = await Leave.findByIdAndUpdate(
        id,
        {
          status: "approved",
          approvedBy: req.employee?._id || null,
          approvedAt: new Date(),
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Leave approved",
        data: updated,
      });
    } catch (error) {
      console.error("Approve Error:", error);
      return res.status(500).json({
        success: false,
        message: "Approval failed",
        error: error.message,
      });
    }
  }

  // ================= REJECT =================
  async rejectLeave(req, res) {
    try {
      const id = req.params?.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid leave ID",
        });
      }

      const updated = await Leave.findByIdAndUpdate(
        id,
        {
          status: "rejected",
          rejectedBy: req.employee?._id || null,
          rejectedAt: new Date(),
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Leave rejected",
        data: updated,
      });
    } catch (error) {
      console.error("Reject Error:", error);
      return res.status(500).json({
        success: false,
        message: "Rejection failed",
        error: error.message,
      });
    }
  }
}

export default LeaveService;