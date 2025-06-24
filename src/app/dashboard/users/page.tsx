"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  Stack,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import {
  EMPLOYEE_ROWS_PER_PAGE_OPTIONS,
  GRADIENTS,
  COMMON_STYLES,
} from "@/constants/leads";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/components/ui/UserDialog";
import UsersActionBar from "@/components/ui/UsersActionBar";
import UserCard from "@/components/ui/UserCard";
const TableMap = dynamic(() => import("@/components/ui/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(() => import("@/components/ui/Pagination"), {
  ssr: false,
});
const Users: React.FC = () => {
  const {
    employees,
    loading,
    saving,
    search,
    setSearch,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    open,
    setOpen,
    editId,
    setEditId,
    form,
    setForm,
    filtered,
    rows,
    loadEmployees,
  } = useUsers();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      setPage(0);
    },
    [setSearch, setPage]
  );
  const usersTableHeader = [
    { label: "Name", dataKey: "name" },
    { label: "Email", dataKey: "email" },
    { label: "Designation", dataKey: "designation" },
    // You can add more fields as needed
    {
      label: "Actions",
      component: (row, handlers) => null, // Add action buttons if needed
    },
  ];
  // Helper: default form data for new user
  const defaultUserForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male",
    age: undefined,
    altPhone: "",
    joiningDate: "",
    designation: "",
    managerId: "",
    departmentId: "",
    roles: [],
  };
  return (
    <Box
      sx={{
        p: { xs: 0.5, sm: 1, md: 2 },
        pt: { xs: 1, sm: 2, md: 3 },
        minHeight: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
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
      ) : isMobile ? (
        <Box
          sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5, mb: 2 }}
        >
          {rows.map((user) => (
            <UserCard
              key={user.id || user._id}
              user={{
                name: user.name,
                email: user.email,
                designation: user.designation,
                avatarUrl: user.avatarUrl,
              }}
              onEdit={() => {
                setEditId(user.id || user._id);
                setOpen(true);
              }}
            />
          ))}
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            overflowX: { xs: "auto", md: "visible" },
            mb: { xs: 2, sm: 3 },
          }}
        >
          <Paper
            elevation={8}
            sx={{
              ...COMMON_STYLES.roundedPaper,
              minWidth: { xs: 600, sm: "100%" },
              width: "100%",
              overflow: "auto",
            }}
          >
            <TableMap
              data={rows}
              header={usersTableHeader}
              onEdit={() => {}}
              onDelete={() => {}}
              size={window.innerWidth < 600 ? "small" : "medium"}
            />
            <Pagination
              count={filtered.length}
              page={page}
              onPageChange={setPage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={setRowsPerPage}
              rowsPerPageOptions={EMPLOYEE_ROWS_PER_PAGE_OPTIONS}
            />
          </Paper>
        </Box>
      )}
      <PermissionGuard module="employee" action="write" fallback={<></>}>
        {/* Floating + button for small screens */}
        <Fab
          color="primary"
          aria-label="add user"
          onClick={() => setOpen(true)}
          disabled={saving}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: GRADIENTS.button,
            display: { xs: "flex", md: "none" },
            zIndex: 1201,
            boxShadow: 3,
            "&:hover": {
              background: GRADIENTS.buttonHover,
            },
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : <Add />}
        </Fab>
        <UserDialog
          open={open}
          editId={editId}
          initialData={form || defaultUserForm}
          saving={saving}
          onClose={() => setOpen(false)}
          onSave={async (values) => {
            setOpen(false);
            setForm(defaultUserForm);
            await loadEmployees();
          }}
        />
      </PermissionGuard>
    </Box>
  );
};
export default Users;
