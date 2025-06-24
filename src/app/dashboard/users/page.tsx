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
      ) : (
        <Paper
          elevation={8}
          sx={{
            ...COMMON_STYLES.roundedPaper,
            overflow: "hidden",
          }}
        >
          <TableMap
            data={rows}
            header={usersTableHeader}
            onEdit={() => {}}
            onDelete={() => {}}
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
            // You can implement add user API logic here
            // For now, just close dialog and reload employees
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
