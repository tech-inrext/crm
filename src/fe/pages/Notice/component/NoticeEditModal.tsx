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
import useNotices from "@/fe/pages/Notice/hooks/useNoticeDashboard";
export default function NoticeEditDialog({
  open,
  onClose,
  notice,
  onNoticeUpdated,
}: any) {
  const { categories, priorities, loading, departments } = useNoticeMeta();
  const { form, setForm } = useNoticeForm(notice);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const [editorFocused, setEditorFocused] = useState(false);
  // const { getAllNotice } = useNotices();
  const fileInputRef = useRef<HTMLInputElement>(null);
  let avpCache: any[] | null = null;
  let avpPromise: Promise<any> | null = null;
  const [avpList, setAvpList] = useState([]);
  const avpFetchedRef = useRef(false);
  const getFileNameWithExt = (file: any) => {
    const url = file?.url || "";

    // 1. try from filename
    if (file?.filename && file.filename.includes(".")) {
      return file.filename;
    }

    // 2. try from URL
    const urlName = url.split("?")[0].split("/").pop() || "";
    if (urlName.includes(".")) return urlName;

    // 3. infer from mime type OR fallback
    const type = file?.type || file?.mimeType;

    let ext = "";

    switch (type) {
      case "application/pdf":
        ext = ".pdf";
        break;
      case "image/png":
        ext = ".png";
        break;
      case "image/jpeg":
        ext = ".jpg";
        break;
      case "application/msword":
        ext = ".doc";
        break;
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ext = ".docx";
        break;
      default:
        ext = "";
    }

    const baseName = file?.filename || file?.customName || urlName || "file";

    return baseName.includes(".") ? baseName : baseName + ext;
  };
  useEffect(() => {
    if (!open) return;

    // ✅ already cached → no API call
    if (avpCache) {
      setAvpList(avpCache);
      return;
    }

    // ✅ prevent duplicate API calls
    if (!avpPromise) {
      avpPromise = fetch("/api/v0/employee/getAllAVPEmployees")
        .then((res) => res.json())
        .then((data) => {
          avpCache = data?.data || [];
          return avpCache;
        });
    }

    avpPromise.then((data) => {
      setAvpList(data);
    });
  }, [open]);
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

      setSelectedDepartment(
        notice?.targetAVP ? String(notice.targetAVP) : "All",
      );
    } else {
      if (!departments || departments.length === 0) return;

      setSelectedDepartment(notice?.departments?.[0] || "All");
    }
  }, [open, notice, avpList, departments]); // ✅ ONLY depends on open
  useEffect(() => {
    if (!open || !notice) return;

    // ✅ ONLY attachments logic here
    setPendingFiles(
      (notice?.attachments || []).map((f: any, index: number) => ({
        id: Date.now() + index,
        filename: getFileNameWithExt(f), // ✅ ensures extension always exists
        url: f.url,
        customName: getFileNameWithExt(f),
      })),
    );
  }, [open, notice]);
  const isOwner =
    String(notice?.createdBy?._id || notice?.createdBy) ===
    String(auth?.user?._id);

  const canEdit = auth?.isSystemAdmin || (isAVP && isOwner);
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
          return {
            filename: getFileNameWithExt(f), // ✅ always safe with extension
            url: f.url || "",
          };
        }),
      );

      const res = await axios.put(`/api/v0/notice/${notice._id}`, {
        ...form,
        expiry: form.expiry ? form.expiry.toISOString() : null,
        attachments: updatedAttachments,
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

      // 🔥 SAFE RESPONSE CHECK
      const updatedNotice = res?.data?.data;

      if (!updatedNotice) {
        throw new Error("No updated data returned from API");
      }

      // ✅ 1. update UI instantly (NO FULL API RECALL)
      onNoticeUpdated(updatedNotice);

      // ✅ 2. close modal
      onClose?.();

      
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      alert("Update failed");
    }
  };
  // ✅ SAFETY: wait until data ready
  if (!open || !canEdit) return null;
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

              <FormControl fullWidth size="small" variant="outlined">
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

            {/* ✅ FIXED DROPDOWN */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small" disabled={false}>
                <InputLabel>
                  {isSystemAdmin ? "Select AVP" : "Departments"}
                </InputLabel>

                <Select
                  value={selectedDepartment} // ✅ REMOVE fallback here
                  onChange={(e) => {
                    const value = String(e.target.value);
                    setSelectedDepartment(value);
                  }}
                  label={isSystemAdmin ? "Select AVP" : "Departments"}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) return "Select...";

                    if (isSystemAdmin) {
                      if (selected === "All") return "All";

                      const found = avpList?.find(
                        (a: any) => String(a._id) === String(selected),
                      );

                      return found ? found.name : "Select...";
                    }

                    return selected;
                  }}
                >
                  {isSystemAdmin
                    ? [
                        <MenuItem key="all" value="All">
                          All
                        </MenuItem>,
                        ...avpList.map((a: any) => (
                          <MenuItem key={a._id} value={String(a._id)}>
                            {a.name}
                          </MenuItem>
                        )),
                      ]
                    : finalDepartments.map((d: any) => (
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
                disablePast
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
              <Box className="flex justify-between items-center">
                <Typography className="text-xs font-semibold uppercase text-slate-600">
                  Attachments
                </Typography>

                <Button
                  startIcon={<UploadFileIcon />}
                  onClick={() => fileInputRef.current?.click()}
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
                  className="flex justify-between border rounded px-3 py-2"
                >
                  <Typography className="text-sm">
                    {p.customName || p.filename}
                  </Typography>

                  <Button
                    color="error"
                    size="small"
                    onClick={() => handleRemoveFile(p.id)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}

              {!pendingFiles.length && (
                <Typography className="text-gray-400 text-sm">
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
