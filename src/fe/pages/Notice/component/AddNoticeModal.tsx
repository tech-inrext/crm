"use client";

import React, { useRef, useState, useEffect } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import { noticeValidationSchema } from "@/fe/pages/Notice/component/dialog/noticeValidation";
import { useAuth } from "@/contexts/AuthContext";
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

const categories = [
  "General Announcements",
  "Project Updates",
  "Pricing / Offers",
  "Sales Targets",
  "Urgent Alerts",
  "HR / Internal",
];

const priorities = ["Urgent", "Important", "Info"];

type PendingFile = { id: string; file: File; customName: string };

type Props = { open: boolean; onClose: () => void; onNoticeAdded?: () => void };

export default function AddNoticeModal({
  open,
  onClose,
  onNoticeAdded,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [priority, setPriority] = useState(priorities[2]);
  const [avps, setAvps] = useState<{ _id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [expiry, setExpiry] = useState<Dayjs | null>(null);
  const [pinned, setPinned] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"error" | "success">(
    "error",
  );
  const [editorFocused, setEditorFocused] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const auth = useAuth();
  const isSystemAdmin = Boolean(auth?.isSystemAdmin);
  const isAVP =
    auth?.isAVP === true ||
    (auth?.user as any)?.isAVP === true ||
    (auth?.user as any)?.role?.isAVP === true;

  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory(categories[0]);
    setPriority(priorities[2]);
    setSelectedDepartment("All");
    setExpiry(null);
    setPinned(false);
    setPendingFiles([]);
    setErrors({});
    if (quillRef.current) {
      quillRef.current.setContents([]);
      quillRef.current.clipboard.dangerouslyPasteHTML("");
    }
  };

  /* ---------------- QUILL ---------------- */
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

      const quillContent = quill.root;
      quillContent.style.fontSize = "1rem";
      quillContent.style.fontFamily =
        '"Roboto", "Helvetica", "Arial", sans-serif';
      quillContent.style.padding = "8.5px 14px";
      quillContent.style.minHeight = "56px";
      quillContent.style.lineHeight = "1.4375em";

      quill.on("text-change", () => {
        const html = quill.root.innerHTML;
        setDescription(html === "<p><br></p>" ? "" : html);
      });

      quill.on("selection-change", (range: any) => {
        setEditorFocused(!!range);
      });

      quillRef.current = quill;
      quill.setContents([]);
      quill.clipboard.dangerouslyPasteHTML("");
      setDescription("");
    }, 100);
    return () => clearTimeout(timer);
  }, [open]);

  /* ---------------- META ---------------- */
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await fetch("/api/v0/notice/meta");
        const data = await res.json();

        if (isSystemAdmin) {
          setDepartments(["All"]);
        } else if (isAVP) {
          setDepartments(["All", "Team"]);
        } else {
          setDepartments(data?.data?.departments || ["All"]);
        }
      } catch {
        setDepartments(isAVP ? ["All", "Team"] : ["All"]);
      }
    };

    loadMeta();
  }, [isSystemAdmin, isAVP]);

  // Admin sees AVPs
  useEffect(() => {
    if (isSystemAdmin) {
      fetch("/api/v0/employee/getAllAVPEmployees")
        .then((res) => res.json())
        .then((data) => setAvps(data?.data || []))
        .catch(() => setAvps([]));
    }
  }, [isSystemAdmin]);

  // AVP sees "All" / "Team"

  /* ---------------- FILES ---------------- */
  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPendingFiles((prev) => [
      ...prev,
      ...files.map((f) => ({
        id: `${f.name}-${Date.now()}`,
        file: f,
        customName: f.name.replace(/\.[^.]+$/, ""),
      })),
    ]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadToS3 = async (file: File): Promise<string> => {
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

  const notify = (msg: string, type: "error" | "success" = "error") => {
    setSnackbarMsg(msg);
    setSnackbarSeverity(type);
    setSnackbarOpen(true);
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    try {
      await noticeValidationSchema.validate(
        {
          title,
          description,
          category,
          priority,
          departments: selectedDepartment,
          expiry,
          pinned,
          attachments: pendingFiles,
        },
        { abortEarly: false },
      );

      setErrors({});
      setLoading(true);

      const uploadedAttachments = await Promise.all(
        pendingFiles.map(async (p) => ({
          url: await uploadToS3(p.file),
          filename: p.customName.trim() || p.file.name,
        })),
      );

      const payload: any = {
        title,
        description,
        category,
        priority,
        expiry: expiry ? dayjs(expiry).format("YYYY-MM-DD") : null,
        pinned,
        attachments: uploadedAttachments,
      };

      if (isSystemAdmin) {
        payload.targetAVP =
          selectedDepartment !== "All" ? selectedDepartment : null;
        payload.departments = ["All"]; // Admin notices are considered public for others
      } else {
        payload.departments = [selectedDepartment]; // AVP sends "All" or "Team"
      }
      const res = await fetch("/api/v0/notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (!result.success) throw new Error(result.message);

      notify("Notice added successfully!", "success");
      resetForm();
      onNoticeAdded?.();
      onClose();
    } catch (err: any) {
      if (err.inner) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((e: any) => {
          if (!validationErrors[e.path]) validationErrors[e.path] = e.message;
        });
        setErrors(validationErrors);
        return;
      }
      notify(err?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!open) return null;
  if (!isAVP && !isSystemAdmin) return null;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Create New Notice
          <IconButton
            onClick={handleClose}
            className="!absolute !right-4 !top-4"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {/* TITLE */}
            <TextField
              label="Notice Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              size="small"
              error={!!errors.title}
              helperText={errors.title}
            />

            {/* DESCRIPTION */}
            <FormControl
              fullWidth
              size="small"
              className={`!rounded-md !border ${editorFocused ? "!border-blue-500" : "!border-gray-300"}`}
            >
              <InputLabel
                shrink={!!description || editorFocused}
                className="!bg-white !px-1"
              >
                Notice Description
              </InputLabel>
              <Box
                className="!rounded-md cursor-text"
                onClick={() => quillRef.current?.focus()}
              >
                <div ref={editorRef} />
              </Box>
            </FormControl>
            {errors.description && (
              <Typography className="text-red-700 !mt3 !text-[13px] !ml-4">
                {errors.description}
              </Typography>
            )}

            {/* CATEGORY + PRIORITY */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
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
                  {priorities.map((p) => (
                    <MenuItem key={p} value={p}>
                      {p}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {/* DEPARTMENTS / AVP */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small" variant="outlined">
                <InputLabel id="department-label">
                  {isSystemAdmin ? "Select AVP" : "Departments"}
                </InputLabel>

                <Select
                  labelId="department-label"
                  label={isSystemAdmin ? "Select AVP" : "Departments"} // ✅ IMPORTANT
                  value={selectedDepartment}
                  onChange={(e) =>
                    setSelectedDepartment(String(e.target.value))
                  }
                  renderValue={(selected) => {
                    if (!selected) return "Select...";
                    if (isSystemAdmin) {
                      if (selected === "All") return "All";
                      const found = avps.find((a) => a._id === selected);
                      return found?.name || "Select";
                    }
                    return selected; // AVP sees All/Team
                  }}
                >
                  {isSystemAdmin
                    ? [
                        <MenuItem key="All" value="All">
                          All
                        </MenuItem>,
                        ...(Array.isArray(avps)
                          ? avps.map((a) => (
                              <MenuItem key={a._id} value={a._id}>
                                {a.name}
                              </MenuItem>
                            ))
                          : []),
                      ]
                    : Array.isArray(departments)
                      ? departments.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))
                      : []}
                </Select>
              </FormControl>

              <Box className="w-full">
                <DatePicker
                  label="Expiry Date"
                  value={expiry}
                  onChange={(val) => setExpiry(val)}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </Box>
            </Stack>

            {/* ATTACHMENTS */}
            <Box className="flex flex-col gap-2">
              <Box className="flex items-center justify-between">
                <Typography className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  ATTACHMENTS{" "}
                  <span className="text-[15px] normal-case font-normal text-slate-500">
                    (please add files format pdf,jpg, jpeg, png)
                  </span>
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
              <input
                ref={fileInputRef}
                type="file"
                multiple
                hidden
                onChange={pickFiles}
              />
              {pendingFiles.map((p, i) => (
                <Box
                  key={p.id}
                  className="flex items-center justify-between border border-gray-200 rounded px-3 py-2"
                >
                  <Typography className="text-sm text-gray-700">
                    {p.customName}
                  </Typography>
                  <Button
                    size="small"
                    color="error"
                    className="!text-xs !min-w-0"
                    onClick={() =>
                      setPendingFiles((prev) =>
                        prev.filter((_, index) => index !== i),
                      )
                    }
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

            <FormControlLabel
              control={
                <Switch
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                />
              }
              label="Pin this notice"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="!bg-blue-600 !text-white hover:!bg-blue-700"
          >
            {loading ? (
              <CircularProgress size={20} className="text-white" />
            ) : (
              "Publish"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity}>{snackbarMsg}</Alert>
      </Snackbar>
    </LocalizationProvider>
  );
}
