import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
  Box,
  Typography,
  Autocomplete,
  TextField,
  MenuItem,
} from "@/components/ui/Component";
import Alert from "@/components/ui/Component/Alert";
import axios from "axios";
import { CloudUpload, CheckCircle, InsertDriveFile, Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

interface BulkUploadDialogProps {
  open: boolean;
  onClose: () => void;
  loadLeads: () => void;
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  open,
  onClose,
  loadLeads,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [assignedTo, setAssignedTo] = useState<any | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      axios
        .get("/api/v0/employee/getAllEmployeeList")
        .then((res) => setUsers(res.data.data || []))
        .catch(() => setUsers([]));
    } else {
      // Reset state when dialog closes
      setAssignedTo(null);
      setFile(null);
      setDragging(false);
    }
  }, [open]);

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];
    const validExtensions = [".xlsx", ".xls", ".csv"];
    const ext = selectedFile.name.slice(selectedFile.name.lastIndexOf("."));
    if (!validExtensions.includes(ext.toLowerCase())) {
      setSnackbarMessage("Please upload a valid Excel or CSV file (.xlsx, .xls, .csv)");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) handleFileSelect(dropped);
    },
    []
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
    // Reset input value so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) {
      setSnackbarMessage("Please select a file to upload.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setUploading(true);
    try {
      // Step 1: Get pre-signed S3 URL
      const presignRes = await fetch("/api/v0/s3/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, fileType: file.type }),
      });

      if (!presignRes.ok) {
        const errorText = await presignRes.text();
        throw new Error(`S3 URL request failed: ${presignRes.status} - ${errorText}`);
      }

      const presignData = await presignRes.json();
      const { uploadUrl, fileUrl, fileName } = presignData;
      if (!uploadUrl || !fileUrl || !fileName) {
        throw new Error("S3 URL generation failed - missing required fields");
      }

      // Step 2: Upload to S3
      const uploadToS3 = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadToS3.ok) {
        throw new Error(`S3 upload failed: ${uploadToS3.status}`);
      }

      // Step 3: Send fileUrl + fileName + assignedTo to backend
      const backendRes = await fetch("/api/v0/lead/bulk-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl,
          fileName,
          assignedTo: assignedTo?._id || null,
        }),
      });

      if (!backendRes.ok) {
        const errorText = await backendRes.text();
        throw new Error(`Bulk upload request failed: ${backendRes.status} - ${errorText}`);
      }

      const result = await backendRes.json();
      setSnackbarMessage(result.message || "Upload successful! Leads are being processed.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);

      await loadLeads();
      onClose();
    } catch (err: any) {
      console.error("Bulk upload error:", err);
      setSnackbarMessage(`Upload failed: ${err.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const fileSizeLabel = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        BackdropProps={{
          sx: {
            backdropFilter: "blur(4px)",
            backgroundColor: "rgba(15, 23, 42, 0.5)",
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
            color: "#fff",
            px: 3,
            pt: 2.5,
            pb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloudUpload sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Box>
              <Typography
                sx={{ fontWeight: 700, fontSize: "1.05rem", color: "#fff" }}
              >
                Bulk Upload Leads
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.75)" }}>
                Upload an Excel file to import multiple leads at once
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#fff", background: "rgba(255,255,255,0.1)" } }}
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 3, bgcolor: "#f8fafc" }}>
          {/* Assign To Dropdown */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", mb: 0.75 }}
            >
              Assign To
              <Typography
                component="span"
                sx={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 400, ml: 1 }}
              >
                (Optional — assign all leads from this upload to a team member)
              </Typography>
            </Typography>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => option.name || ""}
              getOptionKey={(option) => option._id || option.id}
              value={assignedTo}
              onChange={(_, newValue) => setAssignedTo(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search and select employee..."
                  size="small"
                  sx={{
                    bgcolor: "#fff",
                    borderRadius: 1.5,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 1.5,
                      "&:hover fieldset": { borderColor: "#3b82f6" },
                      "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
                    },
                  }}
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <Box
                    component="li"
                    key={option._id || option.id || key}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 0.5 }}
                    {...rest}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0,
                      }}
                    >
                      {(option.name || "?")[0].toUpperCase()}
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                        {option.name}
                      </Typography>
                      {option.email && (
                        <Typography sx={{ fontSize: "0.72rem", color: "#6b7280" }}>
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                );
              }}
              noOptionsText="No employees found"
              clearOnBlur
              selectOnFocus
            />
          </Box>

          {/* File Uploader */}
          <Box>
            <Typography
              sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", mb: 0.75 }}
            >
              Upload Excel File
              <Typography
                component="span"
                sx={{ fontSize: "0.75rem", color: "#ef4444", fontWeight: 500, ml: 0.5 }}
              >
                *
              </Typography>
            </Typography>

            {/* Drop Zone */}
            <Box
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !file && fileInputRef.current?.click()}
              sx={{
                border: `2px dashed ${dragging ? "#3b82f6" : file ? "#22c55e" : "#d1d5db"}`,
                borderRadius: 2.5,
                bgcolor: dragging
                  ? "rgba(59,130,246,0.06)"
                  : file
                  ? "rgba(34,197,94,0.04)"
                  : "#fff",
                p: 3.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                cursor: file ? "default" : "pointer",
                transition: "all 0.2s ease",
                minHeight: 160,
                "&:hover": file
                  ? {}
                  : {
                      border: "2px dashed #3b82f6",
                      bgcolor: "rgba(59,130,246,0.04)",
                    },
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                style={{ display: "none" }}
                onChange={handleInputChange}
              />

              {file ? (
                // File selected state
                <>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      background: "linear-gradient(135deg, #22c55e, #16a34a)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 28, color: "#fff" }} />
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography
                      sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#16a34a" }}
                    >
                      File Ready
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        mt: 0.5,
                        justifyContent: "center",
                      }}
                    >
                      <InsertDriveFile sx={{ fontSize: 16, color: "#6b7280" }} />
                      <Typography sx={{ fontSize: "0.82rem", color: "#4b5563" }}>
                        {file.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                        ({fileSizeLabel(file.size)})
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    sx={{
                      borderRadius: 1.5,
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#6b7280",
                      borderColor: "#d1d5db",
                      textTransform: "none",
                      "&:hover": { borderColor: "#ef4444", color: "#ef4444", bgcolor: "rgba(239,68,68,0.04)" },
                    }}
                  >
                    Remove file
                  </Button>
                </>
              ) : (
                // Empty state
                <>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "14px",
                      background: dragging
                        ? "linear-gradient(135deg, #3b82f6, #1e40af)"
                        : "linear-gradient(135deg, #e0e7ff, #bfdbfe)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <CloudUpload
                      sx={{ fontSize: 26, color: dragging ? "#fff" : "#3b82f6" }}
                    />
                  </Box>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1f2937" }}>
                      {dragging ? "Drop your file here" : "Drag & drop your file here"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.8rem", color: "#6b7280", mt: 0.5 }}>
                      or{" "}
                      <Typography
                        component="span"
                        sx={{
                          color: "#3b82f6",
                          fontWeight: 600,
                          cursor: "pointer",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        browse
                      </Typography>{" "}
                      to choose a file
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      flexWrap: "wrap",
                      justifyContent: "center",
                    }}
                  >
                    {[".xlsx", ".xls", ".csv"].map((ext) => (
                      <Box
                        key={ext}
                        sx={{
                          px: 1.25,
                          py: 0.3,
                          borderRadius: 1,
                          bgcolor: "#f3f4f6",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: "#6b7280",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {ext}
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Box>

            {/* Info tip */}
            <Box
              sx={{
                mt: 1.5,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: "#eff6ff",
                border: "1px solid #bfdbfe",
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: "0.72rem", color: "#1e40af", lineHeight: 1.5 }}>
                💡 <strong>Required columns:</strong> phone. Optional: fullName, email, propertyType, location, budgetRange, status, source.
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid #e5e7eb",
            bgcolor: "#fff",
            gap: 1,
          }}
        >
          <Button
            onClick={onClose}
            disabled={uploading}
            variant="outlined"
            sx={{
              fontWeight: 600,
              color: "#6b7280",
              borderColor: "#d1d5db",
              borderRadius: 1.5,
              textTransform: "none",
              "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={uploading || !file}
            startIcon={
              uploading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CloudUpload sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              fontWeight: 700,
              borderRadius: 1.5,
              textTransform: "none",
              px: 3,
              background: "linear-gradient(135deg, #2563eb, #3b82f6)",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
              "&:hover": {
                background: "linear-gradient(135deg, #1d4ed8, #2563eb)",
                boxShadow: "0 6px 16px rgba(37,99,235,0.4)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "#e5e7eb",
                color: "#9ca3af",
                boxShadow: "none",
                transform: "none",
              },
              transition: "all 0.2s ease",
            }}
          >
            {uploading ? "Uploading..." : "Upload Leads"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BulkUploadDialog;
