import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  Avatar,
  Divider,
  Button,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  EventNote as EventNoteIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  HourglassEmpty as PendingIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { LeaveRequest, EmployeeStub } from "../types";
import { format } from "date-fns";
import { formatHalfDayLabel } from "../utils/formatters";

interface Props {
  leave: LeaveRequest | null;
  open: boolean;
  onClose: () => void;
}

const LeaveDetailsModal: React.FC<Props> = ({ leave, open, onClose }) => {
  const [expandReason, setExpandReason] = React.useState(false);
  const [expandRemarks, setExpandRemarks] = React.useState(false);

  if (!leave) return null;

  const emp: EmployeeStub = typeof leave.employeeId === "object" ? leave.employeeId : ({} as EmployeeStub);
  const manager: EmployeeStub = typeof leave.managerId === "object" ? leave.managerId : ({} as EmployeeStub);
  const approver: EmployeeStub | null = typeof leave.actionBy === "object" ? leave.actionBy : null;

  const isLongReason = leave.reason && leave.reason.length > 55;
  const isLongRemarks = leave.managerRemarks && leave.managerRemarks.length > 55;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "success";
      case "Rejected": return "error";
      case "Cancelled": return "default";
      default: return "warning";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved": return <ApprovedIcon sx={{ color: "#2e7d32", fontSize: 24 }} />;
      case "Rejected": return <RejectedIcon sx={{ color: "#d32f2f", fontSize: 24 }} />;
      default: return <PendingIcon sx={{ color: "#ed6c02", fontSize: 24 }} />;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1, pt: 2.5, px: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <EventNoteIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          <Typography variant="h6" fontWeight="700" color="#1e293b">
            Leave Request Details
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 1, pb: 3.5 }}>
        {/* Main Leave Info Card */}
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            borderRadius: 2.5,
            borderColor: "#e2e8f0",
            backgroundColor: "#f8fafc",
            mb: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight="800" color="#0f172a">
                {leave.leaveType}
              </Typography>
              {leave.isHalfDay && (
                <Typography variant="caption" color="#ed6c02" fontWeight="600" display="block" mt={0.5}>
                  Half Day: {formatHalfDayLabel(leave.halfDayOption)}
                </Typography>
              )}
            </Box>
            <Chip 
              label={leave.status} 
              color={getStatusColor(leave.status) as any} 
              sx={{ fontWeight: 700, px: 1 }}
            />
          </Box>

          <Divider sx={{ mb: 2, borderColor: "#e2e8f0" }} />

          {/* Dates & Duration */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center" gap={1} color="#475569">
              <CalendarTodayIcon sx={{ fontSize: 18, color: "#1976d2" }} />
              <Typography variant="body2" fontWeight="700">
                {format(new Date(leave.startDate), "MMM dd, yyyy")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
              </Typography>
            </Box>
            <Chip 
              label={`${leave.daysRequested} Day(s)`} 
              size="small" 
              sx={{ fontWeight: 700, backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: 1.5 }} 
            />
          </Box>

          {/* Reason */}
          <Box sx={{ p: 2, borderRadius: 2, backgroundColor: "#ffffff", borderLeft: "4px solid #1976d2" }}>
            <Typography variant="caption" color="#64748b" fontWeight="700" display="block" mb={0.5}>
              Employee Reason:
            </Typography>
            <Typography variant="body2" color="#334155" sx={{ fontStyle: "italic", lineHeight: 1.5, wordBreak: "break-word" }}>
              "{isLongReason && !expandReason ? `${leave.reason.slice(0, 55)}...` : leave.reason}"
              {isLongReason && (
                <Typography 
                  component="span"
                  onClick={() => setExpandReason(!expandReason)}
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
                  {expandReason ? "See Less" : "See More"}
                </Typography>
              )}
            </Typography>
          </Box>
        </Paper>

        {/* Audit & Decision Timeline */}
        <Typography variant="subtitle2" fontWeight="700" color="#475569" letterSpacing="0.05em" textTransform="uppercase" mb={2}>
          Audit & Decision Timeline
        </Typography>

        <Box sx={{ position: "relative", pl: 3, "&::before": { content: '""', position: "absolute", left: 11, top: 12, bottom: 12, width: 2, backgroundColor: "#e2e8f0" } }}>
          
          {/* Step 1: Requested */}
          <Box sx={{ position: "relative", mb: 3 }}>
            <Box sx={{ position: "absolute", left: -25, top: 2, bgcolor: "#1976d2", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ScheduleIcon sx={{ fontSize: 13 }} />
            </Box>
            <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
              <Avatar src={emp.photo} sx={{ width: 28, height: 28, bgcolor: "#1976d2", fontSize: "0.8rem", fontWeight: 700 }}>
                {emp.name?.[0] || "E"}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="700" color="#1e293b">
                  Requested by {emp.name || "Employee"}
                </Typography>
                <Typography variant="caption" color="#64748b">
                  {emp.designation || emp.employeeProfileId || emp.email}
                </Typography>
              </Box>
            </Box>
            <Typography variant="caption" color="#94a3b8" display="block" ml={5.5}>
              Submitted on {format(new Date(leave.createdAt), "MMM dd, yyyy 'at' hh:mm a")}
            </Typography>
          </Box>

          {/* Step 2: Approval Action Decision */}
          <Box sx={{ position: "relative" }}>
            <Box sx={{ position: "absolute", left: -27, top: 2, bgcolor: "white", borderRadius: "50%" }}>
              {getStatusIcon(leave.status)}
            </Box>
            <Box ml={0.5}>
              {leave.status === "Pending" ? (
                <>
                  <Typography variant="body2" fontWeight="700" color="#ed6c02">
                    Pending Manager Action
                  </Typography>
                  <Typography variant="caption" color="#64748b" display="block">
                    Assigned Manager: {manager.name || "Reporting Manager"}
                  </Typography>
                </>
              ) : (
                <>
                  <Box display="flex" alignItems="center" gap={1.5} mb={0.5}>
                    <Avatar src={approver?.photo} sx={{ width: 28, height: 28, bgcolor: leave.status === "Approved" ? "#2e7d32" : "#d32f2f", fontSize: "0.8rem", fontWeight: 700 }}>
                      {approver?.name?.[0] || manager.name?.[0] || "A"}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="700" color="#1e293b">
                        {leave.status} by {approver?.name || manager.name || "Manager / HR"}
                      </Typography>
                      <Typography variant="caption" color="#64748b">
                        {approver?.designation || (approver?.email ? `(${approver.email})` : "Approver")}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="#94a3b8" display="block" ml={5.5} mb={1}>
                    Action taken on {format(new Date(leave.actionAt || leave.updatedAt), "MMM dd, yyyy 'at' hh:mm a")}
                  </Typography>
                  {leave.managerRemarks && (
                    <Box sx={{ ml: 5.5, p: 1.5, borderRadius: 2, backgroundColor: "#f1f5f9", borderLeft: "3px solid #64748b" }}>
                      <Typography variant="caption" color="#475569" fontWeight="700" display="block" mb={0.3}>
                        Remarks:
                      </Typography>
                      <Typography variant="body2" color="#334155" sx={{ fontStyle: "italic", lineHeight: 1.45, wordBreak: "break-word" }}>
                        "{isLongRemarks && !expandRemarks ? `${leave.managerRemarks.slice(0, 55)}...` : leave.managerRemarks}"
                        {isLongRemarks && (
                          <Typography 
                            component="span"
                            onClick={() => setExpandRemarks(!expandRemarks)}
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
                            {expandRemarks ? "See Less" : "See More"}
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </Box>

        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LeaveDetailsModal;
