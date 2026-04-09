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
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Switch,
  FormControlLabel,
  Box,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useNoticeMeta } from "../hooks/useNoticeMeta";
import { useNoticeForm } from "../hooks/useNoticeForm";

export default function NoticeEditDialog({ open, onClose, notice }: any) {
  const { categories, priorities, loading, departments, avps } = useNoticeMeta();
  const { form, setForm } = useNoticeForm(notice);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<any[]>(notice?.attachments || []);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(
    notice?.departments || notice?.targetAVP || ""
  );

  const isAdmin = true; // Replace with actual role check if needed

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).map((file) => ({
      id: Math.random(),
      file,
      customName: file.name,
    }));
    setPendingFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (id: number) => {
    setPendingFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdate = async () => {
    await axios.put(`/api/v0/notice/${notice._id}`, {
      ...form,
      expiry: form.expiry ? form.expiry.toISOString() : null,
      attachments: pendingFiles,
      departments: selectedDepartment,
    });

    onClose();
    window.location.reload();
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
            <FormControl fullWidth size="small" className="!rounded-md !border !border-gray-300">
              <InputLabel shrink={!!form.description} className="!bg-white !px-1">
                Notice Description
              </InputLabel>
              <Box className="!rounded-md cursor-text p-2">
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={5}
                  className="w-full border-none outline-none resize-none"
                />
              </Box>
            </FormControl>

            {/* CATEGORY + PRIORITY */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={form.category || ""}
                  onChange={handleChange}
                  label="Category"
                >
                  {loading ? (
                    <MenuItem>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    categories.map((cat: any) => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)
                  )}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  name="priority"
                  value={form.priority || ""}
                  onChange={handleChange}
                  label="Priority"
                >
                  {loading ? (
                    <MenuItem>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    priorities.map((pri: any) => <MenuItem key={pri} value={pri}>{pri}</MenuItem>)
                  )}
                </Select>
              </FormControl>
            </Stack>

            {/* DEPARTMENT + EXPIRY in one row */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="department-label">{isAdmin ? "Department" : "Departments"}</InputLabel>
                <Select
                  labelId="department-label"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  size="small"
                >
                  {isAdmin
                    ? avps?.map((a) => <MenuItem key={a._id} value={a._id}>{a.name}</MenuItem>)
                    : departments?.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
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
                  onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
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
                  className="!text-xs !font-semibold !text-blue-600 hover:!text-blue-800 !min-w-0"
                >
                  Add files
                </Button>
              </Box>
              <input ref={fileInputRef} type="file" multiple hidden onChange={handleFilePick} />
              {pendingFiles.map((p) => (
                <Box key={p.id} className="flex items-center justify-between border border-gray-200 rounded px-3 py-2">
                  <Typography className="text-sm text-gray-700">{p.customName || p.filename}</Typography>
                  <Button
                    size="small"
                    color="error"
                    className="!text-xs !min-w-0"
                    onClick={() => handleRemoveFile(p.id)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
              {!pendingFiles.length && (
                <Typography className="text-sm text-gray-400">No attachments added</Typography>
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