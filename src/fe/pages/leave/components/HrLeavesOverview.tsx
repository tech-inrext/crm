import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  CircularProgress,
  Avatar,
  Autocomplete,
  TextField,
  MenuItem,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Badge as HrIcon,
  People as PeopleIcon,
  PersonSearch as PersonSearchIcon,
  FilterAlt as FilterAltIcon,
  InboxOutlined as InboxIcon,
  CalendarToday as CalendarTodayIcon,
  Today as TodayIcon,
  DateRange as DateRangeIcon,
  CalendarMonth as CalendarMonthIcon,
  History as HistoryIcon,
  RestartAlt as ResetIcon,
  PersonOutline as PersonIcon,
  CheckCircleOutline as ApproveIcon,
  HighlightOff as RejectIcon,
  ArrowForward as ArrowForwardIcon,
  FileDownload as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AttachFile as AttachFileIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequest } from "../types";
import { toast } from "sonner";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import LeaveStatsCards from "./LeaveStatsCards";
import LeaveDetailsModal from "./LeaveDetailsModal";
import { animatedButtonSx } from "../styles";
import { formatDaysNumber } from "../utils/formatters";

interface EmployeeOption {
  _id: string;
  name: string;
  email?: string;
  employeeProfileId?: string;
  photo?: string;
}

const HrLeavesOverview: React.FC = () => {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("Approved");
  const [dateScope, setDateScope] = useState<string>("TODAY");
  const [fromDate, setFromDate] = useState<string>(todayStr);
  const [toDate, setToDate] = useState<string>(todayStr);
  const [showEmployeeStats, setShowEmployeeStats] = useState<boolean>(false);

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [empLoading, setEmpLoading] = useState(false);

  // Modal states
  const [selectedDetailsLeave, setSelectedDetailsLeave] = useState<LeaveRequest | null>(null);
  const [actionModal, setActionModal] = useState<"Approved" | "Rejected" | null>(null);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [managerRemarks, setManagerRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch all employees for dropdown selector
  useEffect(() => {
    const fetchEmployeeList = async () => {
      setEmpLoading(true);
      try {
        const res = await fetch("/api/v0/employee/getAllEmployeeList");
        const json = await res.json();
        if (json?.data || json?.employees) {
          setEmployees(json.data || json.employees);
        } else if (Array.isArray(json)) {
          setEmployees(json);
        }
      } catch (err) {
        console.error("Error loading employee list:", err);
      } finally {
        setEmpLoading(false);
      }
    };
    fetchEmployeeList();
  }, []);

  // Handle Quick Date Presets
  const handleScopeChange = (scope: string) => {
    setDateScope(scope);
    const now = new Date();
    if (scope === "TODAY") {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (scope === "THIS_WEEK") {
      // Last 7 Days up to today (e.g. Aug 01 to Aug 07)
      setFromDate(format(subDays(now, 6), "yyyy-MM-dd"));
      setToDate(todayStr);
    } else if (scope === "THIS_MONTH") {
      setFromDate(format(startOfMonth(now), "yyyy-MM-dd"));
      setToDate(format(endOfMonth(now), "yyyy-MM-dd"));
    }
  };

  // Fetch leaves based on selected employee, date range filter, and status filter
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAllLeaves({
        employeeId: selectedEmployee?._id,
        status: statusFilter,
        dateScope,
        fromDate: dateScope === "ALL" ? undefined : fromDate,
        toDate: dateScope === "ALL" ? undefined : toDate,
        limit: 100,
      });
      if (res?.success) {
        setLeaves(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch leave records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [selectedEmployee, statusFilter, dateScope, fromDate, toDate]);

  const handleActionClick = (e: React.MouseEvent, leave: LeaveRequest, action: "Approved" | "Rejected") => {
    e.stopPropagation();
    setSelectedLeave(leave);
    setActionModal(action);
    setManagerRemarks("");
  };

  const handleConfirmAction = async () => {
    if (!selectedLeave || !actionModal) return;
    setActionLoading(true);
    try {
      const res = await leaveApi.managerAction({
        leaveId: selectedLeave._id,
        status: actionModal,
        managerRemarks: managerRemarks.trim(),
      });
      if (res.success) {
        toast.success(`Leave request ${actionModal.toLowerCase()} successfully!`);
        setActionModal(null);
        setSelectedLeave(null);
        fetchLeaves();
      } else {
        toast.error(res.message || "Failed to update leave status");
      }
    } catch (error) {
      toast.error("An error occurred while processing leave action");
    } finally {
      setActionLoading(false);
    }
  };

  // Export current filtered leaves to formatted Excel (.xlsx) file
  const handleExportExcel = async () => {
    if (!leaves || leaves.length === 0) {
      toast.error("No leave records available to export");
      return;
    }

    try {
      const ExcelJS = (await import("exceljs")).default;
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Leave Records");

      // Set Columns
      worksheet.columns = [
        { header: "Employee ID", key: "empId", width: 16 },
        { header: "Employee Name", key: "empName", width: 25 },
        { header: "Leave Type", key: "leaveType", width: 22 },
        { header: "Start Date", key: "startDate", width: 15 },
        { header: "End Date", key: "endDate", width: 15 },
        { header: "Days", key: "days", width: 12 },
        { header: "Status", key: "status", width: 15 },
        { header: "Manager Name", key: "manager", width: 25 },
        { header: "Action By", key: "actionBy", width: 25 },
        { header: "Applied Date", key: "appliedDate", width: 15 },
        { header: "Reason", key: "reason", width: 40 },
        { header: "Manager Remarks", key: "remarks", width: 35 },
      ];

      // Format Header Row
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "1976D2" },
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };
      headerRow.height = 26;

      // Add Data Rows
      leaves.forEach((leave) => {
        const emp: any = leave.employeeId;
        const mgr: any = leave.managerId;
        const actionBy: any = leave.actionBy;

        const row = worksheet.addRow({
          empId: emp?.employeeProfileId || "—",
          empName: emp?.name || "Employee",
          leaveType: leave.leaveType,
          startDate: format(new Date(leave.startDate), "yyyy-MM-dd"),
          endDate: format(new Date(leave.endDate), "yyyy-MM-dd"),
          days: leave.daysRequested,
          status: leave.status,
          manager: mgr?.name || "No Manager",
          actionBy: actionBy?.name || "—",
          appliedDate: format(new Date(leave.createdAt), "yyyy-MM-dd"),
          reason: leave.reason || "",
          remarks: leave.managerRemarks || "",
        });

        row.alignment = { vertical: "middle" };
      });

      // Write and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `Employee_Leaves_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;
      anchor.click();
      window.URL.revokeObjectURL(url);
      toast.success("Excel report downloaded successfully!");
    } catch (err) {
      console.error("Excel Export Error:", err);
      toast.error("Failed to export Excel report");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Cancelled": return "default";
      default: return "warning";
    }
  };

  const getHeaderText = () => {
    if (dateScope === "TODAY") {
      return "Today's Leaves";
    } else if (dateScope === "ALL") {
      return "All Historical Leaves";
    }
    return `Leaves (${format(new Date(fromDate), "MMM dd")} – ${format(new Date(toDate), "MMM dd, yyyy")})`;
  };

  return (
    <Box>
      {/* Header Bar */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2.5} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <HrIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          <Typography variant="h5" fontWeight="700" color="#1e293b">
            HR Leave Management Overview
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="success"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={handleExportExcel}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            px: 2,
            py: 0.7,
            bgcolor: "#2e7d32",
            "&:hover": { bgcolor: "#1b5e20" },
            boxShadow: "0 2px 8px rgba(46, 125, 50, 0.25)",
          }}
        >
          Export Excel
        </Button>
      </Box>

      {/* Ultra-Compact Icon Filter Toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          px: 2,
          mb: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
          justifyContent: "space-between",
        }}
      >
        {/* Left Section: Employee Search + Status Filter */}
        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap" flex={1}>
          {/* Employee Dropdown */}
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => `${option.name}${option.email ? ` (${option.email})` : option.employeeProfileId ? ` (${option.employeeProfileId})` : ""}`}
            value={selectedEmployee}
            onChange={(_, newValue) => setSelectedEmployee(newValue)}
            loading={empLoading}
            sx={{ minWidth: 240, flex: 1, maxWidth: 320 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Employee"
                size="small"
                placeholder="Search..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <PersonSearchIcon sx={{ color: "#1976d2", fontSize: 18, mr: 0.5 }} />
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Status Filter */}
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 140 }}
            InputProps={{
              startAdornment: <FilterAltIcon sx={{ color: "#1976d2", fontSize: 18, mr: 0.5 }} />,
            }}
          >
            <MenuItem value="ALL" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>All Statuses</MenuItem>
            <MenuItem value="Pending" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#ed6c02" }}>Pending</MenuItem>
            <MenuItem value="Approved" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#2e7d32" }}>Approved</MenuItem>
            <MenuItem value="Rejected" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#d32f2f" }}>Rejected</MenuItem>
            <MenuItem value="Cancelled" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#757575" }}>Cancelled</MenuItem>
          </TextField>
        </Box>

        {/* Right Section: Micro Date Presets + Compact Date Range */}
        <Box display="flex" alignItems="center" gap={1.2} flexWrap="wrap">
          {/* Quick Date Presets Chips */}
          <Box display="flex" alignItems="center" gap={0.6}>
            <Tooltip title="Today's Leaves">
              <Chip
                icon={<TodayIcon sx={{ fontSize: "16px !important" }} />}
                label="Today"
                size="small"
                clickable
                color={dateScope === "TODAY" ? "primary" : "default"}
                variant={dateScope === "TODAY" ? "filled" : "outlined"}
                onClick={() => handleScopeChange("TODAY")}
                sx={{ fontWeight: 700, borderRadius: 1.5, height: 34 }}
              />
            </Tooltip>
            <Tooltip title="This Week">
              <Chip
                icon={<DateRangeIcon sx={{ fontSize: "16px !important" }} />}
                label="Week"
                size="small"
                clickable
                color={dateScope === "THIS_WEEK" ? "primary" : "default"}
                variant={dateScope === "THIS_WEEK" ? "filled" : "outlined"}
                onClick={() => handleScopeChange("THIS_WEEK")}
                sx={{ fontWeight: 700, borderRadius: 1.5, height: 34 }}
              />
            </Tooltip>
            <Tooltip title="This Month">
              <Chip
                icon={<CalendarMonthIcon sx={{ fontSize: "16px !important" }} />}
                label="Month"
                size="small"
                clickable
                color={dateScope === "THIS_MONTH" ? "primary" : "default"}
                variant={dateScope === "THIS_MONTH" ? "filled" : "outlined"}
                onClick={() => handleScopeChange("THIS_MONTH")}
                sx={{ fontWeight: 700, borderRadius: 1.5, height: 34 }}
              />
            </Tooltip>
            <Tooltip title="All Historical Leaves">
              <Chip
                icon={<HistoryIcon sx={{ fontSize: "16px !important" }} />}
                label="All"
                size="small"
                clickable
                color={dateScope === "ALL" ? "primary" : "default"}
                variant={dateScope === "ALL" ? "filled" : "outlined"}
                onClick={() => handleScopeChange("ALL")}
                sx={{ fontWeight: 700, borderRadius: 1.5, height: 34 }}
              />
            </Tooltip>
          </Box>

          {/* Date Range Picker Pair (From -> To) */}
          {dateScope !== "ALL" && (
            <Box
              display="flex"
              alignItems="center"
              gap={0.6}
              sx={{
                bgcolor: "#f8fafc",
                p: 0.4,
                px: 1,
                borderRadius: 2,
                border: "1px solid #e2e8f0",
              }}
            >
              <TextField
                type="date"
                size="small"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setDateScope("CUSTOM");
                }}
                sx={{
                  width: 130,
                  bgcolor: "#ffffff",
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: "0.8rem", height: 34 },
                }}
              />
              <ArrowForwardIcon sx={{ color: "#94a3b8", fontSize: 14 }} />
              <TextField
                type="date"
                size="small"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setDateScope("CUSTOM");
                }}
                sx={{
                  width: 130,
                  bgcolor: "#ffffff",
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5, fontSize: "0.8rem", height: 34 },
                }}
              />
            </Box>
          )}

          {/* Reset Filters Icon Button */}
          {(selectedEmployee || statusFilter !== "Approved" || dateScope !== "TODAY" || fromDate !== todayStr || toDate !== todayStr) && (
            <Tooltip title="Reset Filters">
              <Chip
                icon={<ResetIcon sx={{ fontSize: "16px !important" }} />}
                label="Reset"
                size="small"
                onClick={() => {
                  setSelectedEmployee(null);
                  setStatusFilter("Approved");
                  setDateScope("TODAY");
                  setFromDate(todayStr);
                  setToDate(todayStr);
                }}
                color="secondary"
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: 1.5, height: 34 }}
              />
            </Tooltip>
          )}
        </Box>
      </Paper>

      {/* Employee Stats (shown when specific employee is selected, collapsed by default) */}
      {selectedEmployee && (
        <Box mb={3}>
          <Paper
            elevation={0}
            onClick={() => setShowEmployeeStats((prev) => !prev)}
            sx={{
              p: 1.8,
              px: 2.5,
              borderRadius: 2.5,
              bgcolor: "#e0f2fe",
              border: "1px solid #bae6fd",
              display: "flex",
              alignItems: "center",
              justify: "space-between",
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: "#bae6fd",
              },
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <PeopleIcon sx={{ color: "#0288d1" }} />
              <Typography variant="body1" fontWeight="600" color="#0369a1">
                Showing leave quota and statistics for: <strong>{selectedEmployee.name}</strong>
                {selectedEmployee.email && (
                  <Box component="span" sx={{ opacity: 0.85, fontWeight: 500, ml: 0.8 }}>
                    ({selectedEmployee.email})
                  </Box>
                )}
              </Typography>
            </Box>
            <Button
              size="small"
              endIcon={showEmployeeStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{ fontWeight: 700, color: "#0288d1", textTransform: "none", ml: "auto" }}
            >
              {showEmployeeStats ? "Hide Quota Balance" : "View Quota Balance"}
            </Button>
          </Paper>

          <Collapse in={showEmployeeStats}>
            <Box pt={2}>
              <LeaveStatsCards employeeId={selectedEmployee._id} />
            </Box>
          </Collapse>
        </Box>
      )}

      {/* Section Summary Title */}
      {!loading && (
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} px={0.5}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <CalendarTodayIcon sx={{ color: "#1976d2", fontSize: 20 }} />
            <Typography variant="h6" fontWeight="700" color="#1e293b">
              {getHeaderText()}
            </Typography>
            <Chip
              label={`${leaves.length} Record(s)`}
              size="small"
              color="primary"
              sx={{ fontWeight: 700, fontSize: "0.75rem" }}
            />
          </Box>
        </Box>
      )}

      {/* Card Grid View */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8, minHeight: 300 }}>
          <CircularProgress size={40} thickness={4} sx={{ color: "#1976d2" }} />
        </Box>
      ) : leaves.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3, borderColor: "#e2e8f0" }}>
          <InboxIcon sx={{ fontSize: 48, mb: 1, color: "#94a3b8" }} />
          <Typography variant="h6" fontWeight="600" color="#475569">
            {dateScope === "TODAY"
              ? "No Employees on Leave Today"
              : "No Leave Records Found"}
          </Typography>
          <Typography variant="body2" color="#94a3b8" mt={0.5}>
            {dateScope === "TODAY"
              ? "There are no active or scheduled leave requests for today."
              : "Try adjusting the employee, date range, or status filters."}
          </Typography>
        </Paper>
      ) : (
        <Box display="flex" flexWrap="wrap" gap={3}>
          {leaves.map((leave) => {
            const emp: any = leave.employeeId;
            const mgr: any = leave.managerId;
            const isLongReason = leave.reason && leave.reason.length > 55;

            return (
              <Paper
                key={leave._id}
                variant="outlined"
                onClick={() => setSelectedDetailsLeave(leave)}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  borderColor: "#e2e8f0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
                  transition: "all 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  width: { xs: "100%", sm: "360px" },
                  maxWidth: "100%",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "#cbd5e1",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Employee Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar src={emp?.photo} sx={{ width: 44, height: 44, bgcolor: "#1976d2", fontWeight: 700 }}>
                      {emp?.name?.[0] || "E"}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="700" color="#1e293b">
                        {emp?.name || "Employee"}
                      </Typography>
                      <Typography variant="caption" color="#94a3b8" display="block">
                        {emp?.employeeProfileId || emp?.email || "—"}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={leave.status}
                    size="small"
                    color={getStatusColor(leave.status) as any}
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Box>

                <Divider sx={{ mb: 2, borderColor: "#f1f5f9" }} />

                {/* Leave Type + Days */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Typography variant="subtitle1" fontWeight="700" color="#0f172a">
                      {leave.leaveType}
                    </Typography>
                    {leave.attachmentUrl && (
                      <Tooltip title="Attachment available. Click card to view or download.">
                        <Chip
                          icon={<AttachFileIcon sx={{ fontSize: "14px !important", color: "#0288d1" }} />}
                          label="Doc"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            bgcolor: "#e0f2fe",
                            color: "#0369a1",
                            "& .MuiChip-icon": { ml: 0.5 },
                          }}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Chip
                    label={`${formatDaysNumber(leave.daysRequested)} Day(s)`}
                    size="small"
                    sx={{ fontWeight: 700, backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: 1.5 }}
                  />
                </Box>

                {/* Date Range */}
                <Box display="flex" alignItems="center" gap={1} mb={1.5} color="#475569">
                  <CalendarTodayIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                  <Typography variant="body2" fontWeight="600">
                    {format(new Date(leave.startDate), "MMM dd")} – {format(new Date(leave.endDate), "MMM dd, yyyy")}
                  </Typography>
                </Box>

                {/* Reason */}
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#f8fafc", borderLeft: "3px solid #1976d2", mb: 2 }}>
                  <Typography variant="caption" color="#64748b" fontWeight="700" display="block" mb={0.3}>
                    Reason:
                  </Typography>
                  <Typography variant="body2" color="#334155" sx={{ fontStyle: "italic", lineHeight: 1.45, wordBreak: "break-word" }}>
                    "{isLongReason ? `${leave.reason.slice(0, 55)}...` : leave.reason}"
                  </Typography>
                </Box>

                {/* Manager Name + Applied Date Footer */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mt="auto" pt={1.5} borderTop="1px solid #f1f5f9">
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <PersonIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
                    <Typography variant="caption" color="#64748b" fontWeight="600">
                      {mgr?.name || "No Manager"}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="#94a3b8">
                    {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                  </Typography>
                </Box>

                {/* Card Action Buttons for Pending leaves */}
                {leave.status === "Pending" && (
                  <Box display="flex" gap={1.5} mt={1.5}>
                    <Button
                      fullWidth
                      color="success"
                      variant="contained"
                      startIcon={<ApproveIcon />}
                      sx={{ ...animatedButtonSx, py: 0.8, fontWeight: 700, borderRadius: 2 }}
                      onClick={(e) => handleActionClick(e, leave, "Approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      startIcon={<RejectIcon />}
                      sx={{ ...animatedButtonSx, py: 0.8, fontWeight: 700, borderRadius: 2 }}
                      onClick={(e) => handleActionClick(e, leave, "Rejected")}
                    >
                      Reject
                    </Button>
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Action Dialog (Approve / Reject) for HR */}
      <Dialog
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            {actionModal === "Approved" ? <ApproveIcon color="success" /> : <RejectIcon color="error" />}
            <Typography variant="h6" fontWeight="700">
              {actionModal === "Approved" ? "Approve" : "Reject"} Leave Request (HR Override)
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Typography mb={3} color="text.secondary">
            Are you sure you want to <strong>{actionModal?.toLowerCase()}</strong> the leave request for{" "}
            <strong>{(selectedLeave?.employeeId as any)?.name || "Employee"}</strong> on behalf of manager?
          </Typography>
          <TextField
            fullWidth
            label="HR Remarks (Optional)"
            multiline
            rows={3}
            value={managerRemarks}
            onChange={(e) => setManagerRemarks(e.target.value)}
            placeholder="Enter any remarks or notes..."
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setActionModal(null)} disabled={actionLoading} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmAction}
            disabled={actionLoading}
            variant="contained"
            color={actionModal === "Approved" ? "success" : "error"}
            sx={{ px: 3, fontWeight: 700 }}
          >
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : `Confirm ${actionModal}`}
          </Button>
        </DialogActions>
      </Dialog>

      <LeaveDetailsModal
        open={!!selectedDetailsLeave}
        leave={selectedDetailsLeave}
        onClose={() => setSelectedDetailsLeave(null)}
      />
    </Box>
  );
};

export default HrLeavesOverview;
