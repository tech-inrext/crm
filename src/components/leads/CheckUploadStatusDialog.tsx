import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Skeleton,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

interface Upload {
  _id: string;
  createdAt: string;
  totalRecords: number;
  uploaded: number;
  duplicates: number;
  invalidPhones: number;
  uploadedBy?: {
    name: string;
  };
}

interface CheckUploadStatusDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function CheckUploadStatusDialog({ open, onClose }: CheckUploadStatusDialogProps) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  // Cache for API responses - prevents unnecessary API calls
  const [cache, setCache] = useState<Map<string, any>>(new Map());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Memoize axios instance with optimized config
  const apiClient = useMemo(() => {
    return axios.create({
      timeout: 5000, // Reduced timeout from 8000
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      // Enable response compression
      decompress: true,
      // Optimize for faster responses
      maxRedirects: 3,
    });
  }, []);

  const fetchUploadStatus = useCallback(async (showLoading = true) => {
    // Check cache first (cache for 30 seconds)
    const cacheKey = `uploads-all`;
    const cachedData = cache.get(cacheKey);
    const now = Date.now();

    if (cachedData && (now - lastFetchTime) < 30000) {
      setUploads(cachedData.data || []);
      setInitialLoading(false);
      return;
    }

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const startTime = performance.now();

      const res = await apiClient.get(`/api/v0/lead/upload-status`);

      const endTime = performance.now();
      console.log(`API call took ${endTime - startTime} milliseconds`);

      const { data } = res.data;

      // Cache the response
      setCache(prev => new Map(prev).set(cacheKey, res.data));
      setLastFetchTime(now);

      setUploads(data || []);
    } catch (err: any) {
      console.error("Error fetching upload status:", err);
      let errorMessage = "Failed to fetch upload status. ";

      if (err.code === 'ECONNABORTED') {
        errorMessage += "Request timed out.";
      } else if (err.response?.status === 500) {
        errorMessage += "Server error occurred.";
      } else if (!navigator.onLine) {
        errorMessage += "Please check your internet connection.";
      } else {
        errorMessage += "Please try again later.";
      }

      setError(errorMessage);
      setUploads([]);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [apiClient, cache, lastFetchTime]);

  const handleDownload = useCallback(async (id: string) => {
    setDownloadingIds(prev => new Set(prev).add(id));

    try {
      const res = await apiClient.get(`/api/v0/lead/download-report/${id}`);
      const { fileUrl, fileName } = res.data;

      // Create download link
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download report. Please try again.");
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [apiClient]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      fetchUploadStatus();
    } else {
      // Reset state when dialog closes
      setUploads([]);
      setInitialLoading(true);
      setError(null);
    }
  }, [open, fetchUploadStatus]);

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
          <IconButton
            onClick={() => {
              setCache(new Map()); // Clear cache to force fresh data
              fetchUploadStatus(true);
            }}
            title="Refresh"
            disabled={loading}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton onClick={onClose} title="Close">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {initialLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={60} />
            ))}
          </Box>
        ) : loading ? (
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
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              📭 No upload history found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Upload some leads to see your history here
            </Typography>
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Uploaded</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Duplicates</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Invalid Phones</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Uploader</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Download</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {uploads.map((upload) => (
                  <TableRow key={upload._id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(upload.createdAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight={500}>
                        {upload.totalRecords}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="success.main" fontWeight={500}>
                        {upload.uploaded}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="warning.main" fontWeight={500}>
                        {upload.duplicates}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="error.main" fontWeight={500}>
                        {upload.invalidPhones}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {upload.uploadedBy?.name || "Unknown"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2">
                        {upload.status || "Unknown"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleDownload(upload._id)}
                        title="Download Report"
                        disabled={downloadingIds.has(upload._id)}
                        size="small"
                        sx={{
                          '&:hover': {
                            backgroundColor: 'primary.50',
                            color: 'primary.main'
                          }
                        }}
                      >
                        {downloadingIds.has(upload._id) ? (
                          <CircularProgress size={16} />
                        ) : (
                          <DownloadIcon fontSize="small" />
                        )}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
