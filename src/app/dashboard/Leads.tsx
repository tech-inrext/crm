import React, { useEffect, useState, useMemo } from "react";
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
  Card,
  CardContent,
  Chip,
  Avatar,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  PersonAdd,
  Phone,
  Email,
  TrendingUp,
  ViewModule,
  ViewList,
} from "@mui/icons-material";
import axios from "axios";
import MySearchBar from "../../components/ui/MySearchBar";
import LeadsTableHeader from "../../components/ui/LeadsTableHeader";
import LeadsTableRow from "../../components/ui/LeadsTableRow";
import LeadDialog, { LeadFormData } from "../../components/ui/LeadDialog";
import PermissionGuard from "../../components/PermissionGuard";

// Frontend Lead interface (for display in table)
export interface Lead {
  _id?: string;
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
  value: string;
}

// API Lead interface (matching backend model)
interface APILead {
  _id: string;
  leadId: string;
  fullName: string;
  email: string;
  phone: string;
  propertyType: string;
  location?: string;
  budgetRange?: string;
  status: string;
  source?: string;
  assignedTo?: string;
  followUpNotes?: Array<{ note: string; date: string }>;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = "/api/v0/lead";

// Transform API lead to frontend format for table display
const transformAPILead = (apiLead: APILead): Lead => {
  return {
    _id: apiLead._id,
    id: apiLead.leadId,
    name: apiLead.fullName,
    contact: apiLead.phone,
    email: apiLead.email || "",
    phone: apiLead.phone,
    status: apiLead.status,
    value: apiLead.budgetRange || "Not specified",
  };
};

// Transform API lead to form data for editing
const transformAPILeadToForm = (apiLead: APILead): LeadFormData => {
  return {
    fullName: apiLead.fullName,
    email: apiLead.email || "",
    phone: apiLead.phone,
    propertyType: apiLead.propertyType,
    location: apiLead.location || "",
    budgetRange: apiLead.budgetRange || "",
    status: apiLead.status,
    source: apiLead.source || "",
    assignedTo: apiLead.assignedTo || "",
    nextFollowUp: apiLead.nextFollowUp
      ? new Date(apiLead.nextFollowUp).toISOString().split("T")[0]
      : "",
    followUpNotes: (apiLead.followUpNotes || []).map((note) => ({
      note: note.note,
      date: new Date(note.date).toISOString().split("T")[0],
    })),
  };
};

// Transform form data to API format
const transformFormToAPI = (
  formData: LeadFormData,
  leadId?: string
): Partial<APILead> => {
  // Clean phone number - remove all non-digit characters
  const cleanPhone = formData.phone.replace(/\D/g, "");

  const apiData: Partial<APILead> = {
    fullName: formData.fullName.trim(),
    email: formData.email?.trim() || undefined, // Don't send empty string
    phone: cleanPhone,
    propertyType: formData.propertyType,
    location: formData.location?.trim() || undefined,
    budgetRange: formData.budgetRange?.trim() || undefined,
    status: formData.status,
    source: formData.source?.trim() || undefined,
    assignedTo: formData.assignedTo?.trim() || undefined,
    nextFollowUp:
      formData.nextFollowUp && formData.nextFollowUp.trim()
        ? new Date(formData.nextFollowUp).toISOString()
        : undefined,
    followUpNotes: formData.followUpNotes
      .filter((note) => note.note.trim()) // Only include non-empty notes
      .map((note) => ({
        note: note.note.trim(),
        date: new Date(note.date).toISOString(),
      })),
  };

  if (leadId) {
    apiData.leadId = leadId;
  }

  return apiData;
};

// Default form data
const defaultFormData: LeadFormData = {
  fullName: "",
  email: "",
  phone: "",
  propertyType: "",
  location: "",
  budgetRange: "",
  status: "New",
  source: "",
  assignedTo: "",
  nextFollowUp: "",
  followUpNotes: [],
};

const Leads: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [apiLeads, setApiLeads] = useState<APILead[]>([]); // Store original API data
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LeadFormData>(defaultFormData);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Header configuration for the table
  const header = [
    { label: "Name", dataKey: "name" },
    { label: "Email", dataKey: "email" },
    { label: "Phone", dataKey: "phone" },
    { label: "Status", dataKey: "status" },
    { label: "Budget", dataKey: "value" },
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
          <PermissionGuard module="lead" action="write" hideWhenNoAccess>
            <Tooltip title="Edit Lead">
              <IconButton
                aria-label="edit"
                onClick={() => handlers.onEdit(row)}
                size="small"
                sx={{
                  backgroundColor: "primary.main",
                  color: "white",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          </PermissionGuard>
          <PermissionGuard module="lead" action="delete" hideWhenNoAccess>
            <Tooltip title="Delete Lead">
              <IconButton
                aria-label="delete"
                onClick={() => handlers.onDelete(row)}
                size="small"
                sx={{
                  backgroundColor: "error.main",
                  color: "white",
                  "&:hover": { backgroundColor: "error.dark" },
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </PermissionGuard>
        </Stack>
      ),
    },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE);
      const apiLeadsData = response.data.data || response.data;
      const transformedLeads = apiLeadsData.map(transformAPILead);
      setApiLeads(apiLeadsData); // Store original API data
      setLeads(transformedLeads);
      setFiltered(transformedLeads);
    } catch (error) {
      console.error("Failed to load leads:", error);
      setApiLeads([]);
      setLeads([]);
      setFiltered([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.contact.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.status.toLowerCase().includes(q)
      )
    );
    setPage(0);
  }, [search, leads]);

  const rows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Modal open/close
  const handleOpen = (lead?: Lead) => {
    if (lead) {
      // Find the original API data for this lead
      const originalApiLead = apiLeads.find(
        (apiLead) => apiLead.leadId === lead.id
      );
      if (originalApiLead) {
        setEditId(lead.id);
        setFormData(transformAPILeadToForm(originalApiLead));
      }
    } else {
      setEditId(null);
      setFormData(defaultFormData);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setFormData(defaultFormData);
  };

  // Add/Edit lead via API with new form structure
  const handleSave = async (values: LeadFormData) => {
    setSaving(true);
    try {
      if (editId) {
        // Update existing lead
        const leadToUpdate = apiLeads.find((l) => l.leadId === editId);
        if (leadToUpdate && leadToUpdate._id) {
          const apiData = transformFormToAPI(values, editId);
          const response = await axios.patch(
            `${API_BASE}/${leadToUpdate._id}`,
            apiData
          );
          const updatedApiLead = response.data.data || response.data;

          // Update both API leads and display leads
          const newApiLeads = apiLeads.map((l) =>
            l.leadId === editId ? updatedApiLead : l
          );
          const newDisplayLeads = newApiLeads.map(transformAPILead);

          setApiLeads(newApiLeads);
          setLeads(newDisplayLeads);
          setFiltered(
            newDisplayLeads.filter(
              (l) =>
                l.name.toLowerCase().includes(search.toLowerCase()) ||
                l.contact.toLowerCase().includes(search.toLowerCase()) ||
                l.email.toLowerCase().includes(search.toLowerCase()) ||
                l.phone.toLowerCase().includes(search.toLowerCase()) ||
                l.status.toLowerCase().includes(search.toLowerCase())
            )
          );
        }
      } else {
        // Create new lead
        const newLeadId = `LEAD-${Date.now()}`;
        const apiData = transformFormToAPI(values, newLeadId);
        const response = await axios.post(API_BASE, apiData);
        const createdApiLead = response.data.data || response.data;
        const createdDisplayLead = transformAPILead(createdApiLead);

        const newApiLeads = [createdApiLead, ...apiLeads];
        const newDisplayLeads = [createdDisplayLead, ...leads];

        setApiLeads(newApiLeads);
        setLeads(newDisplayLeads);
        setFiltered([createdDisplayLead, ...filtered]);
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save lead:", error);

      // Show detailed error message to user
      if (error.response?.data?.errors) {
        // Validation errors from MongoDB
        const errorMessages = error.response.data.errors.join(", ");
        alert(`Validation Error: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        // Custom error message from API
        alert(`Error: ${error.response.data.message}`);
      } else if (error.response?.data?.error) {
        // General error from API
        alert(`Error: ${error.response.data.error}`);
      } else {
        // Network or other errors
        alert(
          "Failed to save lead. Please check your connection and try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete lead via API
  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Delete lead ${lead.name}?`)) return;

    if (!lead._id) {
      console.error("Lead ID not found");
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${lead._id}`);
      const newApiLeads = apiLeads.filter((l) => l.leadId !== lead.id);
      const newDisplayLeads = leads.filter((l) => l.id !== lead.id);

      setApiLeads(newApiLeads);
      setLeads(newDisplayLeads);
      setFiltered(
        newDisplayLeads.filter(
          (l) =>
            l.name.toLowerCase().includes(search.toLowerCase()) ||
            l.contact.toLowerCase().includes(search.toLowerCase()) ||
            l.email.toLowerCase().includes(search.toLowerCase()) ||
            l.phone.toLowerCase().includes(search.toLowerCase()) ||
            l.status.toLowerCase().includes(search.toLowerCase())
        )
      );
    } catch (error) {
      console.error("Failed to delete lead:", error);
    }
  };
  // Enhanced stats calculation
  const stats = useMemo(() => {
    return {
      total: leads.length,
      new: leads.filter((l) => l.status === "New").length,
      contacted: leads.filter((l) => l.status === "Contacted").length,
      closed: leads.filter((l) => l.status === "Closed").length,
      conversion:
        leads.length > 0
          ? (
              (leads.filter((l) => l.status === "Closed").length /
                leads.length) *
              100
            ).toFixed(1)
          : "0",
    };
  }, [leads]);

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "#2196F3";
      case "contacted":
        return "#FF9800";
      case "site visit":
        return "#9C27B0";
      case "closed":
        return "#4CAF50";
      case "dropped":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  // Get status chip variant
  const getStatusChip = (status: string) => (
    <Chip
      label={status}
      size="small"
      sx={{
        backgroundColor: getStatusColor(status),
        color: "white",
        fontWeight: 600,
        fontSize: "0.75rem",
        minWidth: "80px",
      }}
    />
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ mt: 2 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} sx={{ mb: 2, p: 2 }}>
          <Stack spacing={1}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={60} />
          </Stack>
        </Card>
      ))}
    </Box>
  );

  // Enhanced Card View Component
  const LeadCard = ({ lead }: { lead: Lead }) => (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          elevation: 8,
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
        },
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header with Avatar and Status */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: getStatusColor(lead.status),
                  width: 48,
                  height: 48,
                  fontSize: "1.2rem",
                  fontWeight: 700,
                }}
              >
                {lead.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {lead.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {lead.id}
                </Typography>
              </Box>
            </Box>
            {getStatusChip(lead.status)}
          </Box>

          <Divider />

          {/* Contact Information */}
          <Stack spacing={1}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Email sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography variant="body2" color="text.primary">
                {lead.email || "Not provided"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Phone sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography variant="body2" color="text.primary">
                {lead.phone}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <TrendingUp sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography variant="body2" color="text.primary" fontWeight={600}>
                {lead.value}
              </Typography>
            </Box>
          </Stack>

          {/* Actions */}
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            <PermissionGuard module="lead" action="write" hideWhenNoAccess>
              <Tooltip title="Edit Lead">
                <IconButton
                  onClick={() => handleOpen(lead)}
                  size="small"
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard module="lead" action="delete" hideWhenNoAccess>
              <Tooltip title="Delete Lead">
                <IconButton
                  onClick={() => handleDelete(lead)}
                  size="small"
                  sx={{
                    backgroundColor: "error.main",
                    color: "white",
                    "&:hover": { backgroundColor: "error.dark" },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#f5f7fa" }} />;

  return (
    <Box
      sx={{
        mt: { xs: 1, md: 3 },
        mx: { xs: 1, md: 3 },
        width: "calc(100% - 16px)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 4,
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      {/* Enhanced Header Section */}
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          mb: 3,
        }}
      >
        {" "}
        {/* Stats Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(4, 1fr)" },
            gap: 3,
            mb: 4,
          }}
        >
          <Card
            elevation={3}
            sx={{ textAlign: "center", p: 2, borderRadius: 3 }}
          >
            <Typography variant="h4" fontWeight={700} color="primary.main">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Leads
            </Typography>
          </Card>
          <Card
            elevation={3}
            sx={{ textAlign: "center", p: 2, borderRadius: 3 }}
          >
            <Typography variant="h4" fontWeight={700} color="info.main">
              {stats.new}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              New Leads
            </Typography>
          </Card>
          <Card
            elevation={3}
            sx={{ textAlign: "center", p: 2, borderRadius: 3 }}
          >
            <Typography variant="h4" fontWeight={700} color="success.main">
              {stats.closed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Closed Deals
            </Typography>
          </Card>
          <Card
            elevation={3}
            sx={{ textAlign: "center", p: 2, borderRadius: 3 }}
          >
            <Typography variant="h4" fontWeight={700} color="warning.main">
              {stats.conversion}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conversion Rate
            </Typography>
          </Card>
        </Box>
        {/* Action Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            gap: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              flex: 1,
              color: "text.primary",
              fontSize: { xs: 24, sm: 28, md: 32 },
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Leads Management
          </Typography>

          {/* View Toggle Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Table View">
              <IconButton
                onClick={() => setViewMode("table")}
                sx={{
                  backgroundColor:
                    viewMode === "table" ? "primary.main" : "action.hover",
                  color: viewMode === "table" ? "white" : "text.primary",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
            <Tooltip title="Card View">
              <IconButton
                onClick={() => setViewMode("cards")}
                sx={{
                  backgroundColor:
                    viewMode === "cards" ? "primary.main" : "action.hover",
                  color: viewMode === "cards" ? "white" : "text.primary",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Search Bar */}
          <Box
            sx={{ flex: { xs: 1, lg: 2 }, minWidth: { xs: "100%", sm: 280 } }}
          >
            <MySearchBar
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search leads by name, email, phone..."
            />
          </Box>

          {/* Add Lead Button */}
          <PermissionGuard module="lead" action="write" hideWhenNoAccess>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => handleOpen()}
              disabled={saving}
              sx={{
                minWidth: 160,
                height: 48,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  background: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
                  boxShadow: "0 12px 24px rgba(102, 126, 234, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Add Lead"
              )}
            </Button>
          </PermissionGuard>
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
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </Box>
          ) : (
            /* Table View */
            <Paper
              elevation={8}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
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
                  rowsPerPageOptions={[5, 10, 25, 50]}
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
        <PermissionGuard module="lead" action="write" hideWhenNoAccess>
          <Fab
            color="primary"
            aria-label="add lead"
            onClick={() => handleOpen()}
            disabled={saving}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
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
