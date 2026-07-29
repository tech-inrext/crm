import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Box,
  Typography,
  Alert,
  AlertTitle,
} from "@mui/material";
import { 
  EventAvailable as EventAvailableIcon,
  Send as SendIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequestPayload } from "../types";
import { toast } from "sonner";
import { animatedButtonSx } from "../styles";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LEAVE_TYPES = [
  "Sick Leave",
  "Casual Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
];

const NewLeaveRequestModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeaveRequestPayload>({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    daysRequested: 1,
    reason: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "daysRequested" ? Number(value) : value,
    }));
  };

  const handleCloseModal = () => {
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setErrorMsg("Please fill all required fields");
      return;
    }
    
    setLoading(true);
    try {
      const res = await leaveApi.createRequest(formData);
      if (res?.success) {
        toast.success("Leave request submitted successfully");
        onSuccess();
        handleCloseModal();
      } else {
        setErrorMsg(res?.message || "Failed to submit leave request");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "An error occurred";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleCloseModal} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" } }}
    >
      <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
        <Box display="flex" alignItems="center" gap={1}>
          <EventAvailableIcon sx={{ color: "#1976d2", fontSize: 28 }} />
          <Typography variant="h6" fontWeight="700" color="#1e293b">
            Apply for Leave
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: "16px !important" }}>
        <Grid container spacing={2.5}>
          {errorMsg && (
            <Grid item xs={12}>
              <Alert 
                severity="error" 
                variant="filled"
                onClose={() => setErrorMsg(null)}
                sx={{ 
                  borderRadius: 2.5, 
                  boxShadow: "0 4px 16px rgba(211, 47, 47, 0.2)",
                  backgroundColor: "#ef4444",
                  fontWeight: 500,
                  fontSize: "0.875rem"
                }}
              >
                <AlertTitle sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Quota Limit Error</AlertTitle>
                {errorMsg}
              </Alert>
            </Grid>
          )}
          <Grid item xs={12}>
            <TextField
              select
              label="Leave Type"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              fullWidth
              required
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {LEAVE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="date"
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              type="number"
              label="Days Requested"
              name="daysRequested"
              value={formData.daysRequested}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ min: 0.5, step: 0.5 }}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ color: "text.secondary", fontWeight: 600, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          startIcon={!loading && <SendIcon />}
          sx={animatedButtonSx}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Submit Request"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewLeaveRequestModal;
