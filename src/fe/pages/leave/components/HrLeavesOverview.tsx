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
} from "@mui/material";
import {
  Badge as HrIcon,
  People as PeopleIcon,
  FilterList as FilterIcon,
  InboxOutlined as InboxIcon,
  CalendarToday as CalendarTodayIcon,
  PersonOutline as PersonIcon,
  CheckCircleOutline as ApproveIcon,
  HighlightOff as RejectIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequest } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import LeaveStatsCards from "./LeaveStatsCards";
import LeaveDetailsModal from "./LeaveDetailsModal";
import { animatedButtonSx } from "../styles";
import { formatDaysNumber } from "../utils/formatters";

interface EmployeeOption {
  _id: string;
  name: string;
  employeeProfileId?: string;
  photo?: string;
}

const HrLeavesOverview: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
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

  // Fetch leaves based on selected employee and status filter
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getAllLeaves({
        employeeId: selectedEmployee?._id,
        status: statusFilter,
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
  }, [selectedEmployee, statusFilter]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Cancelled": return "default";
      default: return "warning";
    }
  };

  return (
    <Box>
      {/* Header Bar */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <HrIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          <Typography variant="h5" fontWeight="700" color="#1e293b">
            HR Leave Management Overview
          </Typography>
        </Box>
        <Chip
          label={`${leaves.length} Record(s)`}
          size="small"
          color="primary"
          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
        />
      </Box>

      {/* Filter Control Bar */}
      <Box
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
        }}
      >
        <Typography variant="subtitle2" fontWeight="700" color="#475569" mb={2} display="flex" alignItems="center" gap={1}>
          <FilterIcon sx={{ fontSize: 18, color: "#1976d2" }} /> Filter Employee Leaves
        </Typography>

        <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
          {/* Employee Dropdown */}
          <Autocomplete
            options={employees}
            getOptionLabel={(option) => `${option.name} (${option.employeeProfileId || "No ID"})`}
            value={selectedEmployee}
            onChange={(_, newValue) => setSelectedEmployee(newValue)}
            loading={empLoading}
            sx={{ width: { xs: "100%", sm: 320 } }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select Employee"
                size="small"
                placeholder="Search by name or ID..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <PeopleIcon sx={{ color: "#64748b", fontSize: 20, mr: 1 }} />
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
            sx={{ minWidth: 160 }}
            InputProps={{
              startAdornment: <FilterIcon sx={{ color: "#1976d2", fontSize: 18, mr: 0.8 }} />,
            }}
          >
            <MenuItem value="ALL" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>All Statuses</MenuItem>
            <MenuItem value="Pending" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#ed6c02" }}>Pending</MenuItem>
            <MenuItem value="Approved" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#2e7d32" }}>Approved</MenuItem>
            <MenuItem value="Rejected" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#d32f2f" }}>Rejected</MenuItem>
            <MenuItem value="Cancelled" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#757575" }}>Cancelled</MenuItem>
          </TextField>

          {/* Reset Filters */}
          {(selectedEmployee || statusFilter !== "ALL") && (
            <Chip
              label="Reset Filters"
              onClick={() => { setSelectedEmployee(null); setStatusFilter("ALL"); }}
              onDelete={() => { setSelectedEmployee(null); setStatusFilter("ALL"); }}
              color="secondary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>
      </Box>

      {/* Employee Stats (shown when specific employee is selected) */}
      {selectedEmployee && (
        <Box mb={4}>
          <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2.5, bgcolor: "#e0f2fe", border: "1px solid #bae6fd", display: "flex", alignItems: "center", gap: 1.5 }}>
            <PeopleIcon sx={{ color: "#0288d1" }} />
            <Typography variant="body1" fontWeight="600" color="#0369a1">
              Showing leave quota and statistics for: <strong>{selectedEmployee.name}</strong>
            </Typography>
          </Paper>
          <LeaveStatsCards employeeId={selectedEmployee._id} />
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
            No Leave Records Found
          </Typography>
          <Typography variant="body2" color="#94a3b8">
            No leave records match the selected filters.
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
                  <Typography variant="subtitle1" fontWeight="700" color="#0f172a">
                    {leave.leaveType}
                  </Typography>
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
