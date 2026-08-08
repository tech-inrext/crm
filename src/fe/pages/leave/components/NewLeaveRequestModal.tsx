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
  IconButton,
} from "@mui/material";
import { 
  EventAvailable as EventAvailableIcon,
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { leaveApi } from "../leaveApi";
import { LeaveRequestPayload } from "../types";
import { toast } from "sonner";
import { animatedButtonSx } from "../styles";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

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

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  // Calculate days requested and halfDayOption string automatically (Excluding Sundays as Weekly Off)
  React.useEffect(() => {
    if (!formData.startDate || !formData.endDate) return;

    const [sY, sM, sD] = (formData.startDate as string).split("-").map(Number);
    const [eY, eM, eD] = (formData.endDate as string).split("-").map(Number);

    const start = new Date(sY, sM - 1, sD, 0, 0, 0);
    const end = new Date(eY, eM - 1, eD, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return;

    const isSingleDay = start.getTime() === end.getTime();

    if (isSingleDay) {
      if (start.getDay() === 0) {
        // Selected single date is Sunday
        setFormData((prev) => ({
          ...prev,
          daysRequested: 0,
          isHalfDay: false,
          halfDayOption: "Sunday (Weekly Off)",
        }));
        setErrorMsg("Selected date is a Sunday (Weekly Off). 0 leave days deducted.");
        return;
      }

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
      return;
    }

    // Multi-day calculation: iterate day by day and exclude Sundays (getDay() === 0)
    let totalDays = 0;
    let sundayCount = 0;
    const curr = new Date(start);

    let startHalfLabel = "";
    let endHalfLabel = "";

    while (curr <= end) {
      const isSun = curr.getDay() === 0;
      const isStartDay = curr.getTime() === start.getTime();
      const isEndDay = curr.getTime() === end.getTime();

      if (isSun) {
        sundayCount++;
      } else {
        let dayWeight = 1.0;

        if (isStartDay) {
          if (startSecondHalf && !startFirstHalf) {
            dayWeight = 0.5;
            startHalfLabel = "Start Date: 2nd Half (Afternoon)";
          } else if (startFirstHalf && !startSecondHalf) {
            dayWeight = 0.5;
            startHalfLabel = "Start Date: 1st Half (Morning)";
          }
        } else if (isEndDay) {
          if (endFirstHalf && !endSecondHalf) {
            dayWeight = 0.5;
            endHalfLabel = "End Date: 1st Half (Morning)";
          } else if (endSecondHalf && !endFirstHalf) {
            dayWeight = 0.5;
            endHalfLabel = "End Date: 2nd Half (Afternoon)";
          }
        }

        totalDays += dayWeight;
      }

      curr.setDate(curr.getDate() + 1);
    }

    const isHalf = Boolean(startHalfLabel || endHalfLabel);
    let optionStr = "Full Day";

    if (startHalfLabel && endHalfLabel) {
      optionStr = `${startHalfLabel} & ${endHalfLabel}`;
    } else if (startHalfLabel) {
      optionStr = startHalfLabel;
    } else if (endHalfLabel) {
      optionStr = endHalfLabel;
    }

    if (sundayCount > 0) {
      optionStr += ` (${sundayCount} Sunday${sundayCount > 1 ? "s" : ""} Excluded)`;
    }

    setFormData((prev) => ({
      ...prev,
      daysRequested: totalDays,
      isHalfDay: isHalf,
      halfDayOption: optionStr,
    }));
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
    setSelectedFile(null);
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
      let attachmentUrl = "";
      if (selectedFile) {
        try {
          const presignRes = await fetch("/api/v0/s3/upload-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              fileName: selectedFile.name, 
              fileType: selectedFile.type, 
              folder: "leavedoc" 
            }),
          });
          const presignJson = await presignRes.json();
          if (presignJson.uploadUrl) {
            await fetch(presignJson.uploadUrl, {
              method: "PUT",
              body: selectedFile,
              headers: { "Content-Type": selectedFile.type },
            });
            attachmentUrl = presignJson.fileUrl;
          }
        } catch (uploadErr) {
          console.error("Document upload failed:", uploadErr);
          toast.error("Failed to upload document");
          setLoading(false);
          return;
        }
      }

      const payload = {
        ...formData,
        attachmentUrl: attachmentUrl || undefined,
      };

      const res = await leaveApi.createRequest(payload);
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
              <AlertTitle sx={{ fontWeight: 700, fontSize: "0.95rem" }}>Leave Request Error</AlertTitle>
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

          {/* Row 2: Equal Height Side-by-Side Date Pickers */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" gap={2} width="100%">
              <Paper variant="outlined" sx={{ flex: 1, p: 2, borderRadius: 2.5, borderColor: "#e2e8f0" }}>
                <DatePicker
                  label="Start Date *"
                  format="DD/MM/YYYY"
                  disablePast
                  value={formData.startDate ? dayjs(formData.startDate) : null}
                  onChange={(newValue: Dayjs | null) => {
                    setErrorMsg(null);
                    const valStr = newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : "";
                    setFormData((prev) => {
                      const newEndDate = prev.endDate && dayjs(prev.endDate).isBefore(newValue) ? valStr : prev.endDate;
                      return {
                        ...prev,
                        startDate: valStr,
                        endDate: newEndDate,
                      };
                    });
                  }}
                  shouldDisableDate={(date: Dayjs) => date.day() === 0}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: "outlined",
                      sx: { mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                    },
                  }}
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
                <DatePicker
                  label="End Date *"
                  format="DD/MM/YYYY"
                  disablePast
                  value={formData.endDate ? dayjs(formData.endDate) : null}
                  minDate={formData.startDate ? dayjs(formData.startDate) : dayjs()}
                  disabled={Boolean(isSameDate && (startFirstHalf || startSecondHalf))}
                  onChange={(newValue: Dayjs | null) => {
                    setErrorMsg(null);
                    const valStr = newValue && newValue.isValid() ? newValue.format("YYYY-MM-DD") : "";
                    setFormData((prev) => ({
                      ...prev,
                      endDate: valStr,
                    }));
                  }}
                  shouldDisableDate={(date: Dayjs) => date.day() === 0}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      variant: "outlined",
                      sx: { mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                    },
                  }}
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
        </LocalizationProvider>

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
              rows={2}
              placeholder="Provide reason for your leave request..."
              variant="outlined"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Box>

          {/* Row 4: Document Attachment Upload */}
          <Box width="100%">
            <Typography variant="caption" fontWeight="700" color="#64748b" display="block" mb={0.8}>
              Attach Document / Medical Certificate (Optional):
            </Typography>
            {!selectedFile ? (
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon sx={{ color: "#1976d2" }} />}
                fullWidth
                sx={{
                  py: 1.2,
                  borderRadius: 2,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  borderStyle: "dashed",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": { borderColor: "#1976d2", bgcolor: "#f0f7ff" },
                }}
              >
                Upload Document (PDF, PNG, JPG, DOC)
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                />
              </Button>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.2,
                  px: 2,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  bgcolor: "#f0f7ff",
                  borderColor: "#93c5fd",
                }}
              >
                <Box display="flex" alignItems="center" gap={1.2} overflow="hidden">
                  <AttachFileIcon sx={{ color: "#0288d1", fontSize: 20 }} />
                  <Box overflow="hidden">
                    <Typography variant="body2" fontWeight="700" color="#0369a1" noWrap>
                      {selectedFile.name}
                    </Typography>
                    <Typography variant="caption" color="#64748b">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                </Box>
                <Tooltip title="Remove attachment">
                  <IconButton size="small" color="error" onClick={() => setSelectedFile(null)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Paper>
            )}
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
