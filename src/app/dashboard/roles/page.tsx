"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  Stack,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import RoleCard from "@/components/ui/RoleCard";
import { useRoles } from "@/hooks/useRoles";
import { ROLE_PERMISSIONS, GRADIENTS } from "@/constants/leads";
import PermissionGuard from "@/components/PermissionGuard";
import AddRoleDialog from "@/components/ui/AddRoleDialog";
import RolesActionBar from "@/components/ui/RolesActionBar";
import Pagination from "@/components/ui/Pagination";
import axios from "axios";

// Use only 'User' for UI, maps to 'employee' in backend
const modules = ["User", "Role", "Lead", "Department"];
const initialModulePerms = Object.fromEntries(
  modules.map((m) => [m, { read: false, write: false, delete: false }])
);
const Roles: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { roles, loading, loadRoles } = useRoles();
  const [addOpen, setAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [roleName, setRoleName] = useState("");
  const [modulePerms, setModulePerms] = useState(initialModulePerms);
  const [editId, setEditId] = useState(null);
  const [editRole, setEditRole] = useState(null);

  const stats = useMemo(() => {
    const totalPermissions = roles.reduce(
      (acc, role) => acc + role.permissions.length,
      0
    );
    const activeRoles = roles.filter(
      (role) => role.permissions.length > 0
    ).length;
    const adminRoles = roles.filter((role) =>
      role.permissions.some(
        (p: string) => p.includes("write") || p.includes("delete")
      )
    ).length;
    return {
      total: roles.length,
      active: activeRoles,
      admin: adminRoles,
      avgPermissions:
        roles.length > 0 ? Math.round(totalPermissions / roles.length) : 0,
    };
  }, [roles]);

  const filteredRoles = useMemo(() => {
    if (!search) return roles;
    return roles.filter((role) =>
      role.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [roles, search]);

  const paginatedRoles = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredRoles.slice(start, start + rowsPerPage);
  }, [filteredRoles, page, rowsPerPage]);

  const handlePermChange = (mod, perm, checked) => {
    setModulePerms((prev) => ({
      ...prev,
      [mod]: { ...prev[mod], [perm]: checked },
    }));
  };

  const handleOpenEdit = (idx) => {
    const role = paginatedRoles[idx];
    if (!role) return;
    setEditId(role._id);
    setEditRole(role);
    setAddOpen(true);
  };

  const handleAddOrEditRole = async ({ name, modulePerms, editId }) => {
    const perms = { read: [], write: [], delete: [] };
    Object.entries(modulePerms).forEach(([mod, actions]) => {
      const backendMod = mod === "User" ? "employee" : mod.toLowerCase();
      Object.entries(actions).forEach(([action, checked]) => {
        if (checked) perms[action].push(backendMod);
      });
    });
    try {
      if (editId) {
        await axios.put(`/api/v0/role/${editId}`, { name, ...perms });
      } else {
        await axios.post("/api/v0/role", { name, ...perms });
      }
      setAddOpen(false);
      setEditId(null);
      setEditRole(null);
      loadRoles();
    } catch (e) {
      console.error("Failed to add/edit role", e.response?.data || e);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: "100vh",
        bgcolor: "background.default",
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
          Roles
        </Typography>
        <Box sx={{ mb: 2, color: "text.secondary", fontWeight: 500 }}>
          Total Roles: {stats.total}
        </Box>
        <RolesActionBar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onAdd={() => setAddOpen(true)}
          saving={saving}
        />
      </Paper>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={1}
            flexWrap={isMobile ? undefined : "wrap"}
            sx={{
              mx: { xs: 0, sm: -1 },
              mt: { xs: 0, sm: 0 },
              mb: { xs: 1, sm: 2 },
              width: "100%",
              overflowX: "hidden",
              alignItems: isMobile ? "stretch" : "flex-start",
            }}
          >
            {paginatedRoles.map((role, idx) => (
              <RoleCard
                key={role._id || idx}
                role={role}
                idx={idx}
                openEdit={handleOpenEdit}
                small={isMobile}
              />
            ))}
          </Stack>
          <Pagination
            page={page}
            pageSize={rowsPerPage}
            total={filteredRoles.length}
            onPageChange={setPage}
            pageSizeOptions={[3, 6, 12, 24]}
            onPageSizeChange={(size) => {
              setRowsPerPage(size);
              setPage(1);
            }}
          />
        </>
      )}
      <PermissionGuard module="role" action="write" fallback={<></>}>
        <Fab
          color="primary"
          onClick={() => setAddOpen(true)}
          sx={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: GRADIENTS.button,
            display: { xs: "flex", md: "none" },
            "&:hover": { background: GRADIENTS.buttonHover },
          }}
        >
          <Add />
        </Fab>
      </PermissionGuard>
      <AddRoleDialog
        open={addOpen}
        role={editRole}
        modules={modules}
        permissions={ROLE_PERMISSIONS}
        onSubmit={handleAddOrEditRole}
        onClose={() => {
          setAddOpen(false);
          setEditId(null);
          setEditRole(null);
        }}
      />
    </Box>
  );
};
export default Roles;
