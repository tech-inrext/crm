"use client";

import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import HolidayDialog from "@/fe/pages/holiday/hooks/Addholiday";

export default function Header({ onRefresh }) {
  const [openHoliday, setOpenHoliday] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);

  const [loadingHoliday, setLoadingHoliday] = useState(false);
  const [loadingLeave, setLoadingLeave] = useState(false);

  const [holiday, setHoliday] = useState({
    name: "",
    date: "",
    type: "public",
    applicable_to: "all",
    impact_level: "high",
    region: "India",
    is_recurring: false,
    description: "",
  });

  const [leave, setLeave] = useState({
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
    handover_to: "",
  });

  const getDays = () => {
    if (!leave.start_date || !leave.end_date) return 0;
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  // ✅ HOLIDAY SUBMIT
  const handleHolidaySubmit = async () => {
    try {
      setLoadingHoliday(true);

      const res = await fetch("/api/v0/holiday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holiday),
      });

      const data = await res.json();

      if (data.success) {
        onRefresh?.(); // ✅ clean call

        setHoliday({
          name: "",
          date: "",
          type: "public",
          applicable_to: "all",
          impact_level: "high",
          region: "India",
          is_recurring: false,
          description: "",
        });

        setOpenHoliday(false);
      } else {
        alert(data.message || "Error adding holiday");
      }
    } catch (error) {
      console.error("Holiday Error:", error);
    } finally {
      setLoadingHoliday(false);
    }
  };

  // ✅ LEAVE SUBMIT
  const handleLeaveSubmit = async () => {
    try {
      setLoadingLeave(true);

      const res = await fetch("/api/v0/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(leave),
      });

      const data = await res.json();

      if (data.success) {
        onRefresh?.(); // ✅ clean call

        setLeave({
          leave_type: "casual",
          start_date: "",
          end_date: "",
          reason: "",
          handover_to: "",
        });

        setOpenLeave(false);
      } else {
        alert(data.message || "Error applying leave");
      }
    } catch (error) {
      console.error("Leave Error:", error);
    } finally {
      setLoadingLeave(false);
    }
  };

  return (
    <Box className="w-full px-4 pt-1">
      <Box className="px-6 py-3 mr-2 bg-white rounded-xl border border-gray-200 mb-5 shadow-sm flex justify-between items-center">
        {/* LEFT: Search */}
        <TextField
          size="small"
          placeholder="Search..."
          variant="outlined"
          sx={{ width: 340 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* RIGHT: Buttons */}
        <Box className="flex gap-2">
          {/* Apply Leave */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenLeave(true)}
          >
            Apply Leave
          </Button>

          {/* Add Holiday */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenHoliday(true)}
          >
            Add Holiday
          </Button>
        </Box>
      </Box>

      {/* HOLIDAY MODAL */}
      <HolidayDialog
        open={openHoliday}
        onClose={() => setOpenHoliday(false)}
        holiday={holiday}
        setHoliday={setHoliday}
        onSubmit={handleHolidaySubmit}
        loading={loadingHoliday}
      />

      {/* LEAVE MODAL */}
      <Dialog
        open={openLeave}
        onClose={() => setOpenLeave(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Apply Leave
          <IconButton
            onClick={() => setOpenLeave(false)}
            className="!absolute !right-4 !top-4"
          >
            ✕
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Leave Type</InputLabel>
              <Select
                value={leave.leave_type}
                label="Leave Type"
                onChange={(e) =>
                  setLeave({ ...leave, leave_type: e.target.value })
                }
              >
                <MenuItem value="casual">Casual</MenuItem>
                <MenuItem value="sick">Sick</MenuItem>
                <MenuItem value="earned">Earned</MenuItem>
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={leave.start_date}
                onChange={(e) =>
                  setLeave({ ...leave, start_date: e.target.value })
                }
                fullWidth
                size="small"
              />
              <TextField
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={leave.end_date}
                onChange={(e) =>
                  setLeave({ ...leave, end_date: e.target.value })
                }
                fullWidth
                size="small"
              />
            </Stack>

            <TextField
              label="Duration"
              value={`${getDays()} Days`}
              disabled
              fullWidth
              size="small"
            />

            <TextField
              label="Reason"
              multiline
              rows={3}
              value={leave.reason}
              onChange={(e) => setLeave({ ...leave, reason: e.target.value })}
              fullWidth
              size="small"
            />

            <TextField
              label="Work Handover To"
              value={leave.handover_to}
              onChange={(e) =>
                setLeave({ ...leave, handover_to: e.target.value })
              }
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenLeave(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleLeaveSubmit}
            disabled={loadingLeave}
          >
            {loadingLeave ? "Applying..." : "Apply Leave"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
