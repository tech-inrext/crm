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
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

// ✅ FIX: Date Picker Provider Imports
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
const audiences = ["All", "Teams", "Roles"];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddNoticeModal({ open, onClose }: Props) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [priority, setPriority] = useState<string>(priorities[2]);
  const [audience, setAudience] = useState<string>(audiences[0]);
  const [expiry, setExpiry] = useState<Dayjs | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  const handleSubmit = () => {
    const data = {
      title,
      description,
      category,
      priority,
      audience,
      expiry: expiry ? expiry.format("YYYY-MM-DD") : null,
      attachments,
    };

    console.log("Submitting Notice:", data);

    // 👉 Add API call here

    onClose();
  };

  return (
    // ✅ FIX: Wrap with LocalizationProvider
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        
        {/* Header */}
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
          Create New Notice
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", right: 16, top: 16 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent dividers>
          <Stack spacing={2}>

            {/* Title */}
            <TextField
              label="Notice Title"
              placeholder="e.g., New Project Launch..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
            />

            {/* Description */}
            <TextField
              label="Description"
              placeholder="Provide the full details here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              minRows={4}
              size="small"
            />

            {/* Category + Priority */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as string)}
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
                  label="Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as string)}
                >
                  {priorities.map((pri) => (
                    <MenuItem key={pri} value={pri}>
                      {pri}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

            </Stack>

            {/* Audience + Date */}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              
              <FormControl fullWidth size="small">
                <InputLabel>Audience</InputLabel>
                <Select
                  label="Audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value as string)}
                >
                  {audiences.map((aud) => (
                    <MenuItem key={aud} value={aud}>
                      {aud}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Expiry Date"
                value={expiry}
                onChange={(newValue) => setExpiry(newValue)}
                slotProps={{
                  textField: { size: "small", fullWidth: true },
                }}
              />

            </Stack>

            {/* Attachments */}
            <Box>
              <Typography fontWeight={500} mb={0.5}>
                Attachments (optional)
              </Typography>

              <Button variant="outlined" component="label" size="small">
                Upload File
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileChange}
                />
              </Button>

              {attachments.length > 0 && (
                <Box mt={1}>
                  {attachments.map((file, idx) => (
                    <Typography key={idx} fontSize={13}>
                      {file.name}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>

          </Stack>
        </DialogContent>

        {/* Actions */}
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Publish Notice
          </Button>
        </DialogActions>

      </Dialog>
    </LocalizationProvider>
  );
}