import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Autocomplete,
  TablePagination,
} from "@mui/material";
import {
  Assignment,
  History as HistoryIcon,
  Restore,
  CheckCircle,
  Block,
  Download as DownloadIcon,
  Info,
  Warning,
} from "@mui/icons-material";
import axios from "axios";
import { format, differenceInHours, formatDistanceToNow } from "date-fns";
import { LEAD_STATUSES } from "@/constants/leads";

interface BulkAssignProps {
  onSuccess?: () => void;
  hideButton?: boolean;
  buttonId?: string;
}

const BulkAssign: React.FC<BulkAssignProps> = ({
  onSuccess,
  hideButton = false,
  buttonId,
}) => {
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Revert Confirmation Dialog State
  const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);
  const [batchIdToRevert, setBatchIdToRevert] = useState<string | null>(null);
  const [limit, setLimit] = useState<number | string>(10);
  const [assignTo, setAssignTo] = useState<string>("");
  const [status, setStatus] = useState<string>("new");
  const [errors, setErrors] = useState<{ limit?: string; assignTo?: string }>({});

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalHistory, setTotalHistory] = useState(0);

  // Availability Check State
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    open: boolean;
    availableCount: number;
    requestedCount: number;
    type: "none" | "partial";
  }>({
    open: false,
    availableCount: 0,
    requestedCount: 0,
    type: "none",
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/api/v0/employee/getAllEmployeeList", { params: { isCabVendor: false } });
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(
        `/api/v0/lead/assignment-history?page=${page + 1}&limit=${rowsPerPage}`
      );
      if (res.data.success) {
        setHistory(res.data.data);
        setTotalHistory(res.data.total);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchHistory();
    }
  }, [open, page, rowsPerPage]);

  useEffect(() => {
    if (open) {
      setPage(0); // Reset page when opening if needed, but fetchHistory is triggered by [open, page, rowsPerPage]
      fetchEmployees();
    }
  }, [open]);

  const handleAssign = async (bypassCheck = false) => {
    // Reset errors
    setErrors({});
    let hasError = false;
    const newErrors: { limit?: string; assignTo?: string } = {};

    if (!limit || Number(limit) <= 0) {
      newErrors.limit = "Please enter a valid number of leads (greater than 0)";
      hasError = true;
    }

    if (!assignTo) {
      newErrors.assignTo = "Please select an assignee";
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    if (!bypassCheck) {
      setLoading(true);
      try {
        const res = await axios.get(
          `/api/v0/lead/check-availability?status=${status}`
        );
        if (res.data.success) {
          const count = res.data.count;
          if (count === 0) {
            setAvailabilityCheck({
              open: true,
              availableCount: 0,
              requestedCount: Number(limit),
              type: "none",
            });
            setLoading(false);
            return;
          }
          if (count < Number(limit)) {
            setAvailabilityCheck({
              open: true,
              availableCount: count,
              requestedCount: Number(limit),
              type: "partial",
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Availability check failed", err);
      }
    }

    setLoading(true);
    setAvailabilityCheck((prev) => ({ ...prev, open: false }));
    try {
      const res = await axios.post("/api/v0/lead/bulk-assign", {
        limit: Number(limit),
        assignTo,
        status,
      });

      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "Bulk assignment started!",
          severity: "success",
        });
        setLimit(10);
        setAssignTo("");
        fetchHistory(); // refresh history
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Assignment failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = (batchId: string) => {
    setBatchIdToRevert(batchId);
    setRevertConfirmOpen(true);
  };

  const executeRevert = async () => {
    if (!batchIdToRevert) return;

    setLoading(true);
    setRevertConfirmOpen(false);
    try {
      const res = await axios.post("/api/v0/lead/revert-assign", {
        batchId: batchIdToRevert,
      });
      if (res.data.success) {
        setSnackbar({
          open: true,
          message: "Revert started!",
          severity: "success",
        });
        fetchHistory();
      }
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Revert failed",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setBatchIdToRevert(null);
    }
  };

  const handleDownload = (batchId: string) => {
    window.open(
      `/api/v0/lead/download-batch-report?batchId=${batchId}`,
      "_blank"
    );
  };

  return (
    <>
      <Button
        id={buttonId}
        variant="contained"
        startIcon={<Assignment />}
        onClick={() => setOpen(true)}
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
          ...(hideButton ? { display: "none" } : {}),
        }}
      >
        Bulk Assign
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle>
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            gap={{ xs: 2, sm: 0 }}
          >
            <Typography variant="h6" fontWeight="bold">
              Bulk Lead Assignment
            </Typography>
            <Tabs
              value={tabIndex}
              onChange={(e, v) => setTabIndex(v)}
              textColor="primary"
              indicatorColor="primary"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{ maxWidth: "100%" }}
            >
              <Tab
                label="Assign"
                icon={<Assignment fontSize="small" />}
                iconPosition="start"
              />
              <Tab
                label="History & Revert"
                icon={<HistoryIcon fontSize="small" />}
                iconPosition="start"
              />
            </Tabs>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {tabIndex === 0 && (
            <Box display="flex" flexDirection="column" gap={3} pt={1}>
              <TextField
                label="Number of Leads"
                type="number"
                value={limit}
                onChange={(e) => {
                  const val = e.target.value;
                  setLimit(val);
                  
                  const numVal = Number(val);
                  // Immediate validation
                  // Check if empty, not a number, or <= 0
                  if (val === "" || isNaN(numVal) || numVal <= 0) {
                     setErrors((prev) => ({
                      ...prev,
                      limit: "Please enter a valid number of leads (greater than 0)",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, limit: undefined }));
                  }
                }}
                fullWidth
                placeholder="eg - 10"
                InputLabelProps={{ shrink: true }}
                error={!!errors.limit}
                helperText={errors.limit}
              />

              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={status}
                  label="Status Filter"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="new">New</MenuItem>
                  {LEAD_STATUSES.map((s) => (
                    <MenuItem key={s} value={s}>
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Autocomplete
                options={employees}
                getOptionLabel={(option) => option.name || ""}
                value={employees.find((emp) => emp._id === assignTo) || null}
                onChange={(event, newValue) => {
                  setAssignTo(newValue ? newValue._id : "");
                  if (newValue) {
                    setErrors((prev) => ({ ...prev, assignTo: undefined }));
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assign To"
                    placeholder="Search by name or email..."
                    fullWidth
                    error={!!errors.assignTo}
                    helperText={errors.assignTo}
                  />
                )}
                renderOption={(props, option) => {
                  const { key, ...rest } = props;
                  return (
                    <Box
                      component="li"
                      key={option._id || option.id || key}
                      {...rest}
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start !important",
                        py: 0.75,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.3 }}>
                        {option.name}
                      </Typography>
                      {option.email && (
                        <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.3 }}>
                          {option.email}
                        </Typography>
                      )}
                    </Box>
                  );
                }}
                filterOptions={(options, { inputValue }) => {
                  const query = inputValue.toLowerCase();
                  return options.filter(
                    (opt) =>
                      (opt.name || "").toLowerCase().includes(query) ||
                      (opt.email || "").toLowerCase().includes(query)
                  );
                }}
                isOptionEqualToValue={(option, value) =>
                  option._id === value._id
                }
                noOptionsText="No employees found"
              />
            </Box>
          )}

          {tabIndex === 1 && (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ position: "relative", minHeight: 300 }}
            >
              {historyLoading && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(255, 255, 255, 0.7)",
                    zIndex: 2,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Assigned</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Download</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((row) => (
                    <TableRow key={row.batchId}>
                      <TableCell>
                        {format(new Date(row.timestamp), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{row.assigneeName || "Unknown"}</TableCell>
                      <TableCell>{row.count}</TableCell>
                      <TableCell>
                        <Tooltip title="Download Excel">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleDownload(row.batchId)}
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {row.isReverted ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="success"
                            disabled
                            startIcon={<CheckCircle />}
                            sx={{ textTransform: "none" }}
                          >
                            Reverted
                          </Button>
                        ) : differenceInHours(
                            new Date(),
                            new Date(row.timestamp)
                          ) >= 24 ? (
                          <Tooltip
                            title={`Revert action expired (was available for 24h)`}
                          >
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                color="warning"
                                disabled
                                startIcon={<Block />}
                                sx={{ textTransform: "none" }}
                              >
                                Expired
                              </Button>
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={`Revert available for next ${formatDistanceToNow(
                              new Date(
                                new Date(row.timestamp).getTime() +
                                  24 * 60 * 60 * 1000
                              )
                            )}`}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleRevert(row.batchId)}
                              disabled={loading}
                              startIcon={<Restore />}
                              sx={{ textTransform: "none" }}
                            >
                              Revert
                            </Button>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            borderTop: "1px solid rgba(0,0,0,0.12)",
            position: "relative",
            gap: 2,
          }}
        >
          {/* Left Spacer to keep center balanced */}
          <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />

          {/* Centered Pagination */}
          <Box
            sx={{
              flex: 2,
              display: "flex",
              justifyContent: "center",
              width: "100%",
              order: { xs: 2, md: 1 },
            }}
          >
            {tabIndex === 1 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalHistory}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                sx={{
                  borderBottom: "none",
                  "& .MuiTablePagination-toolbar": { minHeight: 48, p: 0 },
                  "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                    { mb: 0 },
                }}
              />
            )}
          </Box>

      {/* Right Aligned Buttons */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              width: "100%",
              order: { xs: 1, md: 2 },
            }}
          >
            <Button
              onClick={() => setOpen(false)}
              color="inherit"
              sx={{ fontWeight: 600, flex: { xs: 1, md: "initial" } }}
            >
              Close
            </Button>
            {tabIndex === 0 && (
              <Button
                onClick={() => handleAssign()}
                variant="contained"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <Assignment />
                  )
                }
                sx={{
                  borderRadius: "10px",
                  px: 4,
                  py: 1.2,
                  fontWeight: 700,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  whiteSpace: "nowrap",
                  minWidth: { xs: "auto", md: "max-content" },
                  width: { xs: "100%", md: "auto" },
                  flex: { xs: 2, md: "initial" },
                  boxShadow: "0 4px 14px 0 rgba(25, 118, 210, 0.39)",
                  "&:hover": {
                    boxShadow: "0 6px 20px rgba(25, 118, 210, 0.23)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                {loading ? "Assigning..." : "Assign Leads"}
              </Button>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <RevertConfirmDialog
        open={revertConfirmOpen}
        onClose={() => setRevertConfirmOpen(false)}
        onConfirm={executeRevert}
        loading={loading}
      />

      <AvailabilityDialog
        data={availabilityCheck}
        onClose={() =>
          setAvailabilityCheck((prev) => ({ ...prev, open: false }))
        }
        onConfirm={() => handleAssign(true)}
        loading={loading}
      />
    </>
  );
};

// Separate Confirmation Dialog for Revert
const RevertConfirmDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}> = ({ open, onClose, onConfirm, loading }) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: "bold" }}>Confirm Rollback</DialogTitle>
    <DialogContent>
      <Typography>
        Are you sure you want to revert this batch? This will restore the leads
        to their previous assignees.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} color="inherit" disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} />}
      >
        {loading ? "Processing..." : "Confirm Revert"}
      </Button>
    </DialogActions>
  </Dialog>
);

// Interactive Feedback Dialog for Availability Check
const AvailabilityDialog: React.FC<{
  data: {
    open: boolean;
    availableCount: number;
    requestedCount: number;
    type: "none" | "partial";
  };
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}> = ({ data, onClose, onConfirm, loading }) => {
  const isNone = data.type === "none";

  return (
    <Dialog
      open={data.open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1.5}>
          {isNone ? (
            <Info color="info" sx={{ fontSize: 32 }} />
          ) : (
            <Warning color="warning" sx={{ fontSize: 32 }} />
          )}
          <Typography variant="h6" fontWeight="bold">
            {isNone ? "Leads Unavailable" : "Partial Availability"}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          {isNone ? (
            <>
              We couldn't find any unassigned leads with your selected status.
              Please try a different status filter.
            </>
          ) : (
            <>
              You requested <strong>{data.requestedCount}</strong> leads, but
              only <strong>{data.availableCount}</strong> are currently
              available for assignment.
              <br />
              <br />
              Would you like to proceed with the available{" "}
              <strong>{data.availableCount}</strong> leads?
            </>
          )}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>
          {isNone ? "Okay" : "Cancel"}
        </Button>
        {!isNone && (
          <Button
            onClick={onConfirm}
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              borderRadius: "10px",
              px: 4,
              py: 1.2,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.95rem",
              whiteSpace: "nowrap",
              minWidth: "max-content",
              boxShadow: "0 4px 14px 0 rgba(25, 118, 210, 0.39)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(25, 118, 210, 0.23)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Proceed"
            )}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkAssign;
