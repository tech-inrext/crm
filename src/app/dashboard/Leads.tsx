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
import leadsData from "../../data/leads.json" assert { type: "json" };
import MySearchBar from "@/components/ui/MySearchBar";
import LeadsTableHeader from "../../components/ui/LeadsTableHeader";
import LeadsTableRow from "../../components/ui/LeadsTableRow";
import LeadDialog from "../../components/ui/LeadDialog";

interface Lead {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
  value: string;
}

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Lead, "id">>({
    name: "",
    contact: "",
    email: "",
    phone: "",
    status: "",
    value: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLeads(leadsData as Lead[]);
      setFiltered(leadsData as Lead[]);
      setLoading(false);
    }, 300);
  }, []);

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
  };
  // Add/Edit lead (in-memory only)
  const handleSave = () => {
    setSaving(true);
    let newList: Lead[];
    if (editId) {
      newList = leads.map((l) =>
        l.id === editId ? { id: editId, ...form } : l
      );
    } else {
      const newLead: Lead = {
        id: (Date.now() + Math.random()).toString(),
        ...form,
      };
      newList = [newLead, ...leads];
    }
    setLeads(newList);
    setOpen(false);
    setSaving(false);
  };
  // Delete lead (in-memory only)
  const handleDelete = (lead: Lead) => {
    if (!window.confirm(`Delete lead ${lead.name}?`)) return;
    setLeads((prev) => prev.filter((l) => l.id !== lead.id));
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
        </Box>
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          sx={{
            minWidth: 120,
            width: { xs: "100%", sm: "auto" },
            fontWeight: 600,
            bgcolor: "#1976d2",
            color: "#fff",
            boxShadow: 2,
          }}
        >
          Add Lead
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
