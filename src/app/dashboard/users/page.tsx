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
  Snackbar,
  Alert,
  AddIcon,
} from "@/components/ui/Component";
import { useUsers } from "@/fe/modules/user/hooks/useUsers";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/fe/modules/user/components/dialog/UserDialog";
import UserDetailsDialog from "@/fe/modules/user/components/dialog/UserDetailsDialog";
import { useAuth } from "@/contexts/AuthContext";
import UsersActionBar from "@/fe/modules/user/components/action/UsersActionBar";
import {
  GRADIENTS,
  DEFAULT_USER_FORM,
  SEARCH_DEBOUNCE_DELAY,
  FAB_POSITION,
  USERS_PERMISSION_MODULE,
} from "@/fe/modules/user/constants/users";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import { useDebounce } from "@/hooks/useDebounce";
import {
  canEditEmployee,
  getInitialUserForm,
} from "@/fe/modules/user/utils/userHelpers";
import { useUserDialog } from "@/fe/modules/user/hooks/useUserDialog";
import { getUsersTableHeader } from "@/fe/modules/user/components/table/UsersTableConfig";
import { UsersList } from "@/fe/modules/user/components/UsersList";

const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [search, setSearch] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
    getUserById,
  } = useUsers(debouncedSearch);

  const {
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,
  } = useUserDialog({
    employees,
    loading,
    getUserById,
    setEditId,
    setOpen,
    setForm,
    defaultForm: DEFAULT_USER_FORM,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(1);
    },
    [setPage],
  );

  const handlePageSizeChange = (newSize: number) => {
    setRowsPerPage(newSize);
    setPage(1);
  };

  const handleUserSave = async (values: any) => {
    try {
      if (editId) {
        await updateUser(editId, values);
        setSnackbarMessage("User updated successfully");
      } else {
        await addUser(values);
        setSnackbarMessage("User created successfully");
      }
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      handleCloseDialog();
      setPage(1);
      setSearch("");
      await loadEmployees();
    } catch (err: any) {
      const message =
        err?.message || err?.response?.data?.message || "Failed to save user";
      setSnackbarMessage(
        err?.status === 409
          ? message || "User with same email or phone exists"
          : message,
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const usersTableHeader = getUsersTableHeader({
    canEditEmployee: (employee) => canEditEmployee(currentUser, employee),
    onView: openViewDialog,
    onEdit: openEditDialog,
  });

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

      <UsersList
        loading={loading}
        employees={employees}
        isMobile={isMobile}
        isClient={isClient}
        windowWidth={windowWidth}
        page={page}
        rowsPerPage={rowsPerPage}
        totalItems={totalItems}
        usersTableHeader={usersTableHeader}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEditUser={openEditDialog}
        canEdit={(user) => canEditEmployee(currentUser, user)}
      />

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

        {dialogMode === "view" ? (
          <UserDetailsDialog
            open={open}
            user={selectedUser}
            onClose={handleCloseDialog}
          />
        ) : (
          <UserDialog
            open={open}
            editId={editId}
            initialData={getInitialUserForm(selectedUser)}
            saving={saving}
            onClose={handleCloseDialog}
            onSave={handleUserSave}
          />
        )}
      </PermissionGuard>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={(_, reason) =>
          reason !== "clickaway" && setSnackbarOpen(false)
        }
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
