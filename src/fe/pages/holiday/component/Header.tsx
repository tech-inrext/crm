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
import HolidayDialog from "@/fe/pages/holiday/hooks/Addholiday";

const tabs = [
  { label: "Upcoming Holidays", key: "upcoming" },
  { label: "Past Holidays", key: "past" },
];

// ✅ ACCEPT onRefresh PROP
export default function Header({ onRefresh }) {
  const [activeTab, setActiveTab] = useState("upcoming");

  const [openHoliday, setOpenHoliday] = useState(false);
  const [openLeave, setOpenLeave] = useState(false);

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

  const handleChange = (_: any, newValue: string) => {
    setActiveTab(newValue);
  };

  const getDays = () => {
    if (!leave.start_date || !leave.end_date) return 0;
    const start = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    return (
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
    );
  };

  // ✅ HOLIDAY SUBMIT WITH REFRESH
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

        // 🔥 TRIGGER RE-RENDER
        onRefresh && onRefresh();

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

  // ✅ LEAVE SUBMIT WITH REFRESH
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

        // 🔥 TRIGGER RE-RENDER
        onRefresh && onRefresh();

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
      <Box className="px-6 py-3 mr-2 bg-white rounded-xl border border-gray-200 mb-5 max-w-full shadow-sm">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          flexWrap="wrap"
        >
          {/* Tabs */}
          <Tabs
            value={activeTab}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            TabIndicatorProps={{ style: { display: "none" } }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.key}
                value={tab.key}
                label={tab.label}
                className={`!normal-case !text-sm !font-medium !rounded-lg !px-4 !py-2
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
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => setOpenLeave(true)}
            >
              Apply Leave
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenHoliday(true)}
            >
              Add Holiday
            </Button>
          </Box>
        </Stack>
      </Box>

      {/* HOLIDAY MODAL */}
      <HolidayDialog
        open={openHoliday}
        onClose={() => setOpenHoliday(false)}
        holiday={holiday}
        setHoliday={setHoliday}
        onSubmit={handleHolidaySubmit}
      />

      {/* LEAVE MODAL */}
      <Dialog open={openLeave} onClose={() => setOpenLeave(false)} fullWidth maxWidth="sm">
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
              onChange={(e) =>
                setLeave({ ...leave, reason: e.target.value })
              }
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
          <Button variant="contained" onClick={handleLeaveSubmit}>
            Apply Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}