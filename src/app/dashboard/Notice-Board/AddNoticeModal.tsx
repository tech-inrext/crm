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
} from "@mui/material";

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
const audiences = ["All", "Teams", "Roles"];

type Props = {
  open: boolean;
  onClose: () => void;
  onNoticeAdded?: () => void; // 🔥 refresh dashboard
};

export default function AddNoticeModal({
  open,
  onClose,
  onNoticeAdded,
}: Props) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>(categories[0]);
  const [priority, setPriority] = useState<string>(priorities[2]);
  const [audience, setAudience] = useState<string>(audiences[0]);
  const [expiry, setExpiry] = useState<Dayjs | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  // ✅ API Submit
  const handleSubmit = async () => {
    if (!title || !description) {
      alert("Title and Description are required");
      return;
    }

    try {
      setLoading(true);

      const data = {
        title,
        description,
        category,
        priority,
        audience,
        expiry: expiry ? expiry.format("YYYY-MM-DD") : null,
        pinned: priority === "Urgent",
      };

      const res = await fetch("/api/v0/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (result.success) {
        alert("Notice created successfully");

        // 🔄 Reset form
        setTitle("");
        setDescription("");
        setCategory(categories[0]);
        setPriority(priorities[2]);
        setAudience(audiences[0]);
        setExpiry(null);
        setAttachments([]);

        onClose();

        // 🔥 refresh dashboard
        if (onNoticeAdded) {
          onNoticeAdded();
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Notice Error:", error);
      alert("Failed to create notice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

        {/* Header */}
        <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
          Create New Notice
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", right: 16, top: 16 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {/* Content */}
        <DialogContent dividers>
          <Stack spacing={2}>

            <TextField
              label="Notice Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
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
                <InputLabel>Audience</InputLabel>
                <Select
                  value={audience}
                  label="Audience"
                  onChange={(e) => setAudience(e.target.value)}
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
                <input hidden type="file" multiple onChange={handleFileChange} />
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

          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Publish Notice"
            )}
          </Button>
        </DialogActions>

      </Dialog>
    </LocalizationProvider>
  );
}