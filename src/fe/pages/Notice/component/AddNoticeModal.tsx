"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Stack,
  IconButton,
  Typography,
  Box,
  CircularProgress,
  Switch,
  FormControlLabel,
} from "../../../../components/ui/Component";

import CloseIcon from "@mui/icons-material/Close";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs, { Dayjs } from "dayjs";

const categories = [
  "General Announcements",
  "Project Updates",
  "Pricing / Offers",
  "Sales Targets",
  "Urgent Alerts",
  "HR / Internal",
];

const priorities = ["Urgent", "Important", "Info"];
const departments = ["All", "Teams", "Roles"];

type Props = {
  open: boolean;
  onClose: () => void;
  onNoticeAdded: () => void;
};

export default function AddNoticeModal({
  open,
  onClose,
  onNoticeAdded,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState(priorities[2]);
  const [selectedDepartment, setSelectedDepartment] = useState(departments[0]);
  const [expiry, setExpiry] = useState<Dayjs | null>(null);
  const [pinned, setPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(categories[0]);
    setPriority(priorities[2]);
    setSelectedDepartment(departments[0]);
    setExpiry(null);
    setPinned(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/v0/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          priority,
          departments: selectedDepartment,
          expiry: expiry ? expiry.format("YYYY-MM-DD") : null,
          pinned,
        }),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      resetForm();
      onClose();
      onNoticeAdded(); 
    } catch (error) {
      console.error("Notice Create Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
          Create New Notice
          <IconButton onClick={onClose} className="!absolute !right-4 !top-4">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Notice Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              className="bg-white rounded-lg"
            />

            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              size="small"
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  {priorities.map((pri) => (
                    <MenuItem key={pri} value={pri}>
                      {pri}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Departments</InputLabel>
                <Select
                  value={selectedDepartment}
                  label="Departments"
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Expiry Date"
                value={expiry}
                onChange={(val) => setExpiry(val)}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />
            </Stack>

            <Box className="bg-gray-50 rounded-lg p-1 border">
              <FormControlLabel
                control={
                  <Switch
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                  />
                }
                label="Pin this notice to top"
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>

          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "Publish Notice"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
