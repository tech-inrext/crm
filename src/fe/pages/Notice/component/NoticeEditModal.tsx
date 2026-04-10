"use client";

import React, { useRef, useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  TextField,
  Button,
  Stack,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useNoticeMeta } from "../hooks/useNoticeMeta";
import { useNoticeForm } from "../hooks/useNoticeForm";

export default function NoticeEditDialog({ open, onClose, notice }: any) {
  const { categories, priorities, loading, departments, avps } =
    useNoticeMeta();
  const { form, setForm } = useNoticeForm(notice);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ------------------- FIXED -------------------
  const [pendingFiles, setPendingFiles] = useState<any[]>(
    (notice?.attachments || []).map((f, index) => ({
      id: Date.now() + index, // ✅ unique id for React key and removal
      filename: f.filename || f.name,
      url: f.url,
      customName: f.filename || f.name,
    })),
  );
  const [selectedDepartment, setSelectedDepartment] = useState<any>(
    notice?.departments || notice?.targetAVP || "",
  );

  const isAdmin = true; // Replace with actual role check if needed
  // ------------------- END FIXED -------------------

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // ------------------- FIXED -------------------
    const files = Array.from(e.target.files).map((file, index) => ({
      id: Date.now() + index, // ✅ unique ID
      file,
      customName: file.name,
    }));
    setPendingFiles((prev) => [...prev, ...files]);
    // ------------------- END FIXED -------------------
  };

  const handleRemoveFile = (id: number) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const uploadToS3 = async (file: File) => {
    const res = await fetch("/api/v0/s3/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, fileType: file.type }),
    });
    const data = await res.json();
    await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    return data.fileUrl;
  };

  const handleUpdate = async () => {
    try {
      const updatedAttachments = await Promise.all(
        pendingFiles.map(async (f) => {
          if (f.file) {
            const url = await uploadToS3(f.file);
            return { filename: f.customName || f.file.name, url };
          }
          return { filename: f.customName || f.filename, url: f.url || "" };
        }),
      );

      await axios.put(`/api/v0/notice/${notice._id}`, {
        ...form,
        expiry: form.expiry ? form.expiry.toISOString() : null,
        attachments: updatedAttachments,
        departments: selectedDepartment,
      });

      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error("Update failed:", err);
      alert("Failed to update notice. Please try again.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          Edit Notice
          <IconButton onClick={onClose} className="!absolute right-2 top-2">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {/* TITLE */}
            <TextField
              label="Notice Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            {/* DESCRIPTION */}
            <TextField
              label="Notice Description"
              name="description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              fullWidth
              multiline
              rows={5}
              size="small"
            />

            {/* CATEGORY + PRIORITY */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Category"
                  name="category"
                  value={form.category || ""}
                  onChange={handleChange}
                >
                  {loading ? (
                    <MenuItem>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    categories.map((cat: any) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  label="Priority"
                  name="priority"
                  value={form.priority || ""}
                  onChange={handleChange}
                >
                  {loading ? (
                    <MenuItem>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    priorities.map((pri: any) => (
                      <MenuItem key={pri} value={pri}>
                        {pri}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Stack>

            {/* DEPARTMENT + EXPIRY */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="dept-label">
                  {isAdmin ? "Department" : "Departments"}
                </InputLabel>
                <Select
                  labelId="dept-label"
                  label={isAdmin ? "Department" : "Departments"}
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                >
                  {isAdmin
                    ? avps?.map((a) => (
                        <MenuItem key={a._id} value={a._id}>
                          {a.name}
                        </MenuItem>
                      ))
                    : departments?.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                </Select>
              </FormControl>

              <DatePicker
                label="Expiry Date"
                value={form.expiry}
                onChange={(val) => setForm({ ...form, expiry: val })}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Stack>

            {/* PINNED SWITCH */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.pinned}
                  onChange={(e) =>
                    setForm({ ...form, pinned: e.target.checked })
                  }
                />
              }
              label="Pin this notice"
            />

            {/* ATTACHMENTS */}
            <Box className="flex flex-col gap-2">
              <Box className="flex items-center justify-between">
                <Typography className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  ATTACHMENTS
                </Typography>
                <Button
                  startIcon={<UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
                  size="small"
                  variant="text"
                >
                  Add files
                </Button>
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={handleFilePick}
              />
              {pendingFiles.map((p) => (
                <Box
                  key={p.id} // ✅ unique key fixes removal
                  className="flex items-center justify-between border border-gray-200 rounded px-3 py-2"
                >
                  <Typography className="text-sm text-gray-700">
                    {p.customName || p.filename || (p.file && p.file.name)}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFile(p.id)} // ✅ remove only this file
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              {!pendingFiles.length && (
                <Typography className="text-sm text-gray-400">
                  No attachments added
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate}>
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
