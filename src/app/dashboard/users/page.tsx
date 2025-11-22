"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button,
  TableContainer,
  Snackbar,
  Alert,
  AddIcon,
  EditIcon,
} from "../../../components/ui/Component";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/components/ui/dialog/UserDialog";
import { useAuth } from "@/contexts/AuthContext";
import UsersActionBar from "@/components/ui/action/UsersActionBar";
import UserCard from "@/components/ui/card/UserCard";
import {
  GRADIENTS,
  COMMON_STYLES,
  DEFAULT_USER_FORM,
  USERS_TABLE_HEADER,
  USERS_ROWS_PER_PAGE_OPTIONS,
  SEARCH_DEBOUNCE_DELAY,
  FAB_POSITION,
  USERS_PERMISSION_MODULE,
} from "@/constants/users";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import { useDebounce } from "@/hooks/useDebounce";

const TableMap = dynamic(() => import("@/components/ui/table/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  {
    ssr: false,
  }
);

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
  const {
    employees,
    loading,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalItems,
    saving,
    setOpen,
    open,
    editId,
    setEditId,
    addUser,
    updateUser,
    setForm,
    loadEmployees,
  } = useUsers(debouncedSearch);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [setSearch, setPage]
  );

  const handlePageSizeChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedUser(null);
    setEditId(null);
    setForm(DEFAULT_USER_FORM);
  };

  // Helper function to check if current user can edit a specific employee
  const canEditEmployee = (employee: any) => {
    if (!currentUser || !employee) {
      return false;
    }

    // System admin can edit everyone
    if (currentUser.isSystemAdmin) return true;

    // Check if logged-in user's ID matches the employee's managerId
    const currentUserId = currentUser._id;
    const employeeManagerId = employee.managerId;

    // Convert both to string for comparison (in case one is ObjectId)
    const currentUserIdStr = String(currentUserId);
    const employeeManagerIdStr = String(employeeManagerId);

    return currentUserIdStr === employeeManagerIdStr;
  };

  const usersTableHeader = USERS_TABLE_HEADER.map((header) =>
    header.label === "Actions"
      ? {
          ...header,
          component: (row) => {
            // Only show edit button if current user is the manager of this employee
            if (!canEditEmployee(row)) {
              return null;
            }

            return (
              <PermissionGuard
                module={USERS_PERMISSION_MODULE}
                action="write"
                fallback={null}
              >
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSelectedUser(row);
                    setEditId(row.id || row._id);
                    setOpen(true);
                  }}
                  sx={{
                    minWidth: 0,
                    px: 1,
                    py: 0.5,
                    minHeight: 0,
                    lineHeight: 1,
                  }}
                >
                  <EditIcon fontSize="small" />
                </Button>
              </PermissionGuard>
            );
          },
        }
      : header
  );

  const getInitialUserForm = (form: any) => {
    const safeForm = Object.fromEntries(
      Object.entries(form || {}).filter(
        ([_, v]) => v !== undefined && v !== null
      )
    );

    let joiningDate = safeForm.joiningDate || "";
    if (joiningDate) {
      const dateObj = new Date(joiningDate as string);
      if (!isNaN(dateObj.getTime())) {
        joiningDate = dateObj.toISOString().slice(0, 10);
      }
    }

    return {
      ...DEFAULT_USER_FORM,
      ...safeForm,
      gender: safeForm.gender ?? DEFAULT_USER_FORM.gender,
      managerId: safeForm.managerId || "",
      departmentId: safeForm.departmentId || "",
      roles: Array.isArray(safeForm.roles)
        ? safeForm.roles.map((r: any) =>
            typeof r === "string" ? r : r._id || r.id || ""
          )
        : [],
      joiningDate,
      aadharUrl: safeForm.aadharUrl || "",
      panUrl: safeForm.panUrl || "",
      bankProofUrl: safeForm.bankProofUrl || "",
      nominee: safeForm.nominee ?? DEFAULT_USER_FORM.nominee,
      // ensure freelancer fields are present in initial values
      slabPercentage: safeForm.slabPercentage || "",
      branch: safeForm.branch || "",
    };
  };

  return (
    <Box sx={MODULE_STYLES.users.usersContainer}>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 1, sm: 2, md: 3 },
          borderRadius: { xs: 1, sm: 2, md: 3 },
          mb: { xs: 1, sm: 2, md: 3 },
          mt: { xs: 0.5, sm: 1, md: 2 },
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          overflow: "hidden",
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
          Users
        </Typography>
        <UsersActionBar
          search={search}
          onSearchChange={handleSearchChange}
          onAdd={() => setOpen(true)}
          saving={saving}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : employees.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography>No users found.</Typography>
        </Box>
      ) : isMobile ? (
        <Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 1.5,
              mb: 2,
            }}
          >
            {employees.map((user) => (
              <UserCard
                key={user.id || user._id}
                user={{
                  name: user.name,
                  email: user.email,
                  designation: user.designation,
                  avatarUrl: user.avatarUrl,
                }}
                onEdit={
                  canEditEmployee(user)
                    ? () => {
                        setSelectedUser(user);
                        setEditId(user.id || user._id);
                        setOpen(true);
                      }
                    : undefined
                }
              />
            ))}
          </Box>
          {/* Pagination outside the cards grid */}
          <Box sx={MODULE_STYLES.leads.paginationWrapper}>
            <Pagination
              page={page}
              pageSize={rowsPerPage}
              total={totalItems}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={USERS_ROWS_PER_PAGE_OPTIONS}
            />
          </Box>
        </Box>
      ) : (
        <Box sx={MODULE_STYLES.leads.tableWrapper}>
          <TableContainer
            component={(props) => <Paper elevation={8} {...props} />}
            sx={{
              ...COMMON_STYLES.roundedPaper,
              ...MODULE_STYLES.leads.tableContainer,
            }}
          >
            <TableMap
              data={employees}
              header={usersTableHeader}
              onEdit={() => {}}
              onDelete={() => {}}
              size={
                typeof window !== "undefined" && window.innerWidth < 600
                  ? "small"
                  : "medium"
              }
              stickyHeader
            />
          </TableContainer>

          {/* Pagination outside the scrollable table */}
          <Box sx={MODULE_STYLES.leads.paginationWrapper}>
            <Pagination
              page={page}
              pageSize={rowsPerPage}
              total={totalItems}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={USERS_ROWS_PER_PAGE_OPTIONS}
            />
          </Box>
        </Box>
      )}

      <PermissionGuard
        module={USERS_PERMISSION_MODULE}
        action="write"
        fallback={<></>}
      >
        <Fab
          color="primary"
          aria-label="add user"
          onClick={() => setOpen(true)}
          disabled={saving}
          sx={{
            position: "fixed",
            bottom: FAB_POSITION.bottom,
            right: FAB_POSITION.right,
            background: GRADIENTS.button,
            display: { xs: "flex", md: "none" },
            zIndex: FAB_POSITION.zIndex,
            boxShadow: 3,
            "&:hover": { background: GRADIENTS.buttonHover },
          }}
        >
          {saving ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            <AddIcon />
          )}
        </Fab>
        <UserDialog
          open={open}
          editId={editId}
          initialData={getInitialUserForm(selectedUser)}
          saving={saving}
          onClose={handleCloseDialog}
          onSave={async (values) => {
            try {
              if (editId) {
                // Remove fields that cannot be updated for existing users
                const { email, phone, joiningDate, ...updateData } = values;
                await updateUser(editId, updateData);
                // show success toast for update
                setSnackbarMessage("User updated successfully");
              } else {
                await addUser(values);
                // show success toast for creation
                setSnackbarMessage("User created successfully");
              }

              setSnackbarSeverity("success");
              setSnackbarOpen(true);

              handleCloseDialog();
              setPage(1);
              setSearch("");
              await loadEmployees();
            } catch (err: any) {
              // Show error in a toast (Snackbar) instead of window.alert
              const status =
                err?.status ||
                err?.statusCode ||
                (err?.response && err.response.status);
              const message =
                err?.message ||
                (err?.response &&
                  err.response.data &&
                  err.response.data.message) ||
                "Failed to save user";
              if (status === 409) {
                // Duplicate user (email/phone)
                setSnackbarMessage(
                  message || "User with same email or phone exists"
                );
              } else {
                setSnackbarMessage(message);
              }
              setSnackbarSeverity("error");
              setSnackbarOpen(true);
              // keep dialog open so user can correct input
            }
          }}
        />
      </PermissionGuard>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={(event, reason) => {
          // ignore clickaway to allow manual dismissal only via close button or timeout
          if (reason === "clickaway") return;
          setSnackbarOpen(false);
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;
