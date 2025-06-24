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
import { Add, Edit } from "@mui/icons-material";
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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const usersTableHeader = [
    { label: "Name", dataKey: "name" },
    { label: "Email", dataKey: "email" },
    { label: "Designation", dataKey: "designation" },
    {
      label: "Actions",
      component: (row) => (
        <PermissionGuard module="employee" action="write" fallback={null}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSelectedUser(row);
              setEditId(row.id || row._id);
              setOpen(true);
            }}
            sx={{ minWidth: 0, px: 1, py: 0.5, minHeight: 0, lineHeight: 1 }}
          >
            <Edit fontSize="small" />
          </Button>
        </PermissionGuard>
      ),
    },
  ];
  // Helper: default form data for new user
  const defaultUserForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male", // Always a valid option
    age: "",
    altPhone: "",
    joiningDate: "",
    designation: "",
    managerId: "", // Always controlled, never undefined
    departmentId: "", // Always controlled, never undefined
    roles: [],
  };

  // Always provide a complete initialData to UserDialog
  const getInitialUserForm = (form: any) => {
    const safeForm = Object.fromEntries(
      Object.entries(form || {}).filter(
        ([_, v]) => v !== undefined && v !== null
      )
    );
    return {
      ...defaultUserForm,
      ...safeForm,
      gender: safeForm.gender || "Male",
      managerId: safeForm.managerId || "",
      departmentId: safeForm.departmentId || "",
      name: safeForm.name || "",
      email: safeForm.email || "",
      phone: safeForm.phone || "",
      address: safeForm.address || "",
      designation: safeForm.designation || "",
      roles: Array.isArray(safeForm.roles) ? safeForm.roles : [],
      age: safeForm.age || "",
      altPhone: safeForm.altPhone || "",
      joiningDate: safeForm.joiningDate || "",
    };
  };

  const paginatedRows = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return rows.slice(start, end);
  }, [rows, page, rowsPerPage]);

  console.log({ employees, filtered, rows, page, rowsPerPage });

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
      ) : rows.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography>No users found.</Typography>
        </Box>
      ) : isMobile ? (
        <Box
          sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5, mb: 2 }}
        >
          {paginatedRows.map((user) => (
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
              maxHeight: { xs: 360, sm: 480, md: 600 }, // Set max height for scroll
              position: "relative",
            }}
          >
            <TableMap
              data={paginatedRows}
              header={usersTableHeader}
              onEdit={() => {}}
              onDelete={() => {}}
              size={
                typeof window !== "undefined" && window.innerWidth < 600
                  ? "small"
                  : "medium"
              }
              stickyHeader // Pass stickyHeader prop if supported
            />
            <Pagination
              total={rows.length}
              page={page + 1}
              onPageChange={(p) => setPage(p - 1)}
              pageSize={rowsPerPage}
              onPageSizeChange={(size) => {
                setRowsPerPage(size);
                setPage(0);
              }}
              pageSizeOptions={EMPLOYEE_ROWS_PER_PAGE_OPTIONS}
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
          initialData={getInitialUserForm(selectedUser)}
          saving={saving}
          onClose={() => setOpen(false)}
          onSave={async (values) => {
            if (editId) {
              await updateUser(editId, values);
            }
            setOpen(false);
            setSelectedUser(null);
            setForm(defaultUserForm);
            setPage(0); // Reset to first page so new user is visible
            setSearch(""); // Clear search filter
            await loadEmployees();
          }}
        />
      </PermissionGuard>
    </Box>
  );
};
export default Users;
