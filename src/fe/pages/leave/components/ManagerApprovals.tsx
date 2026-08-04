import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Chip,
  Grid,
  Divider,
  Tooltip,
} from "@mui/material";
import { 
  FactCheck as FactCheckIcon,
  CheckCircleOutline as ApproveIcon,
  CancelOutlined as RejectIcon,
  InboxOutlined as InboxIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequest } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import LeaveDetailsModal from "./LeaveDetailsModal";
import { tableContainerSx, tableHeaderSx, tableRowSx, animatedButtonSx } from "../styles";
import { formatHalfDayLabel, formatDaysNumber } from "../utils/formatters";

const ManagerApprovals: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("Pending");
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [selectedDetailsLeave, setSelectedDetailsLeave] = useState<LeaveRequest | null>(null);
  const [actionModal, setActionModal] = useState<"Approved" | "Rejected" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});

  const toggleReasonExpand = (e: React.MouseEvent, leaveId: string) => {
    e.stopPropagation();
    setExpandedReasons((prev) => ({
      ...prev,
      [leaveId]: !prev[leaveId],
    }));
  };

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getManagerPending(statusFilter);
      if (res?.success) {
        setLeaves(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [statusFilter]);

  const handleActionClick = (e: React.MouseEvent, leave: LeaveRequest, action: "Approved" | "Rejected") => {
    e.stopPropagation();
    setSelectedLeave(leave);
    setActionModal(action);
    setRemarks("");
  };

  const submitAction = async () => {
    if (!selectedLeave || !actionModal) return;
    setActionLoading(true);
    try {
      const res = await leaveApi.managerAction({
        leaveId: selectedLeave._id,
        status: actionModal,
        managerRemarks: remarks,
      });
      if (res?.success) {
        toast.success(`Leave ${actionModal.toLowerCase()} successfully`);
        setActionModal(null);
        setSelectedLeave(null);
        fetchPending();
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "An error occurred");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      {/* Header Bar with Title & Status Filter */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between", 
          alignItems: { xs: "stretch", sm: "center" }, 
          gap: 2,
          mb: 3 
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <FactCheckIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          <Typography variant="h5" fontWeight="700" color="#1e293b" sx={{ whiteSpace: "nowrap" }}>
            {statusFilter === "Pending" ? "Pending Approvals" : statusFilter === "ALL" ? "All Manager Requests" : `${statusFilter} Requests`}
          </Typography>
          <Chip 
            label={`${leaves.length} Request(s)`} 
            size="small" 
            color="primary" 
            sx={{ fontWeight: 700, fontSize: "0.75rem" }} 
          />
        </Box>

        {/* Status Filter Selector */}
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{
            minWidth: 160,
            backgroundColor: "#ffffff",
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              fontSize: "0.85rem",
              fontWeight: 600,
            }
          }}
          InputProps={{
            startAdornment: <FilterIcon sx={{ color: "#1976d2", fontSize: 18, mr: 0.8 }} />
          }}
        >
          <MenuItem value="Pending" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#ed6c02" }}>Pending</MenuItem>
          <MenuItem value="Approved" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#2e7d32" }}>Approved</MenuItem>
          <MenuItem value="Rejected" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#d32f2f" }}>Rejected</MenuItem>
          <MenuItem value="ALL" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>All Statuses</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8, minHeight: 300 }}>
          <CircularProgress size={40} thickness={4} sx={{ color: "#1976d2" }} />
        </Box>
      ) : leaves.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3, borderColor: "#e2e8f0" }}>
          <InboxIcon sx={{ fontSize: 48, mb: 1, color: "#94a3b8" }} />
          <Typography variant="h6" fontWeight="600" color="#475569">
            {statusFilter === "Pending" ? "No Pending Approvals" : `No ${statusFilter} Requests Found`}
          </Typography>
          <Typography variant="body2" color="#94a3b8">
            {statusFilter === "Pending" ? "You are all caught up! There are no leave requests awaiting your action." : `There are no ${statusFilter} leave requests under your management.`}
          </Typography>
        </Paper>
      ) : (
        /* CARD GRID VIEW */
        <Box display="flex" flexWrap="wrap" gap={3}>
          {leaves.map((leave) => {
            const emp: any = leave.employeeId;
            const isExpanded = Boolean(expandedReasons[leave._id]);
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
                    transform: "translateY(-2px)"
                  }
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
                        {emp?.employeeProfileId || emp?.email}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip
                    label={leave.status}
                    size="small"
                    color={leave.status === "Approved" ? "success" : leave.status === "Rejected" ? "error" : "warning"}
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Box>

                <Divider sx={{ mb: 2, borderColor: "#f1f5f9" }} />

                {/* Leave Details */}
                <Box mb={2} flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="700" color="#0f172a">
                      {leave.leaveType}
                    </Typography>
                    <Chip
                      label={`${formatDaysNumber(leave.daysRequested)} Day(s)`}
                      size="small"
                      sx={{ fontWeight: 700, backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: 1.5 }}
                    />
                  </Box>

                  <Box display="flex" alignItems="center" gap={1} color="#64748b" mb={1.5}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                    <Typography variant="body2" fontWeight="600" color="#475569">
                      {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                    </Typography>
                  </Box>

                  {/* Reason Box */}
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: "#f8fafc", 
                      borderLeft: "3px solid #1976d2",
                      mt: 1.5
                    }}
                  >
                    <Typography variant="caption" color="#64748b" fontWeight="700" display="block" mb={0.3}>
                      Reason:
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="#334155" 
                      sx={{ 
                        fontStyle: "italic",
                        wordBreak: "break-word",
                        lineHeight: 1.45
                      }}
                    >
                      "{isLongReason && !isExpanded ? `${leave.reason.slice(0, 55)}...` : leave.reason}"
                      {isLongReason && (
                        <Typography 
                          component="span"
                          onClick={(e) => toggleReasonExpand(e, leave._id)}
                          sx={{ 
                            color: "#1976d2", 
                            fontWeight: 700, 
                            cursor: "pointer", 
                            ml: 0.8,
                            fontSize: "0.78rem",
                            fontStyle: "normal",
                            display: "inline-block",
                            "&:hover": { textDecoration: "underline" }
                          }}
                        >
                          {isExpanded ? "See Less" : "See More"}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                </Box>

                {/* Footer with Applied Date and Remarks */}
                <Box display="flex" justifyContent="space-between" alignItems="center" pt={1.5} mt="auto" borderTop="1px solid #f1f5f9">
                  <Typography variant="caption" color="#64748b" fontWeight="600">
                    Applied: {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                  </Typography>
                  {leave.managerRemarks && (
                    <Typography variant="caption" color="#64748b" fontStyle="italic" sx={{ maxWidth: 180, textAlign: "right" }}>
                      Remarks: "{leave.managerRemarks.length > 20 ? `${leave.managerRemarks.slice(0, 20)}...` : leave.managerRemarks}"
                    </Typography>
                  )}
                </Box>

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

      {/* Action Modal */}
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
              {actionModal === "Approved" ? "Approve" : "Reject"} Leave Request
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: "16px !important" }}>
          <Typography mb={3} color="text.secondary">
            Are you sure you want to {actionModal?.toLowerCase()} the leave request for <strong>{(selectedLeave?.employeeId as any)?.name}</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setActionModal(null)} 
            disabled={actionLoading}
            sx={{ color: "text.secondary", fontWeight: 600, textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={submitAction} 
            variant="contained" 
            color={actionModal === "Approved" ? "success" : "error"}
            disabled={actionLoading}
            sx={{ ...animatedButtonSx, boxShadow: "none" }}
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

export default ManagerApprovals;
