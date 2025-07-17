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
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useUsers } from "@/hooks/useUsers";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/components/ui/UserDialog";
import UsersActionBar from "@/components/ui/UsersActionBar";
import UserCard from "@/components/ui/UserCard";
import { GRADIENTS, COMMON_STYLES } from "@/constants/leads";
import { useDebounce } from "@/hooks/useDebounce";

const TableMap = dynamic(() => import("@/components/ui/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(() => import("@/components/ui/Pagination"), {
  ssr: false,
});

const Users: React.FC = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 600);
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

  const filteredUsers = employees;
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

  const usersTableHeader = [
    { label: "Name", dataKey: "name" },
    { label: "Email", dataKey: "email" },
    { label: "Phone", dataKey: "phone" },
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

  const defaultUserForm = {
    name: "",
    email: "",
    phone: "",
    address: "",
    gender: "Male",
    age: "",
    altPhone: "",
    joiningDate: "",
    designation: "",
    managerId: "",
    departmentId: "",
    roles: [],
  };

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
      joiningDate,
    };
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
      ) : filteredUsers.length === 0 ? (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Typography>No users found.</Typography>
        </Box>
      ) : isMobile ? (
        <Box
          sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 1.5, mb: 2 }}
        >
          {filteredUsers.map((user) => (
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
              maxHeight: { xs: 360, sm: 480, md: 600 },
              position: "relative",
            }}
          >
            <TableMap
              data={filteredUsers}
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
            <Pagination
              page={page}
              pageSize={rowsPerPage}
              total={totalItems}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[5, 10, 15, 25]}
            />
          </Paper>
        </Box>
      )}

      <PermissionGuard module="employee" action="write" fallback={<></>}>
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
          onClose={() => setOpen(false)}
          onSave={async (values) => {
            if (editId) {
              await updateUser(editId, values);
            } else {
              await addUser(values);
            }
            setOpen(false);
            setSelectedUser(null);
            setForm(defaultUserForm);
            setPage(1);
            setSearch("");
            await loadEmployees();
          }}
        />
      </PermissionGuard>
    </Box>
  );
};

export default Users;
