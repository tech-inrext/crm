// React & Core
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { UploadFile } from "@mui/icons-material";
import { Snackbar, Alert } from "@mui/material";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

// MUI Components
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableContainer,
  Paper,
  TablePagination,
  CircularProgress,
  Button,
  Fab,
  Tooltip,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// MUI Icons
import {
  Add,
  Edit,
  Delete,
  PersonAdd,
  ViewModule,
  ViewList,
  WidthFull,
} from "@mui/icons-material";

// Custom Components
import MySearchBar from "../../components/ui/MySearchBar";
import LeadsTableHeader from "../../components/leads/LeadsTableHeader";
import LeadsTableRow from "../../components/leads/LeadsTableRow";
import LeadDialog, { LeadFormData } from "../../components/leads/LeadDialog";
import PermissionGuard from "../../components/PermissionGuard";

// Shared Types
import type { Lead as APILead, LeadDisplay as Lead } from "../../types/lead";

// Backend utilities
import {
  transformAPILead,
  transformAPILeadToForm,
  transformFormToAPI,
  calculateLeadStats,
  getDefaultLeadFormData,
} from "../../utils/leadUtils";

// Constants & Types
const API_BASE = "/api/v0/lead";
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

// Import lead components and styles
import {
  LoadingSkeleton,
  StatsCard,
  LeadCard,
  GRADIENTS,
  COMMON_STYLES,
} from "../../components/leads";

// Frontend-only utility functions (UI-related)
const filterLeads = (leads: Lead[], searchQuery: string): Lead[] => {
  const q = searchQuery.toLowerCase();
  return leads.filter(
    (l) =>
      l?.fullName?.toLowerCase().includes(q) ||
      l?.contact?.toLowerCase().includes(q) ||
      l?.email?.toLowerCase().includes(q) ||
      l?.phone?.toLowerCase().includes(q) ||
      l?.status?.toLowerCase().includes(q)
  );
};

const Leads: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // State management
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [apiLeads, setApiLeads] = useState<APILead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(
    getDefaultLeadFormData()
  );

  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [uploadResult, setUploadResult] = useState<{
    uploaded: { name: string; phone: string }[];
    failed: { name: string; phone: string; reason: string }[];
  } | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"table" | "cards">(
    isMobile ? "cards" : "table"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized calculations
  const stats = useMemo(() => calculateLeadStats(leads), [leads]);

  const filtered = useMemo(() => filterLeads(leads, search), [leads, search]);

  const rows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  // Memoized header configuration
  const header = useMemo(
    () => [
      { label: "Name", dataKey: "fullName" },
      { label: "Email", dataKey: "email" },
      { label: "Phone", dataKey: "phone" },
      { label: "Status", dataKey: "status" },
      { label: "Budget", dataKey: "budgetRange" },
      {
        label: "Actions",
        component: (
          row: Lead,
          handlers: {
            onEdit: (lead: Lead) => void;
            onDelete: (lead: Lead) => void;
          }
        ) => (
          <Stack direction="row" spacing={1} justifyContent="center">
            {" "}
            <PermissionGuard module="lead" action="write" fallback={<></>}>
              <Tooltip title="Edit Lead">
                <IconButton
                  aria-label="edit"
                  onClick={() => handlers.onEdit(row)}
                  size="small"
                  sx={COMMON_STYLES.iconButton("primary.main", "primary.dark")}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard module="lead" action="delete" fallback={<></>}>
              <Tooltip title="Delete Lead">
                <IconButton
                  aria-label="delete"
                  onClick={() => handlers.onDelete(row)}
                  size="small"
                  sx={COMMON_STYLES.iconButton("error.main", "error.dark")}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Stack>
        ),
      },
    ],
    []
  );

  // Optimized event handlers with useCallback
  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE);
      const apiLeadsData = response.data.data || response.data;
      const transformedLeads = apiLeadsData.map(transformAPILead);
      setApiLeads(apiLeadsData);
      setLeads(transformedLeads);
    } catch (error) {
      console.error("Failed to load leads:", error);
      setApiLeads([]);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = useCallback(
    (lead?: Lead) => {
      if (lead) {
        const originalApiLead = apiLeads.find(
          (apiLead) => apiLead.leadId === lead.id
        );
        if (originalApiLead) {
          setEditId(lead.id);
          setFormData(transformAPILeadToForm(originalApiLead));
        }
      } else {
        setEditId(null);
        setFormData(getDefaultLeadFormData());
      }
      setOpen(true);
    },
    [apiLeads]
  );
  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setFormData(getDefaultLeadFormData());
  }, []);

  const handleSave = useCallback(
    async (values: LeadFormData) => {
      setSaving(true);
      try {
        if (editId) {
          const leadToUpdate = apiLeads.find((l) => l.leadId === editId);
          if (leadToUpdate && leadToUpdate._id) {
            const apiData = transformFormToAPI(values);
            const response = await axios.patch(
              `${API_BASE}/${leadToUpdate._id}`,
              apiData
            );
            const updatedApiLead = response.data.data || response.data;

            const newApiLeads = apiLeads.map((l) =>
              l.leadId === editId ? updatedApiLead : l
            );
            const newDisplayLeads = newApiLeads.map(transformAPILead);

            setApiLeads(newApiLeads);
            setLeads(newDisplayLeads);
          }
        } else {
          const apiData = transformFormToAPI(values);
          const response = await axios.post(API_BASE, apiData);
          const createdApiLead = response.data.data || response.data;
          const createdDisplayLead = transformAPILead(createdApiLead);

          setApiLeads([createdApiLead, ...apiLeads]);
          setLeads([createdDisplayLead, ...leads]);
        }
        handleClose();
      } catch (error) {
        console.error("Failed to save lead:", error);
        const errorMessage =
          error.response?.data?.errors?.join(", ") ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to save lead. Please check your connection and try again.";
        alert(`Error: ${errorMessage}`);
      } finally {
        setSaving(false);
      }
    },
    [editId, apiLeads, leads, handleClose]
  );

  const handleDelete = useCallback(
    async (lead: Lead) => {
      if (!window.confirm(`Delete lead ${lead.name}?`) || !lead._id) {
        if (!lead._id) console.error("Lead ID not found");
        return;
      }

      try {
        await axios.delete(`${API_BASE}/${lead._id}`);
        const newApiLeads = apiLeads.filter((l) => l.leadId !== lead.id);
        const newDisplayLeads = leads.filter((l) => l.id !== lead.id);
        setApiLeads(newApiLeads);
        setLeads(newDisplayLeads);
      } catch (error) {
        console.error("Failed to delete lead:", error);
      }
    },
    [apiLeads, leads]
  );

  const handleChangePage = useCallback(
    (_: unknown, newPage: number) => setPage(newPage),
    []
  );

  const handleChangeRowsPerPage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(e.target.value, 10));
      setPage(0);
    },
    []
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(0);
    },
    []
  );

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("file", file);

      setUploading(true);
      try {
        const res = await fetch("/api/v0/lead/bulk-upload", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Bulk upload failed.");
        }

        setUploadResult({
          uploaded: result.uploaded || [],
          failed: result.failed || [],
        });

        setSnackbarMessage(result.message);
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        setDialogOpen(true);
        await loadLeads();
      } catch (err: any) {
        setSnackbarMessage(`Upload failed: ${err.message}`);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setUploadResult(null);
      } finally {
        setUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // 👈 reset file input
        }
      }
    },
    [loadLeads]
  );

  const downloadFailedCSV = () => {
    if (!uploadResult?.failed?.length) return;

    const csvContent =
      "Name,Phone,Reason\n" +
      uploadResult.failed
        .map((l) => `"${l.name}","${l.phone}","${l.reason}"`)
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "failed_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  return (
    <Box
      sx={{
        p: { xs: 0.5, sm: 1, md: 2 }, // Much smaller padding on mobile
        pt: { xs: 1, sm: 2, md: 3 }, // Reduced top padding
        minHeight: "100vh",
        bgcolor: "background.default",
        overflow: "hidden", // Prevent horizontal scroll
      }}
    >
      {/* Mobile-First Header Section */}
      <Paper
        elevation={2}
        sx={{
          p: { xs: 1, sm: 2, md: 3 }, // Much smaller padding on mobile
          borderRadius: { xs: 1, sm: 2, md: 3 }, // Smaller border radius on mobile
          mb: { xs: 1, sm: 2, md: 3 }, // Reduced margins
          mt: { xs: 0.5, sm: 1, md: 2 }, // Reduced top margin
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          overflow: "hidden", // Prevent content overflow
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            mb: { xs: 2, md: 3 },
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          Leads
        </Typography>
        {/* Stats Cards - Mobile First Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: { xs: 0.5, sm: 1, md: 2 }, // Much smaller gaps on mobile
            mb: { xs: 1, sm: 2, md: 3 }, // Reduced bottom margin
          }}
        >
          <StatsCard
            value={stats.total}
            label="Total Leads"
            color="primary.main"
          />
          <StatsCard value={stats.new} label="New Leads" color="info.main" />
          <StatsCard
            value={stats.closed}
            label="Closed Deals"
            color="success.main"
          />
          <StatsCard
            value={`${stats.conversion}%`}
            label="Conversion Rate"
            color="warning.main"
          />
        </Box>
        {/* Mobile-First Action Bar */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
          {/* Title */}

          {/* Controls - Stacked on mobile */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 3 },
              alignItems: { xs: "stretch", md: "center" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                gap: { xs: 1, sm: 14 },
                justifyContent: { xs: "space-between", md: "flex-end" },
                order: { xs: 2, md: 1 },
              }}
            >
              {/* View Toggle - Compact on mobile */}
              {!isMobile && (
                <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>
                  {[
                    { mode: "table", icon: ViewList, title: "Table View" },
                    { mode: "cards", icon: ViewModule, title: "Card View" },
                  ].map(({ mode, icon: Icon, title }) => (
                    <Tooltip key={mode} title={title}>
                      <IconButton
                        onClick={() => setViewMode(mode as "table" | "cards")}
                        size={isMobile ? "small" : "medium"}
                        sx={{
                          backgroundColor:
                            viewMode === mode ? "primary.main" : "action.hover",
                          color: viewMode === mode ? "white" : "text.primary",
                          "&:hover": { backgroundColor: "primary.dark" },
                        }}
                      >
                        <Icon fontSize={isMobile ? "small" : "medium"} />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Stack>
              )}
              {/* Add Button */}
              <Box
                sx={{
                  width: { xs: "100%", md: "auto" },
                }}
              >
                <MySearchBar
                  sx={{
                    width: "100%",
                    md: "auto",
                    minWidth: 280,
                  }}
                  value={search}
                  onChange={handleSearchChange}
                  placeholder="Search leads by name, email, phone..."
                />
                <Snackbar
                  open={snackbarOpen}
                  autoHideDuration={4000}
                  onClose={() => setSnackbarOpen(false)}
                  anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                  <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    sx={{ width: "100%" }}
                  >
                    {snackbarMessage}
                  </Alert>
                </Snackbar>
                <Dialog
                  open={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  fullWidth
                  maxWidth="md"
                >
                  <DialogTitle>📋 Lead Upload Summary</DialogTitle>
                  <DialogContent dividers>
                    <Typography fontWeight={600} mb={2}>
                      📦 Total Records:{" "}
                      {(uploadResult?.uploaded?.length || 0) +
                        (uploadResult?.failed?.length || 0)}
                    </Typography>

                    {uploadResult?.uploaded?.length > 0 && (
                      <>
                        <Typography fontWeight={600} mb={1}>
                          ✅ Uploaded Leads: {uploadResult.uploaded.length}
                        </Typography>
                      </>
                    )}

                    {uploadResult?.failed?.length > 0 && (
                      <>
                        <Typography fontWeight={600} mb={1}>
                          ⚠️ Failed Leads: {uploadResult.failed.length}{" "}
                          {" - Please download the report to view details."}
                        </Typography>
                      </>
                    )}

                    {uploadResult?.uploaded?.length === 0 &&
                      uploadResult?.failed?.length === 0 && (
                        <Typography>No records were processed.</Typography>
                      )}
                  </DialogContent>

                  <DialogActions>
                    {uploadResult?.failed?.length > 0 && (
                      <Button
                        onClick={downloadFailedCSV}
                        color="warning"
                        variant="outlined"
                      >
                        Download Failed Leads
                      </Button>
                    )}
                    <Button
                      onClick={() => setDialogOpen(false)}
                      autoFocus
                      variant="contained"
                    >
                      Close
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>{" "}
              {/* Add Button */}
              {!isMobile && (
                <PermissionGuard module="lead" action="write" fallback={<></>}>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    {/* Add Lead Button */}
                    <Button
                      variant="contained"
                      startIcon={<PersonAdd />}
                      onClick={() => handleOpen()}
                      disabled={saving}
                      size={isMobile ? "medium" : "large"}
                      sx={{
                        minWidth: { xs: "auto", sm: 150 },
                        height: { xs: 44, sm: 40 },
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                        "&:hover": {
                          boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      {saving ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : isMobile ? (
                        <Add />
                      ) : (
                        "Add Lead"
                      )}
                    </Button>

                    {/* Upload Excel Button */}
                    <label
                      htmlFor="bulk-upload-excel"
                      style={{ display: "inline-block" }}
                    >
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
                          uploading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <UploadFile />
                          )
                        }
                        component="span"
                        size="large"
                        disabled={uploading}
                        sx={{
                          minWidth: 150,
                          height: 44,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: "1rem",
                          boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                          "&:hover": {
                            boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        {uploading ? "Uploading..." : "Upload Excel"}
                      </Button>
                    </label>
                  </Box>
                </PermissionGuard>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
      {/* Content Area */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {" "}
          {viewMode === "cards" ? (
            /* Card View */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 3,
              }}
            >
              {rows.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={handleOpen}
                  onDelete={handleDelete}
                />
              ))}
            </Box>
          ) : (
            /* Table View */ <Paper
              elevation={8}
              sx={{
                ...COMMON_STYLES.roundedPaper,
                overflow: "hidden",
              }}
            >
              <TableContainer sx={{ maxHeight: "70vh" }}>
                <Table stickyHeader size="medium" sx={{ minWidth: 750 }}>
                  <LeadsTableHeader header={header} />
                  <TableBody>
                    {rows.map((row) => (
                      <LeadsTableRow
                        key={row.id}
                        row={row}
                        header={header}
                        onEdit={handleOpen}
                        onDelete={handleDelete}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}
              >
                <TablePagination
                  component="div"
                  count={filtered.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                  labelRowsPerPage="Rows per page:"
                  sx={{
                    ".MuiTablePagination-toolbar": { px: 0 },
                    ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                      {
                        fontSize: { xs: 14, sm: 16 },
                        fontWeight: 600,
                      },
                  }}
                />
              </Box>
            </Paper>
          )}
        </>
      )}
      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <Fab
            color="primary"
            aria-label="add lead"
            onClick={() => handleOpen()}
            disabled={saving}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              background: GRADIENTS.button,
              "&:hover": {
                background: GRADIENTS.buttonHover,
              },
            }}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : <Add />}
          </Fab>
        </PermissionGuard>
      )}
      {/* Lead Dialog */}
      <LeadDialog
        open={open}
        editId={editId}
        initialData={formData}
        saving={saving}
        onClose={handleClose}
        onSave={handleSave}
      />
    </Box>
  );
};

export default Leads;
