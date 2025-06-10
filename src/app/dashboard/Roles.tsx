import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import MyButton from "@/components/ui/MyButton";
import RoleCard from "../../components/ui/RoleCard";
import AddRoleDialog from "../../components/ui/AddRoleDialog";
import Pagination from "@/components/ui/Pagination";
import { CircularProgress } from "@mui/material";
import axios from "axios";

interface RoleWithPermissions {
  _id?: string;
  name: string;
  permissions: string[];
}

interface APIRole {
  _id: string;
  name: string;
  read: string[];
  write: string[];
  delete: string[];
  createdAt: string;
  updatedAt: string;
}

const LOCAL_ROLE_NAMES_KEY = "roleNames";

const PERMISSIONS = ["read", "write", "delete"];
const API_BASE = "/api/v0/role";

// Transform API role to frontend format
const transformAPIRole = (apiRole: APIRole): RoleWithPermissions => {
  const permissions: string[] = [];

  // Map API module names to frontend names
  const moduleMap: Record<string, string> = {
    employee: "Users",
    role: "Roles",
    lead: "Leads",
  };

  apiRole.read?.forEach((module) => {
    const frontendModule = moduleMap[module] || module;
    permissions.push(`${frontendModule}:read`);
  });

  apiRole.write?.forEach((module) => {
    const frontendModule = moduleMap[module] || module;
    permissions.push(`${frontendModule}:write`);
  });

  apiRole.delete?.forEach((module) => {
    const frontendModule = moduleMap[module] || module;
    permissions.push(`${frontendModule}:delete`);
  });

  return {
    _id: apiRole._id,
    name: apiRole.name,
    permissions,
  };
};

// Transform frontend role to API format
const transformToAPIRole = (role: RoleWithPermissions) => {
  const read: string[] = [];
  const write: string[] = [];
  const deletePerms: string[] = [];

  // Map frontend module names to API names
  const moduleMap: Record<string, string> = {
    Users: "employee",
    Roles: "role",
    Leads: "lead",
  };

  role.permissions.forEach((perm) => {
    const [module, permission] = perm.split(":");
    const apiModule = moduleMap[module] || module.toLowerCase();

    switch (permission) {
      case "read":
        if (!read.includes(apiModule)) read.push(apiModule);
        break;
      case "write":
        if (!write.includes(apiModule)) write.push(apiModule);
        break;
      case "delete":
        if (!deletePerms.includes(apiModule)) deletePerms.push(apiModule);
        break;
    }
  });

  return {
    name: role.name,
    read,
    write,
    delete: deletePerms,
  };
};

const Roles = () => {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [modulePerms, setModulePerms] = useState<
    Record<string, Record<string, boolean>>
  >(() =>
    Object.fromEntries(
      ["Users", "Roles", "Leads"].map((m) => [
        m,
        { read: false, write: false, delete: false },
      ])
    )
  );
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editModulePerms, setEditModulePerms] = useState<
    Record<string, Record<string, boolean>>
  >(() =>
    Object.fromEntries(
      ["Users", "Roles", "Leads"].map((m) => [
        m,
        { read: false, write: false, delete: false },
      ])
    )
  );
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Load roles from API on mount
  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE);
      const apiRoles = response.data.data || response.data;
      const transformedRoles = apiRoles.map(transformAPIRole);
      setRoles(transformedRoles);

      // Sync role names to localStorage for Users page dropdown
      const roleNames = transformedRoles.map(
        (r: RoleWithPermissions) => r.name
      );
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_ROLE_NAMES_KEY, JSON.stringify(roleNames));
      }
    } catch (error) {
      console.error("Failed to load roles:", error);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRole = async () => {
    const trimmed = roleName.trim();
    if (!trimmed) return;

    // Flatten module permissions into a string[]
    const permissions: string[] = [];
    for (const mod of ["Users", "Roles", "Leads"]) {
      for (const perm of PERMISSIONS) {
        if (modulePerms[mod][perm]) permissions.push(`${mod}:${perm}`);
      }
    }
    if (!permissions.length) return;

    const newRole = { name: trimmed, permissions };
    const apiRole = transformToAPIRole(newRole);

    setSaving(true);
    try {
      const response = await axios.post(API_BASE, apiRole);
      const createdRole = transformAPIRole(response.data.data || response.data);
      setRoles([createdRole, ...roles]);

      // Update localStorage for Users page
      const roleNames = [createdRole.name, ...roles.map((r) => r.name)];
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_ROLE_NAMES_KEY, JSON.stringify(roleNames));
      }

      setAddOpen(false);
      setRoleName("");
      setModulePerms(
        Object.fromEntries(
          ["Users", "Roles", "Leads"].map((m) => [
            m,
            { read: false, write: false, delete: false },
          ])
        )
      );
    } catch (error) {
      console.error("Failed to create role:", error);
    } finally {
      setSaving(false);
    }
  };
  const openEdit = (idx: number) => {
    setEditIdx(idx);
    setEditRoleName(roles[idx].name);
    // Parse permissions into module-wise object
    const perms: Record<string, Record<string, boolean>> = Object.fromEntries(
      ["Users", "Roles", "Leads"].map((m) => [
        m,
        { read: false, write: false, delete: false },
      ])
    );
    roles[idx].permissions.forEach((p) => {
      const [mod, perm] = p.split(":");
      if (perms[mod] && perm) perms[mod][perm] = true;
    });
    setEditModulePerms(perms);
  };

  const handleEditSave = async () => {
    if (editIdx === null) return;
    const role = roles[editIdx];
    if (!role._id) return;

    const trimmed = editRoleName.trim();
    if (!trimmed) return;

    const permissions: string[] = [];
    for (const mod of ["Users", "Roles", "Leads"]) {
      for (const perm of PERMISSIONS) {
        if (editModulePerms[mod][perm]) permissions.push(`${mod}:${perm}`);
      }
    }
    if (!permissions.length) return;

    const updatedRole = { ...role, name: trimmed, permissions };
    const apiRole = transformToAPIRole(updatedRole);

    setSaving(true);
    try {
      await axios.patch(`${API_BASE}/${role._id}`, apiRole);
      setRoles((prev) => prev.map((r, i) => (i === editIdx ? updatedRole : r)));

      // Update localStorage for Users page
      const roleNames = roles.map((r, i) => (i === editIdx ? trimmed : r.name));
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_ROLE_NAMES_KEY, JSON.stringify(roleNames));
      }

      setEditIdx(null);
      setEditRoleName("");
      setEditModulePerms(
        Object.fromEntries(
          ["Users", "Roles", "Leads"].map((m) => [
            m,
            { read: false, write: false, delete: false },
          ])
        )
      );
    } catch (error) {
      console.error("Failed to update role:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditRoleName("");
    setEditModulePerms(
      Object.fromEntries(
        ["Users", "Roles", "Leads"].map((m) => [
          m,
          { read: false, write: false, delete: false },
        ])
      )
    );
  };

  // NoRoles component for empty state
  const NoRoles = () => (
    <Box sx={{ textAlign: "center", py: 3, color: "#888", width: "100%" }}>
      No roles added yet.
    </Box>
  );

  // Paginate roles
  const pagedRoles = roles.slice((page - 1) * pageSize, page * pageSize);
  return (
    <Box sx={{ mt: 2, ml: { xs: 0, sm: 2 }, maxWidth: 700, width: "100%" }}>
      <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 2, color: "#000" }}>
        Roles & Permissions
      </Typography>
      <MyButton
        variant="contained"
        onClick={() => setAddOpen(true)}
        disabled={saving}
        sx={{
          bgcolor: "#1976d2",
          color: "#fff",
          fontWeight: 600,
          minWidth: 120,
          width: { xs: "100%", sm: "auto" },
          mb: { xs: 2, sm: 0 },
        }}
      >
        {saving ? <CircularProgress size={20} color="inherit" /> : "Add"}
      </MyButton>
      <AddRoleDialog
        open={addOpen}
        roleName={roleName}
        modulePerms={modulePerms}
        modules={["Users", "Roles", "Leads"]}
        permissions={PERMISSIONS}
        onRoleNameChange={(e) => setRoleName(e.target.value)}
        onPermChange={(mod, perm, checked) =>
          setModulePerms((mp) => ({
            ...mp,
            [mod]: { ...mp[mod], [perm]: checked },
          }))
        }
        onClose={() => setAddOpen(false)}
        onAdd={handleAddRole}
        canAdd={
          !!roleName.trim() &&
          Object.values(modulePerms).some((m) =>
            Object.values(m).some(Boolean)
          ) &&
          !saving
        }
      />
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1, sm: 2 },
          bgcolor: "#fff",
          boxShadow: 2,
          borderRadius: 2,
          mt: 3,
          width: "100%",
          overflowX: "auto",
        }}
      >
        <Typography
          sx={{ fontWeight: 600, fontSize: 18, mb: 2, color: "#1a237e" }}
        >
          All Roles
        </Typography>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: { xs: "center", sm: "flex-start" },
                width: "100%",
              }}
            >
              {roles.length === 0 && <NoRoles />}
              {pagedRoles.map((role, idx) => {
                const realIdx = (page - 1) * pageSize + idx;
                const isExpanded = editIdx === null && realIdx === expandedIdx;
                return (
                  <React.Fragment key={role._id || role.name + String(realIdx)}>
                    <RoleCard
                      role={role}
                      idx={realIdx}
                      isExpanded={isExpanded}
                      isEditing={editIdx === realIdx}
                      editRoleName={editRoleName}
                      onEditChange={(e) => setEditRoleName(e.target.value)}
                      onEditSave={handleEditSave}
                      onEditCancel={handleEditCancel}
                      onEditClick={(e) => {
                        e.stopPropagation();
                        openEdit(realIdx);
                      }}
                      onExpand={() => {
                        if (editIdx !== realIdx)
                          setExpandedIdx(
                            realIdx === expandedIdx ? null : realIdx
                          );
                      }}
                      modules={["Users", "Roles", "Leads"]}
                      permissions={PERMISSIONS}
                    />
                    {editIdx === realIdx && (
                      <AddRoleDialog
                        open={true}
                        roleName={editRoleName}
                        modulePerms={editModulePerms}
                        modules={["Users", "Roles", "Leads"]}
                        permissions={PERMISSIONS}
                        onRoleNameChange={(e) =>
                          setEditRoleName(e.target.value)
                        }
                        onPermChange={(mod, perm, checked) =>
                          setEditModulePerms((mp) => ({
                            ...mp,
                            [mod]: { ...mp[mod], [perm]: checked },
                          }))
                        }
                        onClose={handleEditCancel}
                        onAdd={handleEditSave}
                        canAdd={
                          !!editRoleName.trim() &&
                          Object.values(editModulePerms).some((m) =>
                            Object.values(m).some(Boolean)
                          ) &&
                          !saving
                        }
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
            <Pagination
              page={page}
              pageSize={pageSize}
              total={roles.length}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Roles;
