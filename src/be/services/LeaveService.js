import { Service } from "@framework";
import LeaveRequest from "../models/LeaveRequest";
import Employee from "../models/Employee";
import mongoose from "mongoose";

class LeaveService extends Service {
  constructor() {
    super();
  }

  // Create a new leave request
  async createLeaveRequest(req, res) {
    try {
      const { leaveType, startDate, endDate, daysRequested, reason, attachmentUrl } = req.body;
      const employeeId = req.employee?._id || req.user?._id;

      if (!employeeId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res.status(404).json({ success: false, message: "Employee not found" });
      }

      if (!employee.managerId) {
        return res.status(400).json({ success: false, message: "You don't have a manager assigned to approve this leave." });
      }

      // Quota validation
      const DEFAULT_QUOTAS = {
        "Casual Leave": 12,
        "Sick Leave": 12,
        "Earned Leave": 15,
        "Maternity Leave": 180,
        "Paternity Leave": 15,
        "Unpaid Leave": 0,
      };

      const requestedDays = Number(daysRequested) || 0;
      const maxQuota = DEFAULT_QUOTAS[leaveType];

      // Check quota limit if leave type has a quota limit (> 0)
      if (typeof maxQuota === "number" && maxQuota > 0) {
        const existingLeaves = await LeaveRequest.find({
          employeeId,
          leaveType,
          status: { $in: ["Approved", "Pending"] },
        }).lean();

        const usedDays = existingLeaves.reduce((sum, item) => sum + (Number(item.daysRequested) || 0), 0);
        const remainingDays = Math.max(0, maxQuota - usedDays);

        if (requestedDays > remainingDays) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${leaveType} balance. You have ${remainingDays} day(s) remaining (${usedDays}/${maxQuota} used or pending), but requested ${requestedDays} day(s).`,
          });
        }
      }

      const newLeave = new LeaveRequest({
        employeeId,
        managerId: employee.managerId,
        leaveType,
        startDate,
        endDate,
        daysRequested,
        reason,
        attachmentUrl,
        status: "Pending",
      });

      await newLeave.save();

      return res.status(201).json({ success: true, data: newLeave });
    } catch (error) {
      console.error("Create Leave Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get employee's own leave requests
  async getMyLeaves(req, res) {
    try {
      const employeeId = req.employee?._id || req.user?._id;
      if (!employeeId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const leaves = await LeaveRequest.find({ employeeId })
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ success: true, data: leaves });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get leaves pending manager's approval (where current user is the manager)
  async getManagerPendingLeaves(req, res) {
    try {
      const managerId = req.employee?._id || req.user?._id;
      if (!managerId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const leaves = await LeaveRequest.find({ managerId, status: "Pending" })
        .populate("employeeId", "name email phone photo employeeProfileId designation")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ success: true, data: leaves });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Manager action (Approve / Reject)
  async managerAction(req, res) {
    try {
      const currentUserId = (req.employee?._id || req.user?._id)?.toString();
      if (!currentUserId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { leaveId, status, managerRemarks } = req.body;
      if (!["Approved", "Rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      const leave = await LeaveRequest.findById(leaveId);
      if (!leave) {
        return res.status(404).json({ success: false, message: "Leave request not found" });
      }

      // Authorization check: must be assigned manager OR system admin
      const isManager = leave.managerId?.toString() === currentUserId;
      const isAdmin = req.isSystemAdmin || req.user?.isSystemAdmin;

      if (!isManager && !isAdmin) {
        return res.status(403).json({ success: false, message: "You are not authorized to take action on this leave request" });
      }

      if (leave.status !== "Pending") {
        return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
      }

      leave.status = status;
      if (managerRemarks) {
        leave.managerRemarks = managerRemarks;
      }
      
      await leave.save();

      return res.status(200).json({ success: true, data: leave });
    } catch (error) {
      console.error("Manager Action Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get leave quota and usage statistics for employee dashboard
  async getLeaveStats(req, res) {
    try {
      const employeeId = req.query.employeeId || req.employee?._id || req.user?._id;
      if (!employeeId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      // Default Annual Quotas per leave type
      const DEFAULT_QUOTAS = {
        "Casual Leave": 12,
        "Sick Leave": 12,
        "Earned Leave": 15,
        "Maternity Leave": 180,
        "Paternity Leave": 15,
        "Unpaid Leave": 0,
      };

      const leaves = await LeaveRequest.find({ employeeId }).lean();

      // Aggregate taken (Approved) and pending (Pending) days per leave type
      const usage = {};
      Object.keys(DEFAULT_QUOTAS).forEach((type) => {
        usage[type] = { taken: 0, pending: 0 };
      });

      let totalTaken = 0;
      let totalPending = 0;

      leaves.forEach((leave) => {
        const type = leave.leaveType;
        if (!usage[type]) {
          usage[type] = { taken: 0, pending: 0 };
        }

        const days = Number(leave.daysRequested) || 0;
        if (leave.status === "Approved") {
          usage[type].taken += days;
          totalTaken += days;
        } else if (leave.status === "Pending") {
          usage[type].pending += days;
          totalPending += days;
        }
      });

      // Calculate primary categories (Casual, Sick, Earned for standard total)
      const standardTotalAllocated = DEFAULT_QUOTAS["Casual Leave"] + DEFAULT_QUOTAS["Sick Leave"] + DEFAULT_QUOTAS["Earned Leave"]; // 39 days
      const standardTaken = usage["Casual Leave"].taken + usage["Sick Leave"].taken + usage["Earned Leave"].taken;
      const standardRemaining = Math.max(0, standardTotalAllocated - standardTaken);

      const breakdown = Object.keys(DEFAULT_QUOTAS).map((type) => {
        const quota = DEFAULT_QUOTAS[type];
        const taken = usage[type].taken;
        const pending = usage[type].pending;
        const remaining = type === "Unpaid Leave" ? 0 : Math.max(0, quota - taken);

        return {
          leaveType: type,
          quota,
          taken,
          pending,
          remaining,
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          summary: {
            totalAllocated: standardTotalAllocated,
            totalTaken,
            totalPending,
            totalRemaining: standardRemaining,
          },
          breakdown,
        },
      });
    } catch (error) {
      console.error("Get Leave Stats Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // HR / Admin: View all leaves
  async getAllLeaves(req, res) {
    try {
      const { page = 1, limit = 50, status, employeeId } = req.query;
      const skip = (page - 1) * limit;
      
      const query = {};
      if (status && status !== "ALL") {
        query.status = status;
      }
      if (employeeId) {
        query.employeeId = employeeId;
      }

      const leaves = await LeaveRequest.find(query)
        .populate("employeeId", "name email employeeProfileId photo designation")
        .populate("managerId", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean();
        
      const total = await LeaveRequest.countDocuments(query);

      return res.status(200).json({ 
        success: true, 
        data: leaves,
        pagination: {
          total,
          page: parseInt(page, 10),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

export default LeaveService;
