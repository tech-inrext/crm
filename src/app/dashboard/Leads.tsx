import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import leadsData from "../../data/leads.json" assert { type: "json" };
import MySearchBar from "@/components/ui/MySearchBar";

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
  {
    label: "Actions",
    component: (
      row: Lead,
      {
        onEdit,
        onDelete,
      }: { onEdit: (lead: Lead) => void; onDelete: (lead: Lead) => void }
    ) => (
      <>
        <IconButton aria-label="edit" onClick={() => onEdit(row)} size="small">
          <Edit fontSize="inherit" />
        </IconButton>
        <IconButton
          aria-label="delete"
          onClick={() => onDelete(row)}
          size="small"
          color="error"
        >
          <Delete fontSize="inherit" />
        </IconButton>
      </>
    ),
  },
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
    <Box sx={{ mt: 2, mx: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          Leads
        </Typography>
        <MySearchBar
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search leads"
        />
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          sx={{ minWidth: 120 }}
        >
          Add Lead
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: "100%", overflow: "auto" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {header.map((head) => (
                    <TableCell key={head.label}>{head.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id} hover>
                    {header.map((head) => (
                      <TableCell key={head.label}>
                        {head.component
                          ? head.component(row, {
                              onEdit: handleOpen,
                              onDelete: handleDelete,
                            })
                          : row[head.dataKey as keyof Lead]}
                      </TableCell>
                    ))}
                  </TableRow>
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
          />
        </Paper>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="lead-dialog-title"
      >
        <DialogTitle id="lead-dialog-title">
          {editId ? "Edit Lead" : "Add Lead"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Company"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            required
            autoFocus
            inputProps={{ "aria-label": "Lead company" }}
          />
          <TextField
            label="Contact"
            value={form.contact}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, contact: e.target.value }))
            }
            required
            inputProps={{ "aria-label": "Lead contact" }}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            required
            type="email"
            inputProps={{ "aria-label": "Lead email" }}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            required
            inputProps={{ "aria-label": "Lead phone" }}
          />
          <TextField
            label="Status"
            value={form.status}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, status: e.target.value }))
            }
            required
            inputProps={{ "aria-label": "Lead status" }}
          />
          <TextField
            label="Value"
            value={form.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, value: e.target.value }))
            }
            required
            inputProps={{ "aria-label": "Lead value" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leads;
