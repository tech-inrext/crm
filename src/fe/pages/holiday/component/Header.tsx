"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
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
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
const tabs = [
  { label: "Upcoming Holidays", key: "upcoming" },
  { label: "Past Holidays", key: "past" },
  { label: "Leave Requests", key: "leave" },
];

export default function Header() {
  const [activeTab, setActiveTab] = useState("upcoming");

  // Modal states
  const [openHoliday, setOpenHoliday] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);

  // Form states
  // Holiday State (PRO)
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

  // Leave State (PRO)
  const [leave, setLeave] = useState({
    leave_type: "casual",
    start_date: "",
    end_date: "",
    reason: "",
    handover_to: "",
  });

  const handleChange = (_: any, newValue: string) => {
    setActiveTab(newValue);
  };

  // Auto calculate days
  const getDays = () => {
    if (!leave.start_date || !leave.end_date) return 0;
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  // Submit handlers
 const handleHolidaySubmit = async () => {
  try {
    const res = await fetch("/api/v0/holiday", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(holiday),
    });

    const data = await res.json();

    if (data.success) {
      alert("Holiday Added Successfully ✅");

      // reset form
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
   }
};

 const handleLeaveSubmit = async () => {
  try {
    const res = await fetch("/api/v0/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leave),
    });

    const data = await res.json();

    if (data.success) {
      alert("Leave Applied Successfully ✅");

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
  }
};
  return (
    <Box className="w-full px-4 pt-1">
      <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3">
        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { display: "none" } }}
          className="!min-h-0"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              label={tab.label}
              className={`!normal-case !text-sm !font-medium !rounded-lg !px-4 !py-2 !min-h-0
            ${
              activeTab === tab.key
                ? "!bg-blue-600 !text-white"
                : "!text-gray-600 hover:!bg-gray-100"
            }`}
            />
          ))}
        </Tabs>

        {/* Buttons */}
        <Box className="flex gap-2 flex-wrap justify-end">
          {/* Apply Leave (Secondary) */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setOpenLeave(true)}
            className="!normal-case !rounded-lg !border-gray-300 !text-gray-700 hover:!bg-gray-100"
          >
            Apply Leave
          </Button>

          {/* Add Holiday (Primary) */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenHoliday(true)}
            className="!normal-case !rounded-lg !bg-blue-600 hover:!bg-blue-700"
          >
            Add Holiday
          </Button>
        </Box>
      </Box>

      {/* ================= HOLIDAY MODAL ================= */}
      <Dialog
        open={openHoliday}
        onClose={() => setOpenHoliday(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Add Holiday
          <IconButton
            onClick={() => setOpenHoliday(false)}
            className="!absolute !right-4 !top-4"
          >
            ✕
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {/* HOLIDAY NAME */}
            <TextField
              label="Holiday Name"
              value={holiday.name}
              onChange={(e) => setHoliday({ ...holiday, name: e.target.value })}
              fullWidth
              size="small"
            />

            {/* DATE */}

            {/* TYPE + IMPACT */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={holiday.type}
                  label="Type"
                  onChange={(e) =>
                    setHoliday({ ...holiday, type: e.target.value })
                  }
                >
                  <MenuItem value="public">Public</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="optional">Optional</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Impact</InputLabel>
                <Select
                  value={holiday.impact_level}
                  label="Impact"
                  onChange={(e) =>
                    setHoliday({ ...holiday, impact_level: e.target.value })
                  }
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            {/* APPLICABLE + REGION */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Applicable To</InputLabel>
                <Select
                  value={holiday.applicable_to}
                  label="Applicable To"
                  onChange={(e) =>
                    setHoliday({ ...holiday, applicable_to: e.target.value })
                  }
                >
                  <MenuItem value="all">All Employees</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="support">Support</MenuItem>
                </Select>
              </FormControl>

              <TextField
                type="date"
                label="Holiday Date"
                InputLabelProps={{ shrink: true }}
                value={holiday.date}
                onChange={(e) =>
                  setHoliday({ ...holiday, date: e.target.value })
                }
                fullWidth
                size="small"
              />
            </Stack>

            {/* DESCRIPTION */}
            <TextField
              label="Description"
              multiline
              rows={3}
              value={holiday.description}
              onChange={(e) =>
                setHoliday({ ...holiday, description: e.target.value })
              }
              fullWidth
              size="small"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenHoliday(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleHolidaySubmit}>
            Save Holiday
          </Button>
        </DialogActions>
      </Dialog>
      {/* ================= LEAVE MODAL ================= */}
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
            {/* LEAVE TYPE */}
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

            {/* DATES */}
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

            {/* DURATION */}
            <TextField
              label="Duration"
              value={`${getDays()} Days`}
              disabled
              fullWidth
              size="small"
            />

            {/* REASON */}
            <TextField
              label="Reason"
              multiline
              rows={3}
              value={leave.reason}
              onChange={(e) => setLeave({ ...leave, reason: e.target.value })}
              fullWidth
              size="small"
            />

            {/* HANDOVER */}
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
          <Button variant="contained" onClick={handleLeaveSubmit}>
            Apply Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
