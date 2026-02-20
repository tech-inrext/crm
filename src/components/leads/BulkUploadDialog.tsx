import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Snackbar,
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
          className: "backdrop-blur-[4px] !bg-slate-900/50",
        }}
        PaperProps={{
          className: "rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.18)]"
        }}
      >
        {/* Header */}
        <DialogTitle
          className="bg-gradient-to-br from-blue-800 to-blue-500 text-white px-6 pt-5 pb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] bg-white/15 flex items-center justify-center"
            >
              <CloudUpload className="text-[20px] text-white" />
            </div>
            <div>
              <h2
                className="font-bold text-[1.05rem] text-white leading-normal"
              >
                Bulk Upload Leads
              </h2>
              <p className="text-xs text-white/75 leading-none mt-0.5">
                Upload an Excel file to import multiple leads at once
              </p>
            </div>
          </div>
          <IconButton
            onClick={onClose}
            size="small"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="px-6 py-6 bg-slate-50">
          {/* Assign To Dropdown */}
          <div className="mb-6">
            <h3
              className="text-sm font-semibold text-gray-700 mb-2 mt-2"
            >
              Assign To
              <span
                className="text-xs text-gray-500 font-normal ml-2"
              >
                ( Assign all leads from this upload to a team member)
              </span>
            </h3>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => option.name || ""}
              getOptionKey={(option) => option._id || option.id}
              value={assignedTo}
              onChange={(_, newValue) => setAssignedTo(newValue)}
              className="bg-white rounded-xl"
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search and select employee..."
                  size="small"
                  className="[&_.MuiOutlinedInput-root]:rounded-xl [&_.MuiOutlinedInput-root:hover_fieldset]:border-blue-500 [&_.MuiOutlinedInput-root.Mui-focused_fieldset]:border-blue-500"
                />
              )}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li
                    key={option._id || option.id || key}
                    {...rest}
                    className={`${props.className} flex items-center gap-3 py-1`}
                  >
                    <div
                      className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-800 flex items-center justify-center text-[0.7rem] font-bold text-white shrink-0"
                    >
                      {(option.name || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {option.name}
                      </p>
                      {option.email && (
                        <p className="text-[0.72rem] text-gray-500 leading-tight">
                          {option.email}
                        </p>
                      )}
                    </div>
                  </li>
                );
              }}
              noOptionsText="No employees found"
              clearOnBlur
              selectOnFocus
            />
          </div>

          {/* File Uploader */}
          <div>
            <h3
              className="text-sm font-semibold text-gray-700 mb-2"
            >
              Upload Excel File
              <span
                className="text-xs text-red-500 font-medium ml-1"
              >
                *
              </span>
            </h3>

            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !file && fileInputRef.current?.click()}
              className={`
                border-2 dashed rounded-[10px] p-7 flex flex-col items-center justify-center gap-3 min-h-[160px] transition-all duration-200
                ${dragging 
                  ? "border-blue-500 bg-blue-500/5" 
                  : file 
                    ? "border-green-500 bg-green-500/5 cursor-default" 
                    : "border-gray-300 bg-white cursor-pointer hover:border-blue-500 hover:bg-blue-500/5"
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleInputChange}
              />

              {file ? (
                // File selected state
                <>
                  <div
                    className="w-[52px] h-[52px] rounded-[14px] bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"
                  >
                    <CheckCircle className="text-[28px] text-white" />
                  </div>
                  <div className="text-center">
                    <p
                      className="font-bold text-sm text-green-600"
                    >
                      File Ready
                    </p>
                    <div
                      className="flex items-center gap-1.5 mt-1 justify-center"
                    >
                      <InsertDriveFile className="text-[16px] text-gray-500" />
                      <p className="text-sm text-gray-600">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        ({fileSizeLabel(file.size)})
                      </p>
                    </div>
                  </div>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="rounded-lg text-xs font-semibold text-gray-500 border-gray-300 normal-case hover:border-red-500 hover:text-red-500 hover:bg-red-50"
                  >
                    Remove file
                  </Button>
                </>
              ) : (
                // Empty state
                <>
                  <div
                    className={`
                      w-[52px] h-[52px] rounded-[14px] flex items-center justify-center transition-all duration-200
                      ${dragging ? "bg-gradient-to-br from-blue-500 to-blue-800" : "bg-gradient-to-br from-indigo-100 to-blue-200"}
                    `}
                  >
                    <CloudUpload
                      className={`text-[26px] ${dragging ? "text-white" : "text-blue-500"}`}
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm text-gray-800">
                      {dragging ? "Drop your file here" : "Drag & drop your file here"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or{" "}
                      <span
                        className="text-blue-500 font-semibold cursor-pointer hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        browse
                      </span>{" "}
                      to choose a file
                    </p>
                  </div>
                  <div
                    className="flex gap-2 flex-wrap justify-center"
                  >
                    {[".xlsx", ".xls", ".csv"].map((ext) => (
                      <span
                        key={ext}
                        className="px-2.5 py-1 rounded bg-gray-100 border border-gray-200 text-[0.72rem] font-semibold text-gray-500 tracking-wide"
                      >
                        {ext}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Info tip */}
            <div
              className="mt-3 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-start gap-2"
            >
              <p className="text-[0.72rem] text-blue-800 leading-relaxed">
                💡 <span className="font-bold">Required columns:</span> phone. Optional: fullName, email, propertyType, location, budgetRange, status, source.
              </p>
            </div>
          </div>
        </DialogContent>

        <DialogActions
          className="px-6 py-4 border-t border-gray-200 bg-white gap-2"
        >
          <Button
            onClick={onClose}
            disabled={uploading}
            variant="outlined"
            className="font-semibold text-gray-500 border-gray-300 rounded-lg normal-case hover:border-gray-400 hover:bg-gray-50 disabled:bg-transparent"
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
              ) : file ? (
                <CloudUpload className="text-[18px]" />
              ) : null
            }
            className={`
              font-bold rounded-lg normal-case px-6 bg-gradient-to-br from-blue-600 to-blue-500 shadow-lg shadow-blue-600/30 transition-all
              hover:bg-gradient-to-br hover:from-blue-700 hover:to-blue-600 hover:shadow-blue-600/40 hover:-translate-y-px
              disabled:bg-none disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed
            `}
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
