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
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/components/ui/dialogs/UserDialog";
import UsersActionBar from "@/components/ui/actions/UsersActionBar";
import UserCard from "@/components/ui/cards/UserCard";
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
const Pagination = dynamic(() => import("@/components/ui/Navigation/Pagination"), {
  ssr: false,
});

const Users: React.FC = () => {
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

  const usersTableHeader = USERS_TABLE_HEADER.map((header) =>
    header.label === "Actions"
      ? {
          ...header,
          component: (row) => (
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
                <Edit fontSize="small" />
              </Button>
            </PermissionGuard>
          ),
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
      const dateObj = new Date(joiningDate);
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
                onEdit={() => {
                  setSelectedUser(user);
                  setEditId(user.id || user._id);
                  setOpen(true);
                }}
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
            component={Paper}
            elevation={8}
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
          {saving ? <CircularProgress size={24} color="inherit" /> : <Add />}
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
              } else {
                await addUser(values);
              }

              handleCloseDialog();
              setPage(1);
              setSearch("");
              await loadEmployees();
            } catch (err: any) {
              // Minimal user feedback: alert with server message when possible
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
                window.alert(message || "User with same email or phone exists");
              } else {
                window.alert(message);
              }
              // keep dialog open so user can correct input
            }
          }}
        />
      </PermissionGuard>
    </Box>
  );
};

export default Users;
