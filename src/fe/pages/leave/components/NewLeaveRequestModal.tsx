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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Chip,
  Tooltip,
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
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Bereavement Leave",
  "Women's Monthly Wellness Leave",
  "Compensatory Leave (Comp-Off)",
  "Loss Of Pay (LOP / LWP)",
  "Sabbatical Leave",
];

const NewLeaveRequestModal: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Half day checkboxes state for Start Date and End Date
  const [startFirstHalf, setStartFirstHalf] = useState(false);
  const [startSecondHalf, setStartSecondHalf] = useState(false);
  const [endFirstHalf, setEndFirstHalf] = useState(false);
  const [endSecondHalf, setEndSecondHalf] = useState(false);

  const [formData, setFormData] = useState<LeaveRequestPayload>({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    daysRequested: 1,
    isHalfDay: false,
    halfDayOption: "Full Day",
    reason: "",
  });

  const isSameDate = formData.startDate && formData.endDate && formData.startDate === formData.endDate;

  // Sync End Date checkboxes with Start Date when single day selected
  React.useEffect(() => {
    if (isSameDate) {
      setEndFirstHalf(startFirstHalf);
      setEndSecondHalf(startSecondHalf);
    }
  }, [isSameDate, startFirstHalf, startSecondHalf]);

  // Calculate days requested and halfDayOption string automatically
  React.useEffect(() => {
    if (!formData.startDate || !formData.endDate) return;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // inclusive count

    if (totalCalendarDays === 1) {
      // Single Day calculation
      let dayVal = 1.0;
      let optionStr = "Full Day";
      let isHalf = false;

      if (startFirstHalf && !startSecondHalf) {
        dayVal = 0.5;
        optionStr = "1st Half (Morning)";
        isHalf = true;
      } else if (!startFirstHalf && startSecondHalf) {
        dayVal = 0.5;
        optionStr = "2nd Half (Afternoon)";
        isHalf = true;
      }

      setFormData((prev) => ({
        ...prev,
        daysRequested: dayVal,
        isHalfDay: isHalf,
        halfDayOption: optionStr,
      }));
    } else {
      // Multi-Day calculation
      // Portion for Start Date
      let startPortion = 1.0;
      let startHalfLabel = "";
      if (startSecondHalf && !startFirstHalf) {
        startPortion = 0.5;
        startHalfLabel = "Start Date: 2nd Half (Afternoon)";
      } else if (startFirstHalf && !startSecondHalf) {
        startPortion = 0.5;
        startHalfLabel = "Start Date: 1st Half (Morning)";
      }

      // Portion for End Date
      let endPortion = 1.0;
      let endHalfLabel = "";
      if (endFirstHalf && !endSecondHalf) {
        endPortion = 0.5;
        endHalfLabel = "End Date: 1st Half (Morning)";
      } else if (endSecondHalf && !endFirstHalf) {
        endPortion = 0.5;
        endHalfLabel = "End Date: 2nd Half (Afternoon)";
      }

      const intermediateDays = totalCalendarDays - 2; // full days between start and end date
      const totalCalculated = Math.max(0.5, startPortion + intermediateDays + endPortion);

      const isHalf = startPortion < 1.0 || endPortion < 1.0;
      let optionStr = "Full Day";

      if (startHalfLabel && endHalfLabel) {
        optionStr = `${startHalfLabel} & ${endHalfLabel}`;
      } else if (startHalfLabel) {
        optionStr = startHalfLabel;
      } else if (endHalfLabel) {
        optionStr = endHalfLabel;
      }

      setFormData((prev) => ({
        ...prev,
        daysRequested: totalCalculated,
        isHalfDay: isHalf,
        halfDayOption: optionStr,
      }));
    }
  }, [formData.startDate, formData.endDate, startFirstHalf, startSecondHalf, endFirstHalf, endSecondHalf, isSameDate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const { name, value } = e.target;

    if (name === "startDate") {
      setFormData((prev) => ({
        ...prev,
        startDate: value,
        endDate: prev.endDate && prev.endDate < value ? value : prev.endDate || value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "daysRequested" ? Number(value) : value,
      }));
    }
  };

  const handleCloseModal = () => {
    setErrorMsg(null);
    setStartFirstHalf(false);
    setStartSecondHalf(false);
    setEndFirstHalf(false);
    setEndSecondHalf(false);
    onClose();
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    if (!formData.startDate || !formData.endDate || !formData.reason) {
      setErrorMsg("Please fill all required fields");
      return;
    }

    if (formData.daysRequested <= 0) {
      setErrorMsg("Days requested must be greater than 0");
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
        <Box display="flex" flexDirection="column" gap={2.5} width="100%">
          {errorMsg && (
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
          )}

          {/* Row 1: Leave Type (Left) & Total Days Requested (Right) */}
          <Box display="flex" gap={2} alignItems="center" width="100%">
            <Box flex={1}>
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
            </Box>

            <Box flex={1}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 1.2, 
                  px: 2, 
                  borderRadius: 2, 
                  borderColor: "#cbd5e1",
                  backgroundColor: "#f8fafc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: "56px",
                  gap: 1
                }}
              >
                <Box sx={{ minWidth: 0, flexShrink: 0 }}>
                  <Typography variant="caption" color="#64748b" fontWeight="600" display="block" noWrap sx={{ fontSize: "0.75rem" }}>
                    Total Days Requested
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="700" color="#1e293b" sx={{ lineHeight: 1.2 }}>
                    {formData.daysRequested} Day(s)
                  </Typography>
                </Box>
                <Tooltip title={formData.isHalfDay ? (formData.halfDayOption || "Half Day Applied") : "Full Day Request"} arrow placement="top">
                  <Chip 
                    label={
                      formData.isHalfDay 
                        ? (formData.halfDayOption || "")
                            .replace("Start Date ", "Start ")
                            .replace("End Date ", "End ")
                            .replace(" (Morning)", "")
                            .replace(" (Afternoon)", "")
                        : "Full Day"
                    } 
                    size="small"
                    color={formData.isHalfDay ? "warning" : "primary"}
                    sx={{ 
                      fontWeight: 600, 
                      fontSize: "0.7rem", 
                      height: 24, 
                      flexShrink: 1, 
                      maxWidth: 160,
                      cursor: "pointer",
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }
                    }}
                  />
                </Tooltip>
              </Paper>
            </Box>
          </Box>

          {/* Row 2: Equal Height Side-by-Side Date Boxes */}
          <Box display="flex" gap={2} width="100%">
            <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2.5, borderColor: "#e2e8f0" }}>
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
                sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Typography variant="caption" fontWeight="700" color="#64748b" display="block" mb={0.5}>
                Start Date Half Day:
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={startFirstHalf}
                      onChange={(e) => {
                        setErrorMsg(null);
                        setStartFirstHalf(e.target.checked);
                        if (e.target.checked) setStartSecondHalf(false);
                      }}
                    />
                  }
                  label={<Typography variant="body2" fontSize="0.85rem">1st Half</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={startSecondHalf}
                      onChange={(e) => {
                        setErrorMsg(null);
                        setStartSecondHalf(e.target.checked);
                        if (e.target.checked) setStartFirstHalf(false);
                      }}
                    />
                  }
                  label={<Typography variant="body2" fontSize="0.85rem">2nd Half</Typography>}
                />
              </FormGroup>
            </Paper>

            <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2.5, borderColor: "#e2e8f0" }}>
              <TextField
                type="date"
                label="End Date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                fullWidth
                required
                disabled={Boolean(isSameDate && (startFirstHalf || startSecondHalf))}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: formData.startDate }}
                variant="outlined"
                sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              />
              <Typography variant="caption" fontWeight="700" color="#64748b" display="block" mb={0.5}>
                {isSameDate ? "End Date (Same Day):" : "End Date Half Day:"}
              </Typography>
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      disabled={Boolean(isSameDate)}
                      checked={endFirstHalf}
                      onChange={(e) => {
                        setErrorMsg(null);
                        setEndFirstHalf(e.target.checked);
                        if (e.target.checked) setEndSecondHalf(false);
                      }}
                    />
                  }
                  label={<Typography variant="body2" fontSize="0.85rem">1st Half</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      disabled={Boolean(isSameDate)}
                      checked={endSecondHalf}
                      onChange={(e) => {
                        setErrorMsg(null);
                        setEndSecondHalf(e.target.checked);
                        if (e.target.checked) setEndFirstHalf(false);
                      }}
                    />
                  }
                  label={<Typography variant="body2" fontSize="0.85rem">2nd Half</Typography>}
                />
              </FormGroup>
            </Paper>
          </Box>

          {/* Row 3: Full Width Reason Field */}
          <Box width="100%">
            <TextField
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Provide reason for your leave request..."
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleCloseModal} 
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
