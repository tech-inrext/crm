// components/BulkUpload.js
import React, { useRef, useState, useCallback } from "react";
import {
  Button,
  CircularProgress,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import UploadFile from "@mui/icons-material/UploadFile";
import Alert from "@mui/material/Alert";

const BulkUpload = ({ loadLeads }) => {
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFileUpload = useCallback(
    async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      try {
        console.log("Starting bulk upload process...");

        // Step 1: Get pre-signed S3 URL
        console.log("Step 1: Getting pre-signed S3 URL...");
        const presignRes = await fetch("/api/v0/s3/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName: file.name, fileType: file.type }),
        });

        if (!presignRes.ok) {
          const errorText = await presignRes.text();
          console.error("S3 URL request failed:", errorText);
          throw new Error(
            `S3 URL request failed: ${presignRes.status} - ${errorText}`
          );
        }

        const presignData = await presignRes.json();
        console.log("S3 URL generated successfully");
        const { uploadUrl, fileUrl, fileName } = presignData;
        if (!uploadUrl || !fileUrl || !fileName) {
          throw new Error("S3 URL generation failed - missing required fields");
        }

        // Step 2: Upload to S3
        console.log("Step 2: Uploading file to S3...");
        const uploadToS3 = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadToS3.ok) {
          console.error("S3 upload failed:", uploadToS3.status);
          throw new Error(`S3 upload failed: ${uploadToS3.status}`);
        }
        console.log("File uploaded to S3 successfully");

        // Step 3: Send fileUrl + fileName to backend
        console.log("Step 3: Processing bulk upload...");
        const backendRes = await fetch("/api/v0/lead/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl, fileName }),
        });

        if (!backendRes.ok) {
          const errorText = await backendRes.text();
          console.error("Bulk upload request failed:", errorText);
          throw new Error(
            `Bulk upload request failed: ${backendRes.status} - ${errorText}`
          );
        }

        const result = await backendRes.json();
        console.log("Bulk upload completed successfully");
        setSnackbarMessage(result.message || "Upload successful!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

        await loadLeads(); // Reload the leads or handle any other logic
      } catch (err) {
        console.error("Bulk upload error:", err);
        setSnackbarMessage(`Upload failed: ${err.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [loadLeads]
  );

  return (
    <>
      <label htmlFor="bulk-upload-excel" style={{ display: "inline-block" }}>
        <input
          accept=".xlsx, .xls, .csv"
          style={{ display: "none" }}
          id="bulk-upload-excel"
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
        <Button
          variant="contained"
          startIcon={
            !isTablet ? (
              uploading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <UploadFile />
              )
            ) : null
          }
          component="span"
          size="small"
          disabled={uploading}
          sx={{
            minWidth: { xs: "100%", sm: "auto" },
            height: 40,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: "0.8rem",
            px: { xs: 2, sm: 3 },
            boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
            "&:hover": {
              boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
              transform: "translateY(-1px)",
            },
          }}
        >
          {uploading ? (
            isTablet ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Uploading..."
            )
          ) : isTablet ? (
            "Upload"
          ) : (
            "Bulk Upload"
          )}
        </Button>
      </label>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default BulkUpload;
