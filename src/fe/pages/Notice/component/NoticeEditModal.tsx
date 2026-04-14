"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
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
  const { categories, priorities, loading, departments } = useNoticeMeta();
  const { form, setForm } = useNoticeForm(notice);
  const [avpList, setAvpList] = useState([]);
  useEffect(() => {
    fetch("/api/v0/employee/getAllAVPEmployees")
      .then((res) => res.json())
      .then((data) => setAvpList(data?.data || []))
      .catch(() => setAvpList([]));
  }, []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ FILE STATE (UNCHANGED)
  const [pendingFiles, setPendingFiles] = useState<any[]>([]);

  // ✅ FIXED: correct initialization
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");

  const auth = useAuth();

  const isSystemAdmin = Boolean(auth?.isSystemAdmin);

  const isAVP =
    auth?.isAVP === true ||
    auth?.user?.isAVP === true ||
    auth?.user?.role?.isAVP === true; // replace with real role
  // ✅ ADD THIS (DO NOT REMOVE YOUR EXISTING CODE)
  // ✅ FINAL WORKING LOGIC (same behavior as your first file)
  useEffect(() => {
    if (!open || !notice) return;

    if (isSystemAdmin) {
      if (!avpList || avpList.length === 0) return;

      const value = notice?.targetAVP || "All";
      setSelectedDepartment(value);
    } else if (isAVP) {
      if (!departments || departments.length === 0) return;

      const value = notice?.departments?.[0] || "All";
      setSelectedDepartment(value);
    }
  }, [open, notice, avpList, departments, isSystemAdmin, isAVP]);
  useEffect(() => {
    if (!open || !notice) return;

    // attachments
    setPendingFiles(
      (notice?.attachments || []).map((f: any, index: number) => ({
        id: Date.now() + index,
        filename: f.filename || f.name,
        url: f.url,
        customName: f.filename || f.name,
      })),
    );

    // ✅ FIX: normalize selected department
    // ✅ ONLY set initially if not already set
    if (!selectedDepartment) {
      if (isSystemAdmin) {
        setSelectedDepartment(notice?.targetAVP || "All");
      } else {
        setSelectedDepartment(notice?.departments?.[0] || "All");
      }
    }
  }, [open, notice]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const finalDepartments = isAVP ? ["All", "Team"] : departments || [];
  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).map((file, index) => ({
      id: Date.now() + index,
      file,
      customName: file.name,
    }));

    setPendingFiles((prev) => [...prev, ...files]);
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

        // ✅ FIX: payload correct
        ...(isSystemAdmin
          ? {
              targetAVP:
                selectedDepartment !== "All" ? selectedDepartment : null,
              departments: ["All"],
            }
          : {
              departments: [selectedDepartment],
            }),
      });

      onClose();
      window.location.reload();
    } catch (err: any) {
      console.error("Update failed:", err);
      alert("Failed to update notice. Please try again.");
    }
  };

  // ✅ SAFETY: wait until data ready
  if (!open) return null;

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
            <FormControl fullWidth size="small">
              <InputLabel shrink={!!form.description}>
                Notice Description
              </InputLabel>
              <Box className="!rounded-md cursor-text p-2">
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
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
                <InputLabel>Priority</InputLabel>
                <Select
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

            {/* ✅ FIXED DROPDOWN */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small" disabled={false}>
                <InputLabel>
                  {isSystemAdmin ? "Select AVP" : "Departments"}
                </InputLabel>

                <Select
                  value={selectedDepartment || "All"}
                  onChange={(e) =>
                    setSelectedDepartment(String(e.target.value))
                  }
                  label={isSystemAdmin ? "Select AVP" : "Departments"}
                  renderValue={(selected) => {
                    if (!selected) return "Select...";

                    if (isSystemAdmin) {
                      if (selected === "All") return "All";
                      const found = avpList?.find(
                        (a: any) => a._id === selected,
                      );
                      return found?.name || "Select AVP";
                    }

                    return selected;
                  }}
                >
                  {isSystemAdmin ? (
                    <>
                      <MenuItem value="All">All</MenuItem>
                      {avpList?.map((a: any) => (
                        <MenuItem key={a._id} value={a._id}>
                          {a.name}
                        </MenuItem>
                      ))}
                    </>
                  ) : (
                    finalDepartments.map((d: any) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <DatePicker
                label="Expiry Date"
                value={form.expiry}
                onChange={(val) => setForm({ ...form, expiry: val })}
                slotProps={{
                  textField: { fullWidth: true, size: "small" },
                }}
              />
            </Stack>

            {/* PINNED */}
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
                  key={p.id}
                  className="flex items-center justify-between border border-gray-200 rounded px-3 py-2"
                >
                  <Typography className="text-sm text-gray-700">
                    {p.customName || p.filename || p.file?.name}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleRemoveFile(p.id)}
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