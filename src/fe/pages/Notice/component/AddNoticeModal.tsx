"use client";

import React, { useRef, useState, useEffect } from "react";
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

/* ---------------- STATIC OPTIONS ---------------- */

const categories = [
  "General Announcements",
  "Project Updates",
  "Pricing / Offers",
  "Sales Targets",
  "Urgent Alerts",
  "HR / Internal",
];

const priorities = ["Urgent", "Important", "Info"];

/* ---------------- TYPES ---------------- */

interface PendingFile {
  id: string;
  file: File;
  customName: string;
}

interface SavedAttachment {
  filename: string;
  url: string;
}

type Props = {
  open: boolean;
  onClose: () => void;
  onNoticeAdded?: () => void; // optional for safety
};

/* ---------------- S3 UPLOAD ---------------- */

async function uploadToS3(file: File): Promise<string> {
  const { uploadUrl, fileUrl } = await fetch("/api/v0/s3/upload-url", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
    }),
    headers: { "Content-Type": "application/json" },
  }).then((res) => res.json());

  await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return fileUrl;
}

/* ---------------- COMPONENT ---------------- */

export default function AddNoticeModal({
  open,
  onClose,
  onNoticeAdded,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- STATE ---------------- */

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState(priorities[2]);

  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");

  const [expiry, setExpiry] = useState<Dayjs | null>(null);
  const [pinned, setPinned] = useState(false);

  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [savedAttachments, setSavedAttachments] = useState<SavedAttachment[]>(
    []
  );

  const [loading, setLoading] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<"error" | "success">("error");

  /* ---------------- SNACKBAR ---------------- */

  const notify = (msg: string, type: "error" | "success" = "error") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };

  /* ---------------- LOAD META ---------------- */

  useEffect(() => {
    fetch("/api/v0/notice/meta")
      .then((res) => res.json())
      .then((data) => {
        if (data?.success) {
          setDepartments(data.data.departments || ["All", "Teams", "Roles"]);
        } else {
          setDepartments(["All", "Teams", "Roles"]);
        }
      })
      .catch(() => {
        setDepartments(["All", "Teams", "Roles"]);
      });
  }, []);

  /* ---------------- FILE PICK ---------------- */

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (!files.length) return;

    setPendingFiles((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${Date.now()}-${Math.random()}`,
        file: f,
        customName: f.name.replace(/\.[^.]+$/, ""),
      })),
    ]);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      return notify("Title and Description are required");
    }

    try {
      setLoading(true);

      /* upload files */
      const newAttachments: SavedAttachment[] = await Promise.all(
        pendingFiles.map(async (p) => ({
          filename: p.customName.trim() || p.file.name,
          url: await uploadToS3(p.file),
        }))
      );

      const payload = {
        title,
        description,
        category,
        priority,
        departments: selectedDepartment,
        expiry: expiry ? dayjs(expiry).format("YYYY-MM-DD") : null,
        pinned,
        attachments: [...savedAttachments, ...newAttachments],
      };

      const res = await fetch("/api/v0/notice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      notify("Notice added successfully!", "success");

      /* auto refresh notice cards */
      if (onNoticeAdded) {
        onNoticeAdded();
      }

      onClose();

      /* reset */
      setTitle("");
      setDescription("");
      setCategory(categories[0]);
      setPriority(priorities[2]);
      setSelectedDepartment("All");
      setExpiry(null);
      setPinned(false);
      setPendingFiles([]);
      setSavedAttachments([]);
    } catch (err: any) {
      notify(err?.message || "Failed to add notice");
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

              {/* Category & Priority */}

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

              {/* Department & Expiry */}

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

                {pendingFiles.map((f) => (
                  <Typography key={f.id} fontSize={12}>
                    {f.customName}
                  </Typography>
                ))}

                {!pendingFiles.length && (
                  <Typography fontSize={12} color="text.secondary">
                    No attachments yet
                  </Typography>
                )}
              </Box>

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

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Alert severity={snackbarSeverity} variant="filled">
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </>
  );
}