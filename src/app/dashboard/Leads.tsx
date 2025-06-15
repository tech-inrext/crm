import React, { useEffect, useState, useMemo, memo, useCallback } from "react";
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

// Constants & Types
const API_BASE = "/api/v0/lead";
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const STATUS_COLORS = {
  new: "#2196F3",
  contacted: "#FF9800",
  "site visit": "#9C27B0",
  closed: "#4CAF50",
  dropped: "#F44336",
  default: "#757575",
} as const;

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

// Consolidated style constants
const GRADIENTS = {
  primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  paper: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  button: "linear-gradient(45deg, #667eea, #764ba2)",
  buttonHover: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
};

const COMMON_STYLES = {
  roundedPaper: {
    borderRadius: 4,
    background: GRADIENTS.paper,
    border: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
  },
  iconButton: (bg: string, hover?: string) => ({
    backgroundColor: bg,
    color: "white",
    "&:hover": { backgroundColor: hover || `${bg}99` },
  }),
  gradientText: {
    background: GRADIENTS.button,
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
};

// Utility functions as object for better organization
const utils = {
  transformAPILead: (apiLead: APILead): Lead => ({
    _id: apiLead._id,
    id: apiLead.leadId,
    name: apiLead.fullName,
    contact: apiLead.phone,
    email: apiLead.email || "",
    phone: apiLead.phone,
    status: apiLead.status,
    value: apiLead.budgetRange || "Not specified",
  }),

  transformAPILeadToForm: (apiLead: APILead): LeadFormData => ({
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
  }),

  transformFormToAPI: (
    formData: LeadFormData,
    leadId?: string
  ): Partial<APILead> => {
    const cleanPhone = formData.phone.replace(/\D/g, "");
    const apiData: Partial<APILead> = {
      fullName: formData.fullName.trim(),
      email: formData.email?.trim() || undefined,
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
        .filter((note) => note.note.trim())
        .map((note) => ({
          note: note.note.trim(),
          date: new Date(note.date).toISOString(),
        })),
    };
    if (leadId) apiData.leadId = leadId;
    return apiData;
  },

  getStatusColor: (status: string): string =>
    STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.default,

  calculateStats: (leads: Lead[]) => ({
    total: leads.length,
    new: leads.filter((l) => l.status === "New").length,
    contacted: leads.filter((l) => l.status === "Contacted").length,
    closed: leads.filter((l) => l.status === "Closed").length,
    conversion:
      leads.length > 0
        ? (
            (leads.filter((l) => l.status === "Closed").length / leads.length) *
            100
          ).toFixed(1)
        : "0",
  }),

  filterLeads: (leads: Lead[], searchQuery: string): Lead[] => {
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.contact.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q) ||
        l.status.toLowerCase().includes(q)
    );
  },
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

// Memoized Components
const StatusChip = memo(({ status }: { status: string }) => (
  <Chip
    label={status}
    size="small"
    sx={{
      backgroundColor: utils.getStatusColor(status),
      color: "white",
      fontWeight: 600,
      fontSize: "0.75rem",
      minWidth: "80px",
    }}
  />
));
StatusChip.displayName = "StatusChip";

const LoadingSkeleton = memo(() => (
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
));
LoadingSkeleton.displayName = "LoadingSkeleton";

const StatsCard = memo(
  ({
    value,
    label,
    color,
  }: {
    value: string | number;
    label: string;
    color: string;
  }) => (
    <Card elevation={3} sx={{ textAlign: "center", p: 2, borderRadius: 3 }}>
      <Typography variant="h4" fontWeight={700} color={color}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Card>
  )
);
StatsCard.displayName = "StatsCard";

const LeadCard = memo(
  ({
    lead,
    onEdit,
    onDelete,
  }: {
    lead: Lead;
    onEdit: (lead: Lead) => void;
    onDelete: (lead: Lead) => void;
  }) => (
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
        background: GRADIENTS.paper,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
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
                  bgcolor: utils.getStatusColor(lead.status),
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
            <StatusChip status={lead.status} />
          </Box>

          <Divider />

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

          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2 }}
          >
            {" "}
            <PermissionGuard module="lead" action="write" hideWhenNoAccess>
              <Tooltip title="Edit Lead">
                <IconButton
                  onClick={() => onEdit(lead)}
                  size="small"
                  sx={COMMON_STYLES.iconButton("primary.main", "primary.dark")}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard module="lead" action="delete" hideWhenNoAccess>
              <Tooltip title="Delete Lead">
                <IconButton
                  onClick={() => onDelete(lead)}
                  size="small"
                  sx={COMMON_STYLES.iconButton("error.main", "error.dark")}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
);
LeadCard.displayName = "LeadCard";

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
  const [formData, setFormData] = useState<LeadFormData>(defaultFormData);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Memoized calculations
  const stats = useMemo(() => utils.calculateStats(leads), [leads]);

  const filtered = useMemo(
    () => utils.filterLeads(leads, search),
    [leads, search]
  );

  const rows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  // Memoized header configuration
  const header = useMemo(
    () => [
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
            {" "}
            <PermissionGuard module="lead" action="write" hideWhenNoAccess>
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
            <PermissionGuard module="lead" action="delete" hideWhenNoAccess>
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
      const transformedLeads = apiLeadsData.map(utils.transformAPILead);
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
          setFormData(utils.transformAPILeadToForm(originalApiLead));
        }
      } else {
        setEditId(null);
        setFormData(defaultFormData);
      }
      setOpen(true);
    },
    [apiLeads]
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setFormData(defaultFormData);
  }, []);

  const handleSave = useCallback(
    async (values: LeadFormData) => {
      setSaving(true);
      try {
        if (editId) {
          const leadToUpdate = apiLeads.find((l) => l.leadId === editId);
          if (leadToUpdate && leadToUpdate._id) {
            const apiData = utils.transformFormToAPI(values, editId);
            const response = await axios.patch(
              `${API_BASE}/${leadToUpdate._id}`,
              apiData
            );
            const updatedApiLead = response.data.data || response.data;

            const newApiLeads = apiLeads.map((l) =>
              l.leadId === editId ? updatedApiLead : l
            );
            const newDisplayLeads = newApiLeads.map(utils.transformAPILead);

            setApiLeads(newApiLeads);
            setLeads(newDisplayLeads);
          }
        } else {
          const newLeadId = `LEAD-${Date.now()}`;
          const apiData = utils.transformFormToAPI(values, newLeadId);
          const response = await axios.post(API_BASE, apiData);
          const createdApiLead = response.data.data || response.data;
          const createdDisplayLead = utils.transformAPILead(createdApiLead);

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
  // Effects
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#f5f7fa" }} />;

  return (
    <Box
      sx={{
        mt: { xs: 1, md: 3 },
        mx: { xs: 1, md: 3 },
        width: "calc(100% - 16px)",
        background: GRADIENTS.primary,
        borderRadius: 4,
        p: { xs: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      {/* Enhanced Header Section */}{" "}
      <Paper
        elevation={8}
        sx={{
          p: { xs: 2, md: 4 },
          ...COMMON_STYLES.roundedPaper,
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
          {" "}
          {/* Controls: Title, View Toggle, Search, Add Button */}
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              flex: 1,
              color: "text.primary",
              fontSize: { xs: 24, sm: 28, md: 32 },
              ...COMMON_STYLES.gradientText,
            }}
          >
            Leads Management
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            {/* View Toggle */}
            {[
              { mode: "table", icon: ViewList, title: "Table View" },
              { mode: "cards", icon: ViewModule, title: "Card View" },
            ].map(({ mode, icon: Icon, title }) => (
              <Tooltip key={mode} title={title}>
                <IconButton
                  onClick={() => setViewMode(mode as "table" | "cards")}
                  sx={{
                    backgroundColor:
                      viewMode === mode ? "primary.main" : "action.hover",
                    color: viewMode === mode ? "white" : "text.primary",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                >
                  <Icon />
                </IconButton>
              </Tooltip>
            ))}

            {/* Search */}
            <Box sx={{ minWidth: 280 }}>
              <MySearchBar
                value={search}
                onChange={handleSearchChange}
                placeholder="Search leads by name, email, phone..."
              />
            </Box>

            {/* Add Button */}
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
                  background: GRADIENTS.button,
                  boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                  "&:hover": {
                    background: GRADIENTS.buttonHover,
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
          </Stack>
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
