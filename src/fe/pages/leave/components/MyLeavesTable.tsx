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
  Chip,
  CircularProgress,
  Button,
  IconButton,
  Collapse,
  Divider,
  TextField,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { 
  AddCircleOutline as AddIcon,
  EventNote as EventNoteIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AssessmentOutlined as AssessmentIcon,
  CalendarToday as CalendarTodayIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequest } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import NewLeaveRequestModal from "./NewLeaveRequestModal";
import LeaveStatsCards from "./LeaveStatsCards";
import LeaveDetailsModal from "./LeaveDetailsModal";
import { tableContainerSx, tableHeaderSx, tableRowSx, animatedButtonSx } from "../styles";
import { formatHalfDayLabel } from "../utils/formatters";

interface MyLeavesTableProps {
  refreshTrigger?: number;
}

const MyLeavesTable: React.FC<MyLeavesTableProps> = ({ refreshTrigger }) => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDetailsLeave, setSelectedDetailsLeave] = useState<LeaveRequest | null>(null);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);
  const [showStats, setShowStats] = useState(false); // Collapsed by default upfront
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [expandedReasons, setExpandedReasons] = useState<Record<string, boolean>>({});

  const filteredLeaves = leaves.filter((leave) => {
    if (statusFilter === "ALL") return true;
    return leave.status === statusFilter;
  });

  const toggleReasonExpand = (e: React.MouseEvent, leaveId: string) => {
    e.stopPropagation();
    setExpandedReasons((prev) => ({
      ...prev,
      [leaveId]: !prev[leaveId],
    }));
  };

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getMyRequests();
      if (res?.success) {
        setLeaves(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch leave history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [refreshTrigger]);

  useEffect(() => {
    if (refreshTrigger) {
      setStatsRefreshKey((prev) => prev + 1);
    }
  }, [refreshTrigger]);

  const handleSuccess = () => {
    fetchLeaves();
    setStatsRefreshKey((prev) => prev + 1);
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
      {/* Top Header Action Bar: Dashboard Title + Apply Leave Button */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between", 
          alignItems: { xs: "stretch", sm: "center" }, 
          gap: 2,
          mb: 2.5 
        }}
      >
        <Typography variant="h5" fontWeight="700" color="#1e293b" sx={{ whiteSpace: "nowrap" }}>
          My Leave Dashboard
        </Typography>

        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={{ ...animatedButtonSx, py: 0.85, px: 2.5, whiteSpace: "nowrap" }}
        >
          Apply Leave
        </Button>
      </Box>

      {/* Expandable Leave Balance Banner */}
      <Paper 
        variant="outlined"
        sx={{
          p: 2,
          mb: 3.5,
          borderRadius: 3,
          borderColor: showStats ? "#bbdefb" : "#e2e8f0",
          backgroundColor: showStats ? "#f8fafc" : "#ffffff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.02)",
          transition: "all 0.25s ease",
        }}
      >
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center"
          onClick={() => setShowStats(!showStats)}
          sx={{ cursor: "pointer", userSelect: "none" }}
        >
          <Box display="flex" alignItems="center" gap={1.5}>
            <AssessmentIcon sx={{ color: "#1976d2", fontSize: 24 }} />
            <Typography variant="subtitle1" fontWeight="700" color="#1e293b">
              Leave Quota & Balance Overview
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="caption" fontWeight="600" color="#64748b">
              {showStats ? "Hide Details" : "View Quotas & Balance"}
            </Typography>
            <IconButton size="small" sx={{ color: "#1976d2" }}>
              {showStats ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>
        <Collapse in={showStats} timeout="auto" sx={{ mt: showStats ? 2 : 0 }}>
          <LeaveStatsCards refreshTrigger={statsRefreshKey} />
        </Collapse>
      </Paper>

      {/* My Leave History Section Bar directly above Cards */}
      <Box 
        sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between", 
          alignItems: { xs: "stretch", sm: "center" }, 
          gap: 2,
          mb: 2.5 
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <EventNoteIcon sx={{ color: "#1976d2", fontSize: 26 }} />
          <Typography variant="h6" fontWeight="700" color="#1e293b" sx={{ whiteSpace: "nowrap" }}>
            My Leave History
          </Typography>
          <Chip 
            label={`${filteredLeaves.length} Request(s)`} 
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
            minWidth: 150,
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
          <MenuItem value="ALL" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>All Statuses</MenuItem>
          <MenuItem value="Pending" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#ed6c02" }}>Pending</MenuItem>
          <MenuItem value="Approved" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#2e7d32" }}>Approved</MenuItem>
          <MenuItem value="Rejected" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#d32f2f" }}>Rejected</MenuItem>
          <MenuItem value="Cancelled" sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#757575" }}>Cancelled</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8, minHeight: 300 }}>
          <CircularProgress size={40} thickness={4} sx={{ color: "#1976d2" }} />
        </Box>
      ) : filteredLeaves.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 6, textAlign: "center", borderRadius: 3, borderColor: "#e2e8f0" }}>
          <AccessTimeIcon sx={{ fontSize: 48, mb: 1, color: "#94a3b8" }} />
          <Typography variant="h6" fontWeight="600" color="#475569">
            {statusFilter === "ALL" ? "No Leave Requests Found" : `No ${statusFilter} Requests Found`}
          </Typography>
          <Typography variant="body2" color="#94a3b8">
            {statusFilter === "ALL" 
              ? "You haven't submitted any leave requests yet. Use the 'Apply Leave' button above to submit your first request."
              : `There are currently no leave requests with status "${statusFilter}".`}
          </Typography>
        </Paper>
      ) : (
        /* CARD GRID VIEW */
        <Box display="flex" flexWrap="wrap" gap={3}>
          {filteredLeaves.map((leave) => {
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
                {/* Header: Leave Type + Status */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                  <Typography variant="subtitle1" fontWeight="700" color="#0f172a">
                    {leave.leaveType}
                  </Typography>
                  <Chip 
                    label={leave.status} 
                    size="small" 
                    color={getStatusColor(leave.status) as any} 
                    sx={{ fontWeight: 700, px: 1 }}
                  />
                </Box>

                <Divider sx={{ mb: 2, borderColor: "#f1f5f9" }} />

                {/* Body: Duration & Days */}
                <Box mb={2} flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1} color="#475569">
                      <CalendarTodayIcon sx={{ fontSize: 16, color: "#1976d2" }} />
                      <Typography variant="body2" fontWeight="600">
                        {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${leave.daysRequested} Day(s)`} 
                      size="small" 
                      sx={{ fontWeight: 700, backgroundColor: "#e0f2fe", color: "#0369a1", borderRadius: 1.5 }} 
                    />
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

                {/* Footer: Applied On */}
                <Box display="flex" justifyContent="space-between" alignItems="center" pt={1.5} borderTop="1px solid #f1f5f9">
                  <Typography variant="caption" color="#94a3b8" fontWeight="500">
                    Applied on {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      <NewLeaveRequestModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={handleSuccess} 
      />

      <LeaveDetailsModal 
        open={!!selectedDetailsLeave}
        leave={selectedDetailsLeave}
        onClose={() => setSelectedDetailsLeave(null)}
      />
    </Box>
  );
};

export default MyLeavesTable;
