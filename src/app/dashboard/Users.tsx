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
  useMediaQuery,
  Alert,
  TextField,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  SelectChangeEvent,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import MySearchBar from "../../components/ui/MySearchBar";
import TableMap, {
  TableHeader,
  TableActionHandlers,
} from "../../components/ui/TableMap";
import Pagination from "../../components/ui/Pagination";
import PermissionGuard from "../../components/PermissionGuard";
// Use React 18's useSyncExternalStore or provide a simple fallback for React 17
const useSyncExternalStore =
  React.useSyncExternalStore ||
  ((
    subscribe: (callback: () => void) => () => void,
    getSnapshot: () => unknown
  ) => {
    const [, forceUpdate] = React.useReducer((x: number) => x + 1, 0);

    React.useEffect(() => {
      const unsubscribe = subscribe(() => {
        forceUpdate();
      });
      return unsubscribe;
    }, [subscribe]);

    return getSnapshot();
  });

// Remove duplicate type definitions since we're importing from TableMap

// Table header definition: supports both data and action columns

export interface Employee {
  _id?: string; // MongoDB _id, optional for type safety
  id?: string; // fallback for legacy or API data
  name: string;
  email: string;
  phone: string;
  role: string;
  roles?: string[]; // Multiple roles support
  currentRole?: string; // Active role for the session
  address?: string;
  designation?: string;
  managerId?: string;
  departmentId?: string;
  gender?: string;
  age?: number;
  altPhone?: string;
  joiningDate?: string;
  // add more fields if necessary
}

const header: TableHeader<Employee>[] = [
  { label: "Name", dataKey: "name" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  { label: "Primary Role", dataKey: "role" },
  {
    label: "All Roles",
    component: (row: Employee) => (
      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
        {(row.roles || [row.role]).map((role, index) => (
          <Chip
            key={`${role}-${index}`}
            label={role}
            size="small"
            variant={role === row.role ? "filled" : "outlined"}
            color={role === row.role ? "primary" : "default"}
          />
        ))}
      </Box>
    ),
  },
  {
    label: "Actions",
    component: (row: Employee, handlers: TableActionHandlers<Employee>) => (
      <>
        <PermissionGuard module="employee" action="write" hideWhenNoAccess>
          <IconButton
            aria-label="edit"
            onClick={() => handlers.onEdit(row)}
            size="small"
          >
            <Edit fontSize="inherit" />
          </IconButton>
        </PermissionGuard>

        <PermissionGuard module="employee" action="delete" hideWhenNoAccess>
          <IconButton
            aria-label="delete"
            onClick={() => handlers.onDelete(row)}
            size="small"
            color="error"
          >
            <Delete fontSize="inherit" />
          </IconButton>
        </PermissionGuard>
      </>
    ),
  },
];

const defaultForm: Omit<Employee, "_id" | "dateJoined"> = {
  name: "",
  email: "",
  phone: "",
  role: "",
  roles: [],
  currentRole: "",
  address: "",
  designation: "",
  managerId: "",
  departmentId: "",
  gender: "",
  age: undefined,
  altPhone: "",
  joiningDate: "",
};

// Helper to subscribe to roles changes in localStorage
let lastRolesString: string | null = null;
let lastRolesArray: string[] = [];

function subscribeToRoles(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === "roleNames") {
      // Reset cache when storage changes
      lastRolesString = null;
      lastRolesArray = [];
      callback();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

// Cached getSnapshot function to prevent infinite loops
const getSnapshotForRoles = () => {
  try {
    // Read from 'roleNames' for dropdown compatibility
    const saved = localStorage.getItem("roleNames");

    // If no data, return cached empty array
    if (!saved || saved === "null" || saved === "undefined") {
      if (lastRolesString !== null || lastRolesArray.length > 0) {
        lastRolesString = null;
        lastRolesArray = [];
      }
      return lastRolesArray;
    }

    // If same as cached, return cached reference
    if (saved === lastRolesString) {
      return lastRolesArray;
    }

    // Parse and cache new data
    lastRolesString = saved;
    const parsed = JSON.parse(saved);

    // Ensure we always return an array of strings
    if (Array.isArray(parsed)) {
      lastRolesArray = parsed
        .map((role) => {
          // Handle both string and object formats
          if (typeof role === "string") {
            return role.trim();
          } else if (role && typeof role === "object" && role.name) {
            return String(role.name).trim();
          } else if (role && typeof role === "object" && role.value) {
            return String(role.value).trim();
          } else {
            return String(role).trim();
          }
        })
        .filter((role) => role && role.length > 0); // Remove empty strings
    } else {
      lastRolesArray = [];
    }

    return lastRolesArray;
  } catch (error) {
    console.error("Error parsing roles from localStorage:", error);
    console.log("Raw localStorage value:", localStorage.getItem("roleNames"));
    lastRolesString = null;
    lastRolesArray = [];
    return lastRolesArray;
  }
};

function useLiveRoles(): string[] {
  return useSyncExternalStore(
    subscribeToRoles,
    getSnapshotForRoles,
    () => [] // Server-side snapshot (empty array)
  );
}

const API_BASE = "/api/v0/employee";

const Users: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    phone?: string;
    role?: string;
    general?: string;
  }>({});
  // Pagination state for new UI
  const [page, setPage] = useState(0); // 0-based index for correct pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const liveRoles = useLiveRoles();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load employees from API
  useEffect(() => {
    setLoading(true);
    axios
      .get(API_BASE)
      .then((res) => {
        // API returns { success: true, data: employees[] }
        const employeesData = res.data.data || res.data;
        setEmployees(employeesData);
        setFiltered(employeesData);
      })
      .catch((error) => {
        console.error("Failed to load employees:", error);
        setEmployees([]);
        setFiltered([]);
      })
      .finally(() => setLoading(false));
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
    setError(null);
    setFieldErrors({});
    if (emp) {
      setEditId(emp._id || emp.id || null); // Use _id, fallback to id
      setForm({
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: emp.role,
        roles: emp.roles || [emp.role],
        currentRole: emp.currentRole || emp.role,
        address: emp.address || "",
        designation: emp.designation || "",
        managerId: emp.managerId || "",
        departmentId: emp.departmentId || "",
        gender: emp.gender || "",
        age: emp.age,
        altPhone: emp.altPhone || "",
        joiningDate: emp.joiningDate || "",
      });
      setSelectedRoles(emp.roles || [emp.role]);
    } else {
      setEditId(null);
      setForm(defaultForm);
      setSelectedRoles([]);
    }
    setOpen(true);
  }, []);
  const handleClose = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setForm(defaultForm);
    setSelectedRoles([]);
    setError(null);
    setFieldErrors({});
  }, []); // Add/Edit employee (API)
  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      // Clean up form data before sending
      const cleanedForm = { ...form }; // Add roles and currentRole
      if (selectedRoles.length === 0) {
        setFieldErrors({ role: "Please select at least one role" });
        setSaving(false);
        return;
      }

      cleanedForm.roles = selectedRoles;
      cleanedForm.currentRole = selectedRoles[0];

      // Remove empty optional fields to avoid validation issues
      if (!cleanedForm.managerId?.trim()) {
        delete cleanedForm.managerId;
      }
      if (!cleanedForm.departmentId?.trim()) {
        delete cleanedForm.departmentId;
      }
      if (!cleanedForm.altPhone?.trim()) {
        delete cleanedForm.altPhone;
      }
      if (!cleanedForm.gender?.trim()) {
        delete cleanedForm.gender;
      }
      if (!cleanedForm.age) {
        delete cleanedForm.age;
      }

      if (editId) {
        // Edit - use PATCH instead of PUT to match API
        await axios.patch(`${API_BASE}/${editId}`, cleanedForm);
        setEmployees((prev) =>
          prev.map((e) =>
            (e._id || e.id) === editId ? { ...e, ...cleanedForm } : e
          )
        );
      } else {
        // Add - send cleaned form data to API
        const res = await axios.post(API_BASE, cleanedForm);
        const newEmployee = res.data.data || res.data;
        setEmployees((prev) => [newEmployee, ...prev]);
      }
      setOpen(false);
    } catch (error: unknown) {
      console.error("Failed to save employee:", error);

      // Handle specific error responses
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };
      if (axiosError.response?.status === 409) {
        const errorMessage =
          axiosError.response.data?.message ||
          "Employee with this email or phone already exists";

        // Parse specific field errors from the message
        if (errorMessage.toLowerCase().includes("email")) {
          setFieldErrors({ email: "This email is already in use" });
        } else if (errorMessage.toLowerCase().includes("phone")) {
          setFieldErrors({ phone: "This phone number is already in use" });
        } else {
          setFieldErrors({
            email: "This email may already be in use",
            phone: "This phone number may already be in use",
          });
        }
        setError("Employee with this email or phone already exists");
      } else if (axiosError.response?.status === 400) {
        const errorMessage =
          axiosError.response.data?.message || "Invalid data provided";
        setError(`Validation error: ${errorMessage}`);
        setFieldErrors({ general: errorMessage });
      } else {
        setError(
          `Failed to save employee: ${axiosError.message || "Unknown error"}`
        );
      }
    }
    setSaving(false);
  }, [editId, form, selectedRoles]);

  // Delete employee (API)
  const handleDelete = useCallback(async (emp: Employee) => {
    const empId = emp._id || emp.id;
    if (!empId) return;
    if (!window.confirm(`Delete employee ${emp.name}?`)) return;
    setSaving(true);
    try {
      await axios.delete(`${API_BASE}/${empId}`);
      setEmployees((prev) => prev.filter((e) => (e._id || e.id) !== empId));
    } catch {
      // Optionally show error
    }
    setSaving(false);
  }, []);
  const handleRoleChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const newRoles = typeof value === "string" ? value.split(",") : value;
    setSelectedRoles(newRoles);

    // Update form with primary role (first selected role)
    if (newRoles.length > 0) {
      setForm((f) => ({ ...f, role: newRoles[0] }));
    } else {
      // Clear role if no roles selected
      setForm((f) => ({ ...f, role: "" }));
    }

    if (error) setError(null);
    if (fieldErrors.role) {
      setFieldErrors((prev) => ({ ...prev, role: undefined }));
    }
  };

  // Pagination handlers for custom Pagination
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (size: number) => {
    setRowsPerPage(size);
    setPage(0);
  };

  // Paginate filtered employees
  const pagedEmployees = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#181C1F" }} />;

  return (
    <Box sx={{ mt: 2, mx: isMobile ? 0 : 2 }}>
      <Paper
        sx={{
          width: "100%",
          maxWidth: 1200, // increased from 900 to 1200 for a wider card
          minWidth: isMobile ? 0 : 900, // increased minWidth for desktop
          mx: "auto",
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: theme.palette.mode === "dark" ? "#23272A" : "#f5f7fa", // match Leads
          p: { xs: 1, sm: 2 }, // match Leads
          overflowX: "auto", // match Leads
        }}
      >
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
              color: theme.palette.mode === "dark" ? "#fff" : "#000",
              fontSize: { xs: 20, sm: 24 }, // match Leads
            }}
          >
            Employees
          </Typography>
          <Box sx={{ flex: 2, minWidth: { xs: "100%", sm: 220 } }}>
            <Box sx={{ width: "100%" }}>
              <MySearchBar
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name or role"
              />
            </Box>{" "}
          </Box>
          <PermissionGuard module="employee" action="write" hideWhenNoAccess>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpen(undefined)}
              sx={{
                minWidth: 120,
                width: { xs: "100%", sm: "auto" },
                fontWeight: 600,
                bgcolor: "#1976d2",
                color: "#fff",
                boxShadow: 2,
              }}
            >
              Add Employee
            </Button>
          </PermissionGuard>
        </Box>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {" "}
            <TableContainer sx={{ minWidth: isMobile ? 600 : undefined }}>
              {" "}
              <TableMap<Employee>
                data={pagedEmployees}
                header={header}
                onEdit={handleOpen}
                onDelete={handleDelete}
              />
            </TableContainer>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Pagination
                page={page}
                pageSize={rowsPerPage}
                total={filtered.length}
                onPageChange={handlePageChange}
                pageSizeOptions={[5, 10, 25]}
                onPageSizeChange={handleRowsPerPageChange}
              />
            </Box>
          </>
        )}
      </Paper>{" "}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        aria-labelledby="employee-dialog-title"
        PaperProps={{
          sx: {
            maxHeight: "90vh",
            height: "auto",
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle id="employee-dialog-title" sx={{ pb: 1 }}>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {editId ? "Edit Employee" : "Add Employee"}
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 1,
            maxHeight: "70vh",
            overflowY: "auto",
            px: 3,
            pb: 3,
          }}
        >
          {" "}
          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}{" "}
          <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 600 }}>
            Basic Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((f) => ({ ...f, name: e.target.value }));
                // Clear general error when user starts making changes
                if (error) setError(null);
              }}
              required
              autoFocus
              inputProps={{ "aria-label": "Employee name" }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Email"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  // Clear email error when user starts typing
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                required
                type="email"
                error={!!fieldErrors.email}
                helperText={fieldErrors.email || ""}
                inputProps={{ "aria-label": "Employee email" }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Phone"
                value={form.phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, phone: e.target.value }));
                  // Clear phone error when user starts typing
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }
                }}
                required
                error={!!fieldErrors.phone}
                helperText={fieldErrors.phone || ""}
                inputProps={{ "aria-label": "Employee phone" }}
                sx={{ flex: 1 }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                Role Assignment
              </Typography>
              <FormControl fullWidth required error={!!fieldErrors.role}>
                <InputLabel>Select Roles</InputLabel>
                <Select<string[]>
                  multiple
                  value={selectedRoles}
                  onChange={handleRoleChange}
                  input={<OutlinedInput label="Select Roles" />}
                  renderValue={(selected) => (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        py: 0.5,
                      }}
                    >
                      {Array.isArray(selected)
                        ? selected.map((value, index) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              color={index === 0 ? "primary" : "default"}
                              variant={index === 0 ? "filled" : "outlined"}
                            />
                          ))
                        : null}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 224,
                        width: 250,
                      },
                    },
                  }}
                  sx={{
                    "& .MuiSelect-select": {
                      minHeight: "56px",
                    },
                  }}
                >
                  {liveRoles.length === 0 ? (
                    <MenuItem value="default-role">
                      Default Role (No roles configured)
                    </MenuItem>
                  ) : (
                    liveRoles
                      .filter(
                        (role) =>
                          role && typeof role === "string" && role.trim() !== ""
                      )
                      .map((role) => (
                        <MenuItem key={role} value={role}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              width: "100%",
                            }}
                          >
                            <Typography variant="body2">{role}</Typography>
                            {selectedRoles.includes(role) && (
                              <Box sx={{ ml: "auto" }}>
                                <Chip
                                  label={
                                    selectedRoles.indexOf(role) === 0
                                      ? "Primary"
                                      : "Secondary"
                                  }
                                  size="small"
                                  color={
                                    selectedRoles.indexOf(role) === 0
                                      ? "primary"
                                      : "default"
                                  }
                                  variant="outlined"
                                />
                              </Box>
                            )}
                          </Box>
                        </MenuItem>
                      ))
                  )}
                </Select>
                {selectedRoles.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    First selected role ({selectedRoles[0]}) will be the primary
                    role
                  </Typography>
                )}
                {fieldErrors.role && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                    {fieldErrors.role}
                  </Typography>
                )}{" "}
              </FormControl>
            </Box>
          </Box>
          <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
            Additional Information
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              label="Address"
              value={form.address || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((f) => ({ ...f, address: e.target.value }));
              }}
              required
              multiline
              rows={2}
              inputProps={{ "aria-label": "Employee address" }}
            />

            <TextField
              label="Designation"
              value={form.designation || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setForm((f) => ({ ...f, designation: e.target.value }));
              }}
              required
              inputProps={{ "aria-label": "Employee designation" }}
            />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Manager ID"
                value={form.managerId || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, managerId: e.target.value }));
                }}
                inputProps={{ "aria-label": "Employee manager ID" }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Department ID"
                value={form.departmentId || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, departmentId: e.target.value }));
                }}
                inputProps={{ "aria-label": "Employee department ID" }}
                sx={{ flex: 1 }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Gender"
                select
                value={form.gender || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, gender: e.target.value }));
                }}
                required
                inputProps={{ "aria-label": "Employee gender" }}
                sx={{ flex: 1 }}
              >
                <MenuItem value="">Select gender...</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
                <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
              </TextField>
              <TextField
                label="Age"
                type="number"
                value={form.age || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value
                    ? parseInt(e.target.value)
                    : undefined;
                  setForm((f) => ({ ...f, age: value }));
                }}
                required
                inputProps={{ "aria-label": "Employee age", min: 18, max: 100 }}
                sx={{ flex: 1 }}
              />{" "}
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                label="Alternative Phone"
                value={form.altPhone || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, altPhone: e.target.value }));
                }}
                inputProps={{ "aria-label": "Employee alternative phone" }}
                sx={{ flex: 1 }}
              />
              <TextField
                label="Joining Date"
                type="date"
                value={form.joiningDate || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setForm((f) => ({ ...f, joiningDate: e.target.value }));
                }}
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{ "aria-label": "Employee joining date" }}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
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
