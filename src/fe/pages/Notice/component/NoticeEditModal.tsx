"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import "quill/dist/quill.snow.css";
import Quill from "quill";
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
  CircularProgress,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { useNoticeMeta } from "../hooks/useNoticeMeta";
import { useNoticeForm } from "../hooks/useNoticeForm";

export default function NoticeEditDialog({ open, onClose, notice }: any) {
  const { categories, priorities, departments, avps, loading } =
    useNoticeMeta();
  const { form, setForm } = useNoticeForm(notice);

  const auth = useAuth();

  const isSystemAdmin = Boolean(auth?.isSystemAdmin);
  const isAVP =
    auth?.isAVP === true ||
    (auth?.user as any)?.isAVP === true ||
    (auth?.user as any)?.role?.isAVP === true;

  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const [editorFocused, setEditorFocused] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------- FILES ----------------
  const [pendingFiles, setPendingFiles] = useState<any[]>(
    (notice?.attachments || []).map((f: any, i: number) => ({
      id: Date.now() + i,
      filename: f.filename || f.name,
      url: f.url,
      customName: f.filename || f.name,
    })),
  );

  // ---------------- DEPARTMENT FIX ----------------
  const [selectedDepartment, setSelectedDepartment] = useState<any>(() => {
    if (notice?.targetAVP) return notice.targetAVP;
    if (Array.isArray(notice?.departments)) return notice.departments[0];
    return "All";
  });

  // ---------------- QUILL ----------------
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      if (!editorRef.current) return;

      if (quillRef.current) {
        quillRef.current.off("text-change");
        quillRef.current.off("selection-change");
        quillRef.current = null;
      }

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        modules: {
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            ["link"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["clean"],
          ],
        },
      });

      const root = quill.root;
      root.style.fontSize = "1rem";
      root.style.fontFamily = '"Roboto","Helvetica","Arial",sans-serif';
      root.style.padding = "8.5px 14px";
      root.style.minHeight = "80px";

      // ✅ load existing description
      quill.clipboard.dangerouslyPasteHTML(form.description || "");

      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        setForm((prev: any) => ({
          ...prev,
          description: html === "<p><br></p>" ? "" : html,
        }));
      });

      quill.on("selection-change", (range: any) => {
        setEditorFocused(!!range);
      });

      quillRef.current = quill;
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  // ---------------- HANDLERS ----------------
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).map((file, i) => ({
      id: Date.now() + i,
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

  // ---------------- UPDATE ----------------
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

      let payload: any = {
        ...form,
        expiry: form.expiry ? form.expiry.toISOString() : null,
        attachments: updatedAttachments,
      };

      if (isSystemAdmin) {
        payload.targetAVP =
          selectedDepartment !== "All" ? selectedDepartment : null;
        payload.departments = ["All"];
      } else {
        payload.departments = [selectedDepartment];
      }

      await axios.put(`/api/v0/notice/${notice._id}`, payload);

      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Update failed");
    }
  };

  if (!open) return null;
  if (!isAVP && !isSystemAdmin) return null;

  // ---------------- UI ----------------
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
            <TextField
              label="Notice Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              fullWidth
              size="small"
            />

            {/* QUILL */}
            <FormControl
              fullWidth
              size="small"
              className={`!border ${
                editorFocused ? "!border-blue-500" : "!border-gray-300"
              } !rounded-md`}
            >
              <InputLabel
                shrink={!!form.description || editorFocused}
                className="!bg-white !px-1"
              >
                Notice Description
              </InputLabel>

              <Box onClick={() => quillRef.current?.focus()}>
                <div ref={editorRef} />
              </Box>
            </FormControl>

            {/* CATEGORY + PRIORITY */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="cat">Category</InputLabel>
                <Select
                  labelId="cat"
                  label="Category"
                  name="category"
                  value={form.category || ""}
                  onChange={handleChange}
                >
                  {categories.map((c: any) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="pri">Priority</InputLabel>
                <Select
                  labelId="pri"
                  label="Priority"
                  name="priority"
                  value={form.priority || ""}
                  onChange={handleChange}
                >
                  {priorities.map((p: any) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* DEPARTMENT */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel id="dept-label">
                  {isSystemAdmin ? "Select AVP" : "Departments"}
                </InputLabel>

                <Select
                  labelId="dept-label"
                  label={isSystemAdmin ? "Select AVP" : "Departments"}
                  value={
                    isSystemAdmin
                      ? selectedDepartment || "All"
                      : selectedDepartment || ""
                  }
                  onChange={(e) =>
                    setSelectedDepartment(String(e.target.value))
                  }
                >
                  {isSystemAdmin
                    ? [
                        <MenuItem key="All" value="All">
                          All
                        </MenuItem>,
                        ...(avps ?? []).map((a: any) => (
                          <MenuItem key={a._id} value={a._id}>
                            {a.name}
                          </MenuItem>
                        )),
                      ]
                    : (Array.isArray(departments) ? departments : []).map(
                        (d: any) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ),
                      )}
                </Select>
              </FormControl>

              <DatePicker
                label="Expiry Date"
                value={form.expiry}
                onChange={(val) => setForm({ ...form, expiry: val })}
                slotProps={{ textField: { fullWidth: true, size: "small" } }}
              />
            </Stack>

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
