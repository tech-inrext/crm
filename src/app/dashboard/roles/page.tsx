"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  useTheme,
  useMediaQuery,
  Fab,
  Paper,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import RoleCard from "@/components/ui/RoleCard";
import { useRoles } from "@/hooks/useRoles";
import { useDebounce } from "@/hooks/useDebounce"; // 👈 Add this
import { ROLE_PERMISSIONS, GRADIENTS } from "@/constants/leads";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import PermissionGuard from "@/components/PermissionGuard";
import AddRoleDialog from "@/components/ui/AddRoleDialog";
import RolePermissionsDialog from "@/components/ui/RolePermissionsDialog";
import RolesActionBar from "@/components/ui/RolesActionBar";
import Pagination from "@/components/ui/Pagination";
import axios from "axios";
import { transformToAPIRole } from "@/utils/leadUtils";

const modules = [
  "User",
  "Role",
  "Lead",
  "Department",
  "CabBooking",
  "CabVendor",
  "Vendor",
];

// Defensive: ensure modules passed to UI are unique to avoid React key collisions
const uniqueModules = Array.from(new Set(modules));

const initialModulePerms = Object.fromEntries(
  uniqueModules.map((m) => [m, { read: false, write: false, delete: false }])
);

const Roles: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400); // 👈 Debounced input

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const { roles, loading, total, loadRoles } = useRoles(
    page,
    rowsPerPage,
    debouncedSearch // 👈 Use debounced value
  );

  const [addOpen, setAddOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modulePerms, setModulePerms] = useState(initialModulePerms);
  const [editId, setEditId] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState(null);

  const handleOpenEdit = (idx) => {
    const role = roles[idx];
    if (!role) return;
    setEditId(role._id);
    setEditRole(transformToAPIRole(role));
    setAddOpen(true);
  };

  const handleViewPermissions = (role) => {
    setSelectedRoleForPermissions(role);
    setPermissionsDialogOpen(true);
  };

  const handleAddOrEditRole = async ({ name, modulePerms, editId }) => {
    const perms = { read: [], write: [], delete: [] };
    Object.entries(modulePerms).forEach(([mod, actions]) => {
      let backendMod;
      if (mod === "User") backendMod = "employee";
      else if (mod === "CabVendor") backendMod = "cab-vendor";
      else if (mod === "CabBooking") backendMod = "cab-booking";
      else if (mod === "CabVendor") backendMod = "cab-vendor";
      else backendMod = mod.toLowerCase();
      Object.entries(actions).forEach(([action, checked]) => {
        if (checked) perms[action].push(backendMod);
      });
    });
    try {
      if (editId) {
        await axios.patch(`/api/v0/role/${editId}`, { ...perms });
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
    <Box sx={MODULE_STYLES.roles.rolesContainer}>
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
        <RolesActionBar
          search={search}
          onSearchChange={(e) => {
            setSearch(e.target.value);
            setPage(1); // Reset page on search
          }}
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(auto-fill, minmax(240px, 1fr))",
                md: "repeat(auto-fill, minmax(260px, 1fr))",
                lg: "repeat(auto-fill, minmax(280px, 1fr))",
                xl: "repeat(auto-fill, minmax(300px, 1fr))",
              },
              gap: { xs: 2, sm: 2.5, md: 3 },
              mb: { xs: 2, sm: 3 },
              width: "100%",
              alignItems: "stretch",
            }}
          >
            {roles.length > 0 ? (
              roles.map((role, idx) => (
                <Box
                  key={role._id || idx}
                  sx={{ display: "flex", minHeight: "100%" }}
                >
                  <RoleCard
                    role={role}
                    idx={idx}
                    openEdit={handleOpenEdit}
                    onViewPermissions={handleViewPermissions}
                    small={isMobile}
                  />
                </Box>
              ))
            ) : (
              <Typography
                textAlign="center"
                width="100%"
                mt={2}
                color="text.primary"
              >
                No roles found.
              </Typography>
            )}
          </Box>

          <Pagination
            page={page}
            pageSize={rowsPerPage}
            total={total}
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
        modules={uniqueModules}
        permissions={ROLE_PERMISSIONS}
        onSubmit={handleAddOrEditRole}
        onClose={() => {
          setAddOpen(false);
          setEditId(null);
          setEditRole(null);
        }}
      />

      <RolePermissionsDialog
        open={permissionsDialogOpen}
        role={selectedRoleForPermissions}
        onClose={() => {
          setPermissionsDialogOpen(false);
          setSelectedRoleForPermissions(null);
        }}
      />
    </Box>
  );
};

export default Roles;
