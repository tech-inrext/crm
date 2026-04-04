"use client";

import React, { useRef, useState, useEffect } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";

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
  Box,
  CircularProgress,
  Switch,
  FormControlLabel,
  Typography,
  Snackbar,
} from "../../../../components/ui/Component";

import Alert from "../../../../components/ui/Component/Alert";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

/* ---------------- OPTIONS ---------------- */

const categories = [
  "General Announcements",
  "Project Updates",
  "Pricing / Offers",
  "Sales Targets",
  "Urgent Alerts",
  "HR / Internal",
];

const priorities = ["Urgent", "Important", "Info"];

type Props = {
  open: boolean;
  onClose: () => void;
  onNoticeAdded?: () => void;
};

export default function AddNoticeModal({
  open,
  onClose,
  onNoticeAdded,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);

  /* ---------------- STATE ---------------- */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState(priorities[2]);

  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const [expiry, setExpiry] = useState<Dayjs | null>(null);
  const [pinned, setPinned] = useState(false);

  const [pendingFiles, setPendingFiles] = useState<any[]>([]);
  const [savedAttachments, setSavedAttachments] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<"error" | "success">("error");

  /* ---------------- INIT QUILL (FIXED) ---------------- */

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      if (!editorRef.current || quillRef.current) return;

      const quill = new Quill(editorRef.current, {
        theme: "snow",
        placeholder: "Write description...",
        modules: {
          toolbar: [
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
          ],
        },
      });

      quill.on("text-change", () => {
        setDescription(quill.root.innerHTML);
      });

      quillRef.current = quill;
    }, 100);

    return () => clearTimeout(timer);
  }, [open]);

  /* ---------------- LOAD META ---------------- */

  useEffect(() => {
    fetch("/api/v0/notice/meta")
      .then((res) => res.json())
      .then((data) => {
        setDepartments(data?.data?.departments || ["All"]);
      })
      .catch(() => setDepartments(["All"]));
  }, []);

  /* ---------------- FILE PICK ---------------- */

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setPendingFiles((prev) => [...prev, ...files]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------------- SUBMIT ---------------- */

  const notify = (msg: string, type: "error" | "success" = "error") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return notify("Title and Description are required");
    }

    try {
      setLoading(true);

      const payload = {
        title,
        description,
        category,
        priority,
        departments: selectedDepartment,
        expiry: expiry ? dayjs(expiry).format("YYYY-MM-DD") : null,
        pinned,
        attachments: savedAttachments,
      };

      const res = await fetch("/api/v0/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      notify("Notice added successfully!", "success");

      onNoticeAdded?.();
      onClose();

      // RESET
      setTitle("");
      setDescription("");
      setCategory(categories[0]);
      setPriority(priorities[2]);
      setSelectedDepartment("All");
      setExpiry(null);
      setPinned(false);
      setPendingFiles([]);
      setSavedAttachments([]);

      if (quillRef.current) {
        quillRef.current.root.innerHTML = "";
      }

    } catch (err: any) {
      notify(err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  /* ---------------- UI ---------------- */

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
            Create New Notice

            <IconButton
              onClick={onClose}
              className="!absolute !right-4 !top-4"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              {/* Title */}
              <TextField
                label="Notice Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                size="small"
              />

              {/* ✅ RICH TEXT EDITOR */}
              <Box className="border rounded-lg bg-white mb-2">
                <div
                  ref={editorRef}
                  style={{
                    minHeight: "150px",
                    padding: "10px",
                    cursor: "text",
                  }}
                />
              </Box>

              {/* Category + Priority */}
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

              {/* Department + Expiry */}
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
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Stack>

              {/* Attachments */}
              <Box>
                <div className="flex justify-between mb-1">
                  <Typography fontSize={12} fontWeight={600}>
                    Attachments
                  </Typography>

                  <Button
                    variant="text"
                    startIcon={<UploadFileIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    size="small"
                  >
                    Add files
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    hidden
                    onChange={pickFiles}
                  />
                </div>

                {pendingFiles.map((f: any, i) => (
                  <Typography key={i} fontSize={12}>
                    {f.name}
                  </Typography>
                ))}

                {!pendingFiles.length && (
                  <Typography fontSize={12} color="text.secondary">
                    No attachments yet
                  </Typography>
                )}
              </Box>

              {/* Pin */}
              <FormControlLabel
                control={
                  <Switch
                    checked={pinned}
                    onChange={(e) => setPinned(e.target.checked)}
                  />
                }
                label="Pin this notice to top"
              />
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} variant="outlined" disabled={loading}>
              Cancel
            </Button>

            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : "Publish Notice"}
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>

      <Snackbar open={snackbarOpen} autoHideDuration={4000}>
        <Alert severity={snackbarSeverity}>{snackbarMsg}</Alert>
      </Snackbar>
    </>
  );
}