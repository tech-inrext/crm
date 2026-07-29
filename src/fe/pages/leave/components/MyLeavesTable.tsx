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
} from "@mui/material";
import { 
  AddCircleOutline as AddIcon,
  EventNote as EventNoteIcon,
  AccessTime as AccessTimeIcon 
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequest } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import NewLeaveRequestModal from "./NewLeaveRequestModal";
import LeaveStatsCards from "./LeaveStatsCards";
import { tableContainerSx, tableHeaderSx, tableRowSx, animatedButtonSx } from "../styles";

const MyLeavesTable: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statsRefreshKey, setStatsRefreshKey] = useState(0);

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
  }, []);

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
      <LeaveStatsCards refreshTrigger={statsRefreshKey} />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <EventNoteIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          <Typography variant="h5" fontWeight="700" color="#1e293b">
            My Leave History
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
          sx={animatedButtonSx}
        >
          Apply Leave
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 8, minHeight: 300 }}>
          <CircularProgress size={40} thickness={4} sx={{ color: "#1976d2" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={tableContainerSx}>
          <Table>
            <TableHead sx={tableHeaderSx}>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="center">Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Applied On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#64748b" }}>
                    <AccessTimeIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography>No leave requests found.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave._id} sx={tableRowSx}>
                    <TableCell>
                      <Typography fontWeight="600" color="#334155">{leave.leaveType}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: "#64748b" }}>
                      {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${leave.daysRequested} Day(s)`} size="small" variant="outlined" sx={{ fontWeight: 600, borderColor: "#cbd5e1" }} />
                    </TableCell>
                    <TableCell sx={{ color: "#475569", maxWidth: 250, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {leave.reason}
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        size="small" 
                        label={leave.status} 
                        color={getStatusColor(leave.status) as any} 
                        sx={{ fontWeight: 600, px: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: "#94a3b8", fontSize: "0.875rem" }}>
                      {format(new Date(leave.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <NewLeaveRequestModal 
        open={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={() => {
          fetchLeaves();
          setStatsRefreshKey((prev) => prev + 1);
        }} 
      />
    </Box>
  );
};

export default MyLeavesTable;
