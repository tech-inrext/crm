import { Service } from "@framework";
import LeaveRequest from "../models/LeaveRequest";
import Employee from "../models/Employee";
import mongoose from "mongoose";
import { format } from "date-fns";
import { sendLeaveRequestToManager } from "../whatsapp-msg-service/leave-notifications/leaveRequestNotify.js";
import { sendLeaveStatusToEmployee } from "../whatsapp-msg-service/leave-notifications/leaveStatusNotify.js";

// Helper to get Financial Year Start and End dates (April 1 to March 31)
function getFinancialYearBounds(currentDate = new Date()) {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-indexed (1 to 12)

  let fyStartYear, fyEndYear;
  if (currentMonth >= 4) {
    fyStartYear = currentYear;
    fyEndYear = currentYear + 1;
  } else {
    fyStartYear = currentYear - 1;
    fyEndYear = currentYear;
  }

  const fyStartDate = new Date(fyStartYear, 3, 1, 0, 0, 0, 0); // April 1st
  const fyEndDate = new Date(fyEndYear, 2, 31, 23, 59, 59, 999); // March 31st

  return { fyStartDate, fyEndDate, fyStartYear, fyEndYear };
}

// Helper to calculate monthly accrued quotas for current Financial Year (April - March) based on Date of Joining
function calculateAccruedQuotas(employeeJoiningDate, currentDate = new Date()) {
  const round2 = (val) => Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;
  const { fyStartDate, fyEndDate } = getFinancialYearBounds(currentDate);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Month index within Financial Year (April = 1, May = 2, ..., Dec = 9, Jan = 10, Feb = 11, March = 12)
  const getFYMonthIndex = (m) => (m >= 4 ? m - 4 + 1 : m + 9);

  let currentFYMonthIndex = getFYMonthIndex(currentMonth);
  let startFYMonthIndex = 1; // Default: April

  if (employeeJoiningDate) {
    const doj = new Date(employeeJoiningDate);
    if (!isNaN(doj.getTime())) {
      if (doj >= fyStartDate && doj <= fyEndDate) {
        startFYMonthIndex = getFYMonthIndex(doj.getMonth() + 1);
      }
    }
  }

  // Months elapsed in current Financial Year for this employee
  let monthsInFY = Math.max(1, currentFYMonthIndex - startFYMonthIndex + 1);
  monthsInFY = Math.min(12, Math.max(1, monthsInFY));

  // Monthly Accrual Rates according to official Company Leave Policy
  const MONTHLY_RATES = {
    "Casual Leave": { rate: 0.85, max: 10.2 },
    "Sick Leave": { rate: 1.0, max: 12.0 },
    "Earned Leave": { rate: 1.0, max: 12.0 },
    "Women's Monthly Wellness Leave": { rate: 1.0, max: 12.0 },
  };

  const FIXED_QUOTAS = {
    "Maternity Leave": 182,
    "Paternity Leave": 15,
    "Bereavement Leave": 4,
    "Compensatory Leave (Comp-Off)": 0,
    "Loss Of Pay (LOP / LWP)": 0,
    "Sabbatical Leave": 0,
    "Unpaid Leave": 0,
  };

  const quotas = {};

  Object.keys(MONTHLY_RATES).forEach((type) => {
    const { rate, max } = MONTHLY_RATES[type];
    quotas[type] = round2(Math.min(max, monthsInFY * rate));
  });

  Object.keys(FIXED_QUOTAS).forEach((type) => {
    quotas[type] = FIXED_QUOTAS[type];
  });

  return { quotas, monthsInFY, fyStartDate, fyEndDate };
}

// Helper function to calculate working days between two dates, excluding Sundays
function calculateWorkingDaysExcludingSundays(startDateStr, endDateStr, isHalfDay, halfDayOption) {
  if (!startDateStr || !endDateStr) return 0;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  const isSingleDay = start.getFullYear() === end.getFullYear() &&
                      start.getMonth() === end.getMonth() &&
                      start.getDate() === end.getDate();

  if (isSingleDay) {
    if (start.getDay() === 0) return 0; // Sunday (Weekly Off)
    return isHalfDay ? 0.5 : 1.0;
  }

  let total = 0;
  const curr = new Date(start);
  while (curr <= end) {
    if (curr.getDay() !== 0) { // Exclude Sunday (getDay() === 0)
      let dayWeight = 1.0;
      const isStart = curr.getTime() === start.getTime();
      const isEnd = curr.getTime() === end.getTime();

      if (isStart && isHalfDay && (halfDayOption?.includes("Start Date") || halfDayOption?.includes("2nd Half"))) {
        dayWeight = 0.5;
      } else if (isEnd && isHalfDay && (halfDayOption?.includes("End Date") || halfDayOption?.includes("1st Half"))) {
        dayWeight = 0.5;
      }
      total += dayWeight;
    }
    curr.setDate(curr.getDate() + 1);
  }
  return total;
}

class LeaveService extends Service {
  constructor() {
    super();
  }

  // Create a new leave request
  async createLeaveRequest(req, res) {
    try {
      const { leaveType, startDate, endDate, daysRequested, reason, attachmentUrl, documentUrl, isHalfDay, halfDayOption } = req.body;
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

      // Calculate working days excluding Sundays
      const calculatedDays = calculateWorkingDaysExcludingSundays(startDate, endDate, isHalfDay, halfDayOption);
      const requestedDays = calculatedDays > 0 ? calculatedDays : Number(daysRequested) || 0;

      if (requestedDays <= 0) {
        return res.status(400).json({
          success: false,
          message: "Selected date range only contains Sunday (Weekly Off). 0 leave days needed.",
        });
      }

      // Quota validation according to official Company Leave Policy (Financial Year April-March Monthly Accrual)
      const now = new Date();
      const { quotas, monthsInFY, fyStartDate, fyEndDate } = calculateAccruedQuotas(employee.joiningDate, now);
      const maxQuota = quotas[leaveType];

      // Check quota limit if leave type has a quota limit (> 0)
      if (typeof maxQuota === "number" && maxQuota > 0) {
        const existingLeaves = await LeaveRequest.find({
          employeeId,
          leaveType,
          status: { $in: ["Approved", "Pending"] },
          startDate: { $gte: fyStartDate, $lte: fyEndDate },
        }).lean();

        const usedDays = Math.round((existingLeaves.reduce((sum, item) => sum + (Number(item.daysRequested) || 0), 0) + Number.EPSILON) * 100) / 100;
        const remainingDays = Math.max(0, Math.round((maxQuota - usedDays + Number.EPSILON) * 100) / 100);

        if (requestedDays > remainingDays) {
          return res.status(400).json({
            success: false,
            message: `Insufficient ${leaveType} balance. Accrued to date in FY: ${maxQuota} day(s) (${monthsInFY} month(s) elapsed in April-March cycle), Used/Pending: ${usedDays} day(s), Remaining available: ${remainingDays} day(s).`,
          });
        }
      }

      const newLeave = new LeaveRequest({
        employeeId,
        managerId: employee.managerId,
        leaveType,
        startDate,
        endDate,
        daysRequested: requestedDays,
        isHalfDay: !!isHalfDay,
        halfDayOption: halfDayOption || "Full Day",
        reason,
        attachmentUrl: attachmentUrl || documentUrl || "",
        documentUrl: documentUrl || attachmentUrl || "",
        status: "Pending",
      });

      await newLeave.save();

      // 📩 Trigger WhatsApp Notification to Manager
      try {
        const manager = await Employee.findById(employee.managerId).lean();
        if (manager && manager.phone) {
          const formattedStart = format(new Date(startDate), "MMM dd, yyyy");
          const formattedEnd = format(new Date(endDate), "MMM dd, yyyy");
          sendLeaveRequestToManager({
            managerPhone: manager.phone,
            managerName: manager.name,
            employeeName: employee.name,
            leaveType,
            startDate: formattedStart,
            endDate: formattedEnd,
            daysRequested,
            reason,
          });
        }
      } catch (wsErr) {
        console.error("Error triggering leave request WhatsApp notification:", wsErr);
      }

      return res.status(201).json({ success: true, data: newLeave });
    } catch (error) {
      console.error("Create Leave Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get logged-in employee's leaves
  async getMyLeaves(req, res) {
    try {
      const employeeId = req.employee?._id || req.user?._id;
      if (!employeeId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const leaves = await LeaveRequest.find({ employeeId })
        .populate("employeeId", "name email designation photo employeeProfileId")
        .populate("actionBy", "name email designation photo employeeProfileId")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({ success: true, data: leaves });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get leaves assigned to manager for approval (supports status query filter)
  async getManagerPendingLeaves(req, res) {
    try {
      const managerId = req.employee?._id || req.user?._id;
      if (!managerId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { status } = req.query;
      const query = { managerId };
      if (status && status !== "ALL") {
        query.status = status;
      } else if (!status) {
        query.status = "Pending";
      }

      const leaves = await LeaveRequest.find(query)
        .populate("employeeId", "name email phone photo employeeProfileId designation")
        .populate("actionBy", "name email designation photo employeeProfileId")
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

      // Authorization check: must be assigned manager OR HR / Admin
      const currentUser = await Employee.findById(currentUserId).lean();
      const isManager = leave.managerId?.toString() === currentUserId;
      const isHR =
        req.isSystemAdmin ||
        req.user?.isSystemAdmin ||
        req.employee?.isHR ||
        req.user?.isHR ||
        currentUser?.isHR ||
        currentUser?.role?.toLowerCase()?.includes("hr") ||
        currentUser?.designation?.toLowerCase()?.includes("hr") ||
        currentUser?.department?.toLowerCase()?.includes("hr") ||
        currentUser?.role?.toLowerCase()?.includes("admin") ||
        currentUser?.isSystemAdmin;

      if (!isManager && !isHR) {
        return res.status(403).json({ success: false, message: "You are not authorized to take action on this leave request" });
      }

      if (leave.status !== "Pending") {
        return res.status(400).json({ success: false, message: `Leave is already ${leave.status}` });
      }

      leave.status = status;
      leave.actionBy = currentUserId;
      leave.actionAt = new Date();
      if (managerRemarks) {
        leave.managerRemarks = managerRemarks;
      }
      
      await leave.save();
      await leave.populate("actionBy", "name email designation photo employeeProfileId");

      // 📩 Trigger WhatsApp Notification to Employee
      try {
        const emp = await Employee.findById(leave.employeeId).lean();
        const actionUser = currentUser?.name ? currentUser : await Employee.findById(currentUserId).lean();
        if (emp && emp.phone) {
          const formattedStart = format(new Date(leave.startDate), "MMM dd, yyyy");
          const formattedEnd = format(new Date(leave.endDate), "MMM dd, yyyy");
          sendLeaveStatusToEmployee({
            employeePhone: emp.phone,
            employeeName: emp.name,
            status,
            leaveType: leave.leaveType,
            startDate: formattedStart,
            endDate: formattedEnd,
            daysRequested: leave.daysRequested,
            actionByName: actionUser?.name || "Manager",
            managerRemarks: leave.managerRemarks,
          });
        }
      } catch (wsErr) {
        console.error("Error triggering leave status WhatsApp notification:", wsErr);
      }

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

      const employee = await Employee.findById(employeeId).lean();
      const joiningDate = employee?.joiningDate;

      const now = new Date();
      const { quotas, fyStartDate, fyEndDate } = calculateAccruedQuotas(joiningDate, now);

      const leaves = await LeaveRequest.find({
        employeeId,
        startDate: { $gte: fyStartDate, $lte: fyEndDate },
      }).lean();

      // Aggregate taken (Approved) and pending (Pending) days per leave type
      const usage = {};
      Object.keys(quotas).forEach((type) => {
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

      const round2 = (val) => Math.round((Number(val || 0) + Number.EPSILON) * 100) / 100;

      // Calculate primary categories (Casual, Sick, Earned for standard total)
      const standardTotalAllocated = round2(quotas["Casual Leave"] + quotas["Sick Leave"] + quotas["Earned Leave"]);
      const standardTaken = round2(usage["Casual Leave"].taken + usage["Sick Leave"].taken + usage["Earned Leave"].taken);
      const standardRemaining = Math.max(0, round2(standardTotalAllocated - standardTaken));

      const breakdown = Object.keys(quotas).map((type) => {
        const quota = round2(quotas[type]);
        const taken = round2(usage[type].taken);
        const pending = round2(usage[type].pending);
        const remaining = quota === 0 ? 0 : Math.max(0, round2(quota - taken));

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
            totalAllocated: round2(standardTotalAllocated),
            totalTaken: round2(totalTaken),
            totalPending: round2(totalPending),
            totalRemaining: round2(standardRemaining),
          },
          breakdown,
        },
      });
    } catch (error) {
      console.error("Get Leave Stats Error:", error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // HR / Admin: View leaves (Default: Today's leaves, or date range filter / history)
  async getAllLeaves(req, res) {
    try {
      const { page = 1, limit = 50, status, employeeId, fromDate, toDate, dateScope = "TODAY" } = req.query;
      const skip = (page - 1) * limit;
      
      const query = {};
      if (status && status !== "ALL") {
        query.status = status;
      }
      if (employeeId) {
        query.employeeId = employeeId;
      }

      // Date Range filtering: Default TODAY, or Date Range (fromDate to toDate), or ALL for full history
      if (dateScope !== "ALL") {
        const startTarget = fromDate ? new Date(fromDate) : new Date();
        const endTarget = toDate ? new Date(toDate) : (fromDate ? new Date(fromDate) : new Date());

        const startOfRange = new Date(startTarget.getFullYear(), startTarget.getMonth(), startTarget.getDate(), 0, 0, 0, 0);
        const endOfRange = new Date(endTarget.getFullYear(), endTarget.getMonth(), endTarget.getDate(), 23, 59, 59, 999);

        // Matches leaves overlapping the range [startOfRange, endOfRange]
        query.startDate = { $lte: endOfRange };
        query.endDate = { $gte: startOfRange };
      }

      const leaves = await LeaveRequest.find(query)
        .populate("employeeId", "name email employeeProfileId photo designation")
        .populate("managerId", "name email designation photo employeeProfileId")
        .populate("actionBy", "name email designation photo employeeProfileId")
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
