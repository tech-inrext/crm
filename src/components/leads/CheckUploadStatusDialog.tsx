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
import Pagination from "../ui/Pagination"; // Pagination component

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

// Table headers stored in a variable
const tableHeaders = [
  { label: "Uploaded At", align: "left" },
  { label: "Total", align: "center" },
  { label: "Uploaded", align: "center" },
  { label: "Duplicates", align: "center" },
  { label: "Invalid Phones", align: "center" },
  { label: "Uploader", align: "center" },
  { label: "Status", align: "center" },
  { label: "Download", align: "center" },
];

export default function CheckUploadStatusDialog({
  open,
  onClose,
}: CheckUploadStatusDialogProps) {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [page, setPage] = useState(1); // Current page (1-based)
  const [pageSize, setPageSize] = useState(5); // Items per page
  const [totalItems, setTotalItems] = useState(0); // Total number of items

  // Cache for API responses
  const [cache, setCache] = useState<Map<string, any>>(new Map());
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Memoize axios instance with optimized config
  const apiClient = useMemo(() => {
    return axios.create({
      timeout: 5000, // Reduced timeout from 8000
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      decompress: true,
      maxRedirects: 3,
    });
  }, []);

  // Fetch Upload Status with Pagination
  const fetchUploadStatus = useCallback(
    async (showLoading = true) => {
      // Cache key for pagination data
      const cacheKey = `uploads-page-${page}-limit-${pageSize}`;
      const cachedData = cache.get(cacheKey);
      const now = Date.now();

      if (cachedData && now - lastFetchTime < 30000) {
        setUploads(cachedData.data || []);
        setTotalItems(cachedData.totalItems || 0);
        setInitialLoading(false);
        return;
      }

      if (showLoading) setLoading(true);
      setError(null);

      try {
        const startTime = performance.now();

        const res = await apiClient.get(`/api/v0/lead/upload-status`, {
          params: {
            page,
            limit: pageSize,
          },
        });

        const endTime = performance.now();
        console.log(`API call took ${endTime - startTime} milliseconds`);

        const { data, pagination } = res.data;

        // Cache the response
        setCache((prev) =>
          new Map(prev).set(cacheKey, {
            data,
            totalItems: pagination.totalItems,
          })
        );
        setLastFetchTime(now);

        setUploads(data || []);
        setTotalItems(pagination.totalItems);
      } catch (err: any) {
        console.error("Error fetching upload status:", err);
        setError("Failed to fetch upload status. Please try again later.");
        setUploads([]);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [apiClient, page, pageSize, cache, lastFetchTime]
  );

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    setPage(1);
    setPageSize(size);
  };

  const handleDownload = useCallback(
    async (id: string) => {
      setDownloadingIds((prev) => new Set(prev).add(id));

      try {
        const res = await apiClient.get(`/api/v0/lead/download-report/${id}`);
        const { fileUrl, fileName } = res.data;

        // Create download link
        const link = document.createElement("a");
        link.href = fileUrl;
        link.download = fileName;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error("Download failed:", err);
        setError("Failed to download report. Please try again.");
      } finally {
        setDownloadingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    [apiClient]
  );

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setError(null);
      fetchUploadStatus();
    } else {
      setUploads([]);
      setInitialLoading(true);
      setError(null);
    }
  }, [open, fetchUploadStatus, page, pageSize]);

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
              setCache(new Map());
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

      <DialogContent
        dividers
        sx={{ display: "flex", flexDirection: "column", height: "80vh" }}
      >
        {/* Table Section */}
        <Box sx={{ flex: 1, overflowY: "auto" }}>
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
                <TableHead
                  sx={{
                    position: "sticky",
                    top: 0,
                    backgroundColor: "white",
                    zIndex: 10,
                  }}
                >
                  <TableRow>
                    {tableHeaders.map((header, index) => (
                      <TableCell
                        key={index}
                        align={header.align}
                        sx={{ fontWeight: 600 }}
                      >
                        {header.label}
                      </TableCell>
                    ))}
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
                        <Typography
                          variant="body2"
                          color="success.main"
                          fontWeight={500}
                        >
                          {upload.uploaded}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color="warning.main"
                          fontWeight={500}
                        >
                          {upload.duplicates}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          color="error.main"
                          fontWeight={500}
                        >
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
        </Box>

        {/* Pagination Section */}
        <Box
          sx={{
            position: "sticky", // Sticky positioning
            bottom: 0, // Fixes it to the bottom of the dialog
            backgroundColor: "white",
            padding: 2,
            borderTop: "1px solid #ddd",
            zIndex: 10,
          }}
        >
          <Pagination
            page={page}
            pageSize={pageSize}
            total={totalItems}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
