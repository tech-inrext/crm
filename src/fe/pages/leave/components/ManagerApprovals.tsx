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
  Avatar,
  Chip,
} from "@mui/material";
import { 
  FactCheck as FactCheckIcon,
  CheckCircleOutline as ApproveIcon,
  CancelOutlined as RejectIcon,
  InboxOutlined as InboxIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequest } from "../types";
import { toast } from "sonner";
import { format } from "date-fns";
import { tableContainerSx, tableHeaderSx, tableRowSx, animatedButtonSx } from "../styles";

const ManagerApprovals: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [actionModal, setActionModal] = useState<"Approved" | "Rejected" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.getManagerPending();
      if (res?.success) {
        setLeaves(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleActionClick = (leave: LeaveRequest, action: "Approved" | "Rejected") => {
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
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <FactCheckIcon sx={{ color: "#1976d2", fontSize: 28 }} />
        <Typography variant="h5" fontWeight="700" color="#1e293b">
          Pending Approvals
        </Typography>
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
                <TableCell>Employee</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell align="center">Days</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: "#64748b" }}>
                    <InboxIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                    <Typography>No pending approvals.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => {
                  const emp: any = leave.employeeId;
                  return (
                    <TableRow key={leave._id} sx={tableRowSx}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar src={emp.photo} sx={{ width: 36, height: 36, bgcolor: "#1976d2" }}>{emp.name?.[0]}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="600" color="#334155">{emp.name}</Typography>
                            <Typography variant="caption" color="#94a3b8">{emp.employeeProfileId}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography fontWeight="600" color="#334155">{leave.leaveType}</Typography>
                      </TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={`${leave.daysRequested} Day(s)`} size="small" variant="outlined" sx={{ fontWeight: 600, borderColor: "#cbd5e1" }} />
                      </TableCell>
                      <TableCell sx={{ color: "#475569", maxWidth: 200, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {leave.reason}
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" justifyContent="flex-end" gap={1}>
                          <Button 
                            size="small" 
                            color="success" 
                            variant="contained" 
                            startIcon={<ApproveIcon />}
                            sx={{ ...animatedButtonSx, px: 2, py: 0.5, boxShadow: "none", "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 10px rgba(46, 125, 50, 0.2)" } }}
                            onClick={() => handleActionClick(leave, "Approved")}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="small" 
                            color="error" 
                            variant="outlined"
                            startIcon={<RejectIcon />}
                            sx={{ ...animatedButtonSx, px: 2, py: 0.5, boxShadow: "none", "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 10px rgba(211, 47, 47, 0.2)" } }}
                            onClick={() => handleActionClick(leave, "Rejected")}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
    </Box>
  );
};

export default ManagerApprovals;
