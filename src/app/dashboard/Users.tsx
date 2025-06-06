import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TableContainer,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TablePagination,
  useMediaQuery,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import employeesData from "../../data/employees.json";
import MySearchBar from "@/components/ui/MySearchBar";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useSyncExternalStore } from "react";
import TableMap, { TableHeader } from "@/components/ui/TableMap";
import type { Employee } from "@/types/employee";

// Table header definition: supports both data and action columns

const header: TableHeader<Employee>[] = [
  { label: "Name", dataKey: "name" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  { label: "Role", dataKey: "role" },
  { label: "Status", dataKey: "status" },
  {
    label: "Actions",
    component: (row: Employee, handlers) => (
      <>
        <IconButton
          aria-label="edit"
          onClick={() => handlers.onEdit(row)}
          size="small"
        >
          <Edit fontSize="inherit" />
        </IconButton>

        <IconButton
          aria-label="delete"
          onClick={() => handlers.onDelete(row)}
          size="small"
          color="error"
        >
          <Delete fontSize="inherit" />
        </IconButton>
      </>
    ),
  },
];

const defaultForm: Omit<Employee, "_id" | "dateJoined"> = {
  name: "",
  email: "",
  phone: "",
  role: "",
  status: "",
};

// Helper to subscribe to roles changes in localStorage
let lastRolesString: string | null = null;
let lastRolesArray: string[] = [];
function subscribeToRoles(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === "roles") callback();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function useLiveRoles(): string[] {
  return useSyncExternalStore(
    subscribeToRoles,
    () => {
      try {
        // Read from 'roleNames' for dropdown compatibility
        const saved = localStorage.getItem("roleNames");
        if (saved === lastRolesString) return lastRolesArray;
        lastRolesString = saved;
        lastRolesArray = saved ? JSON.parse(saved) : [];
        return lastRolesArray;
      } catch {
        lastRolesString = null;
        lastRolesArray = [];
        return lastRolesArray;
      }
    },
    () => []
  );
}

const Users: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const liveRoles = useLiveRoles();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load employees from JSON file (no API call)
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEmployees(employeesData as Employee[]);
      setFiltered(employeesData as Employee[]);
      setLoading(false);
    }, 300);
  }, []);

  // Filter employees
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) || e.role.toLowerCase().includes(q)
      )
    );
    setPage(0);
  }, [search, employees]);

  // Modal open/close
  const handleOpen = useCallback((emp?: Employee) => {
    if (emp) {
      setEditId(emp._id);
      setForm({
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        status: emp.status,
      });
    } else {
      setEditId(null);
      setForm(defaultForm);
    }
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setForm(defaultForm);
  }, []);

  // Add/Edit employee (in-memory only)
  const handleSave = useCallback(async () => {
    setSaving(true);
    let newList: Employee[];
    if (editId) {
      // Edit existing
      newList = employees.map((e) =>
        e._id === editId ? { ...e, ...form } : e
      );
    } else {
      // Add new
      const newEmployee: Employee = {
        _id: (Date.now() + Math.random()).toString(),
        ...form,
        dateJoined: new Date().toISOString().slice(0, 10),
      };
      newList = [newEmployee, ...employees];
    }
    setEmployees(newList);
    setOpen(false);
    setSaving(false);
  }, [editId, form, employees]);

  // Delete employee (in-memory only)
  const handleDelete = useCallback(async (emp: Employee) => {
    if (!window.confirm(`Delete employee ${emp.name}?`)) return;
    setSaving(true);
    setEmployees((prev) => prev.filter((e) => e._id !== emp._id));
    setSaving(false);
  }, []);

  // Pagination
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#181C1F" }} />;

  return (
    <Box sx={{ mt: 2, mx: isMobile ? 0 : 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
          Employees
        </Typography>
        <MySearchBar
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          placeholder="Search by name or role"
        />
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpen(undefined)}
          sx={{ minWidth: 120 }}
        >
          Add Employee
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
            overflowX: isMobile ? "auto" : "hidden",
            boxShadow: isMobile ? 0 : 3,
          }}
        >
          <TableContainer sx={{ minWidth: isMobile ? 600 : undefined }}>
            <TableMap<Employee>
              data={filtered.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )}
              header={header}
              onEdit={handleOpen}
              onDelete={handleDelete}
            />
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
              ".MuiTablePagination-toolbar": {
                flexDirection: isMobile ? "column" : "row",
                alignItems: isMobile ? "flex-start" : "center",
                gap: isMobile ? 1 : 0,
              },
            }}
          />
        </Paper>
      )}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        aria-labelledby="employee-dialog-title"
      >
        <DialogTitle id="employee-dialog-title">
          {editId ? "Edit Employee" : "Add Employee"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            label="Name"
            value={form.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, name: e.target.value }))
            }
            required
            autoFocus
            inputProps={{ "aria-label": "Employee name" }}
          />
          <TextField
            label="Email"
            value={form.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            required
            type="email"
            inputProps={{ "aria-label": "Employee email" }}
          />
          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            required
            inputProps={{ "aria-label": "Employee phone" }}
          />
          <TextField
            label="Role"
            select
            value={form.role}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, role: e.target.value }))
            }
            required
            inputProps={{ "aria-label": "Employee role" }}
          >
            {liveRoles.length === 0 ? (
              <MenuItem value="" disabled>
                No roles available
              </MenuItem>
            ) : (
              liveRoles.map((role) => (
                <MenuItem key={role} value={role}>
                  {role}
                </MenuItem>
              ))
            )}
          </TextField>
          <TextField
            label="Status"
            value={form.status}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setForm((f) => ({ ...f, status: e.target.value }))
            }
            required
            inputProps={{ "aria-label": "Employee status" }}
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

export default Users;
