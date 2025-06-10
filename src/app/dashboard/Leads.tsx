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
} from "@mui/material";
import axios from "axios";
import MySearchBar from "@/components/ui/MySearchBar";
import LeadsTableHeader from "../../components/ui/LeadsTableHeader";
import LeadsTableRow from "../../components/ui/LeadsTableRow";
import LeadDialog from "../../components/ui/LeadDialog";

// Frontend Lead interface (matching current UI structure)
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

// Transform API lead to frontend format
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

// Transform frontend lead to API format
const transformToAPILead = (lead: Omit<Lead, "_id">): Partial<APILead> => {
  return {
    leadId: lead.id,
    fullName: lead.name,
    email: lead.email,
    phone: lead.phone,
    propertyType: "Buy", // Default - could be made configurable
    location: "Not specified", // Default
    budgetRange: lead.value !== "Not specified" ? lead.value : undefined,
    status: lead.status || "New",
    source: "Web Form", // Default
  };
};

const header = [
  { label: "Company", dataKey: "name" },
  { label: "Contact", dataKey: "contact" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  { label: "Status", dataKey: "status" },
  { label: "Value", dataKey: "value" },
  { label: "Actions" },
];

const Leads: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filtered, setFiltered] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Lead, "id" | "_id">>({
    name: "",
    contact: "",
    email: "",
    phone: "",
    status: "",
    value: "",
  });

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
      const apiLeads = response.data.data || response.data;
      const transformedLeads = apiLeads.map(transformAPILead);
      setLeads(transformedLeads);
      setFiltered(transformedLeads);
    } catch (error) {
      console.error("Failed to load leads:", error);
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
      setEditId(lead.id);
      setForm({
        name: lead.name,
        contact: lead.contact,
        email: lead.email,
        phone: lead.phone,
        status: lead.status,
        value: lead.value,
      });
    } else {
      setEditId(null);
      setForm({
        name: "",
        contact: "",
        email: "",
        phone: "",
        status: "",
        value: "",
      });
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setEditId(null);
    setForm({
      name: "",
      contact: "",
      email: "",
      phone: "",
      status: "",
      value: "",
    });
  }; // Add/Edit lead via API
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        // Update existing lead
        const leadToUpdate = leads.find((l) => l.id === editId);
        if (leadToUpdate && leadToUpdate._id) {
          const apiData = transformToAPILead({ id: editId, ...form });
          await axios.patch(`${API_BASE}/${leadToUpdate._id}`, apiData);

          const updatedLead = { ...leadToUpdate, ...form };
          const newList = leads.map((l) => (l.id === editId ? updatedLead : l));
          setLeads(newList);
          setFiltered(
            newList.filter(
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
        const apiData = transformToAPILead({ id: newLeadId, ...form });
        const response = await axios.post(API_BASE, apiData);
        const createdLead = transformAPILead(
          response.data.data || response.data
        );

        const newList = [createdLead, ...leads];
        setLeads(newList);
        setFiltered([createdLead, ...filtered]);
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save lead:", error);
    } finally {
      setSaving(false);
    }
  }; // Delete lead via API
  const handleDelete = async (lead: Lead) => {
    if (!window.confirm(`Delete lead ${lead.name}?`)) return;

    if (!lead._id) {
      console.error("Lead ID not found");
      return;
    }

    try {
      await axios.delete(`${API_BASE}/${lead._id}`);
      const newList = leads.filter((l) => l.id !== lead.id);
      setLeads(newList);
      setFiltered(
        newList.filter(
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

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#181C1F" }} />;

  return (
    <Box sx={{ mt: { xs: 1, md: 3 }, mx: { xs: 0, md: 2 }, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            flex: 1,
            color: "black",
            fontSize: { xs: 20, sm: 24 },
          }}
        >
          Leads
        </Typography>
        <Box sx={{ flex: 2, minWidth: { xs: "100%", sm: 220 } }}>
          {" "}
          <Box sx={{ width: "100%" }}>
            <MySearchBar
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearch(e.target.value)
              }
              placeholder="Search leads"
            />
          </Box>
        </Box>{" "}
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          disabled={saving}
          sx={{
            minWidth: 120,
            width: { xs: "100%", sm: "auto" },
            fontWeight: 600,
            bgcolor: "#1976d2",
            color: "#fff",
            boxShadow: 2,
          }}
        >
          {saving ? <CircularProgress size={20} color="inherit" /> : "Add Lead"}
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          sx={{
            width: "100%",
            overflowX: "auto",
            borderRadius: 3,
            boxShadow: 3,
            p: { xs: 1, sm: 2 },
            bgcolor: "#f5f7fa",
          }}
        >
          <TableContainer sx={{ minWidth: 350 }}>
            <Table size="small" sx={{ minWidth: 650 }}>
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
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Rows"
            sx={{
              ".MuiTablePagination-toolbar": { px: { xs: 0, sm: 2 } },
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                { fontSize: { xs: 12, sm: 14 } },
            }}
          />
        </Paper>
      )}
      <LeadDialog
        open={open}
        editId={editId}
        form={form}
        saving={saving}
        onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
        onClose={handleClose}
        onSave={handleSave}
      />
    </Box>
  );
};

export default Leads;
