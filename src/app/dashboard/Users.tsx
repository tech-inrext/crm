import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  Table,
  TableBody,
  TablePagination,
  Tooltip,
  Stack,
  Fab,
} from "@mui/material";
import {
  Edit,
  Delete,
  Add,
  PersonAdd,
  ViewModule,
  ViewList,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import MySearchBar from "../../components/ui/MySearchBar";
import TableMap, {
  TableHeader,
  TableActionHandlers,
} from "../../components/ui/TableMap";
import Pagination from "../../components/ui/Pagination";
import PermissionGuard from "../../components/PermissionGuard";

// Constants & Styles (matching Leads.tsx structure)
const API_BASE = "/api/v0/employee";
const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

// Common styles for consistency with Leads.tsx
const GRADIENTS = {
  button: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
  buttonHover: "linear-gradient(45deg, #1565c0 30%, #1976d2 90%)",
  card: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
};

const COMMON_STYLES = {
  roundedPaper: {
    borderRadius: { xs: 2, sm: 3, md: 4 },
    overflow: "hidden",
  },
  iconButton: (mainColor: string, hoverColor: string) => ({
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    border: `1px solid ${mainColor}`,
    color: mainColor,
    "&:hover": {
      backgroundColor: hoverColor,
      color: "white",
      transform: "scale(1.05)",
    },
    transition: "all 0.2s ease-in-out",
  }),
};
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
  _id?: string;
  id?: string; // fallback for legacy or API data
  name: string;
  email: string;
  phone: string;
  role: { _id: string; name: string } | string; // Backend returns role object or string
  roles?: { _id: string; name: string }[]; // Backend returns array of role objects
  currentRole?: { _id: string; name: string } | string; // Current active role object or string
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

// Form interface for handling string-based roles in forms
interface EmployeeForm {
  name: string;
  email: string;
  phone: string;
  role: string;
  roles: string[]; // Form uses string array for role names
  currentRole: string;
  address?: string;
  designation?: string;
  managerId?: string;
  departmentId?: string;
  gender?: string;
  age?: number;
  altPhone?: string;
  joiningDate?: string;
}

const header: TableHeader<Employee>[] = [
  { label: "Name", dataKey: "name" },
  { label: "Email", dataKey: "email" },
  { label: "Phone", dataKey: "phone" },
  {
    label: "Roles",
    component: (row: Employee) => {
      const getRoleName = (role: any) =>
        typeof role === "string" ? role : role?.name || "Unknown";
      const primaryRoleName = getRoleName(row.role);
      const allRoles = row.roles
        ? row.roles.map(getRoleName)
        : [primaryRoleName];

      return (
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {allRoles.map((roleName, index) => (
            <Chip
              key={`${roleName}-${index}`}
              label={roleName}
              size="small"
              variant={roleName === primaryRoleName ? "filled" : "outlined"}
              color={roleName === primaryRoleName ? "primary" : "default"}
            />
          ))}
        </Box>
      );
    },
  },
  {
    label: "Actions",
    component: (row: Employee, handlers: TableActionHandlers<Employee>) => (
      <Stack direction="row" spacing={1} justifyContent="center">
        <PermissionGuard module="employee" action="write" fallback={<></>}>
          <Tooltip title="Edit Employee">
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
        <PermissionGuard module="employee" action="delete" fallback={<></>}>
          <Tooltip title="Delete Employee">
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
];

const defaultForm: EmployeeForm = {
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
const getSnapshotForRoles = (): string[] => {
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
  const result = useSyncExternalStore(
    subscribeToRoles,
    getSnapshotForRoles,
    () => [] as string[] // Server-side snapshot (empty array with proper type)
  );
  return result as string[];
}

const Users: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filtered, setFiltered] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EmployeeForm>(defaultForm);
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
      employees.filter((e) => {
        const roleName =
          typeof e.role === "string" ? e.role : e.role?.name || "";
        return (
          e.name.toLowerCase().includes(q) || roleName.toLowerCase().includes(q)
        );
      })
    );
    setPage(0);
  }, [search, employees]); // Modal open/close
  const handleOpen = useCallback((emp?: Employee) => {
    setError(null);
    setFieldErrors({});
    if (emp) {
      const getRoleName = (role: any) =>
        typeof role === "string" ? role : role?.name || "";
      const primaryRoleName = getRoleName(emp.role);
      const allRoleNames = emp.roles
        ? emp.roles.map(getRoleName)
        : [primaryRoleName];

      setEditId(emp._id || emp.id || null); // Use _id, fallback to id
      setForm({
        name: emp.name,
        email: emp.email,
        phone: emp.phone,
        role: primaryRoleName,
        roles: allRoleNames,
        currentRole: getRoleName(emp.currentRole) || primaryRoleName,
        address: emp.address || "",
        designation: emp.designation || "",
        managerId: emp.managerId || "",
        departmentId: emp.departmentId || "",
        gender: emp.gender || "",
        age: emp.age,
        altPhone: emp.altPhone || "",
        joiningDate: emp.joiningDate || "",
      });
      setSelectedRoles(allRoleNames);
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
      } // Send role names as strings to the backend
      cleanedForm.roles = selectedRoles; // selectedRoles is string[] which matches backend expectation
      cleanedForm.currentRole = selectedRoles[0];
      cleanedForm.role = selectedRoles[0]; // Primary role

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
        // Update the employee list with the new data
        // Convert form data back to Employee format for state
        const updatedEmployee: Partial<Employee> = {
          ...cleanedForm,
          role: cleanedForm.role, // Keep as string for now, backend will return proper format
          roles: cleanedForm.roles as any, // Backend will return proper role objects
          currentRole: cleanedForm.currentRole as any,
        };
        setEmployees((prev) =>
          prev.map((e) =>
            (e._id || e.id) === editId ? { ...e, ...updatedEmployee } : e
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
  // Pagination handlers for MUI TablePagination
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
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
          Employees
        </Typography>

        {/* Mobile-First Action Bar */}
        <Box sx={{ mb: { xs: 2, md: 3 } }}>
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
                gap: { xs: 1, sm: 2 },
                justifyContent: { xs: "space-between", md: "flex-end" },
                order: { xs: 2, md: 1 },
              }}
            >
              {/* Search Bar */}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search employees by name, email, role..."
                />
              </Box>
              {/* Add Button */}
              {!isMobile && (
                <PermissionGuard
                  module="employee"
                  action="write"
                  fallback={<></>}
                >
                  <Button
                    variant="contained"
                    startIcon={<PersonAdd />}
                    onClick={() => handleOpen(undefined)}
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
                      "Add Employee"
                    )}
                  </Button>
                </PermissionGuard>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Content Area */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper
          elevation={8}
          sx={{
            ...COMMON_STYLES.roundedPaper,
            overflow: "hidden",
          }}
        >
          <TableContainer sx={{ maxHeight: "70vh" }}>
            <TableMap<Employee>
              data={pagedEmployees}
              header={header}
              onEdit={handleOpen}
              onDelete={handleDelete}
            />
          </TableContainer>

          <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
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

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <PermissionGuard module="employee" action="write" fallback={<></>}>
          <Fab
            color="primary"
            aria-label="add employee"
            onClick={() => handleOpen(undefined)}
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

      {/* Employee Dialog */}
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
