import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

export default function CheckUploadStatusDialog({ open, onClose }) {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUploadStatus = () => {
    setLoading(true);
    axios
      .get("/api/v0/lead/upload-status")
      .then((res) => {
        setUploads(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching upload status:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDownload = async (id) => {
    try {
      const res = await axios.get(`/api/v0/lead/download-report/${id}`);
      const url = res.data.downloadUrl;

      const link = document.createElement("a");
      link.href = url;
      link.download = `report_${id}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to download report.");
    }
  };

  useEffect(() => {
    if (open) fetchUploadStatus();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          📋 Upload History
        </Typography>
        <Box>
          <IconButton onClick={fetchUploadStatus} title="Refresh">
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose} title="Close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : uploads.length === 0 ? (
          <Typography align="center">No bulk uploads found.</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell align="center">Total</TableCell>
                <TableCell align="center">Uploaded</TableCell>
                <TableCell align="center">Duplicates</TableCell>
                <TableCell align="center">Invalid Phones</TableCell>
                <TableCell align="center">Uploader</TableCell>
                <TableCell align="center">Download</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {uploads.map((upload) => (
                <TableRow key={upload._id}>
                  <TableCell>
                    {new Date(upload.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell align="center">{upload.totalRecords}</TableCell>
                  <TableCell align="center">{upload.uploaded}</TableCell>
                  <TableCell align="center">{upload.duplicates}</TableCell>
                  <TableCell align="center">{upload.invalidPhones}</TableCell>
                  <TableCell align="center">
                    {upload.uploadedBy?.name || "Unknown"}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => handleDownload(upload._id)}
                      title="Download Report"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
