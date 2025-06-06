import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import MyButton from "@/components/ui/MyButton";
import RoleCard from "../../components/ui/RoleCard";
import AddRoleDialog from "../../components/ui/AddRoleDialog";
import rolesJson from "@/data/roles.json";

interface RoleWithPermissions {
  name: string;
  permissions: string[];
}

const LOCAL_ROLES_KEY = "roles";
const LOCAL_ROLE_NAMES_KEY = "roleNames";

const MODULES = ["Users", "Roles", "Leads"];
const PERMISSIONS = ["read", "write", "delete"];

const getMergedRoles = (): RoleWithPermissions[] => {
  const saved =
    typeof window !== "undefined"
      ? localStorage.getItem(LOCAL_ROLES_KEY)
      : null;
  let merged: RoleWithPermissions[] = [];
  // Use roles.json as the base
  const defaultRoles = (rolesJson as RoleWithPermissions[]).map((role) => ({
    name: role.name,
    permissions: MODULES.flatMap((mod) =>
      role.permissions.map((perm) => `${mod}:${perm}`)
    ),
  }));
  if (saved) {
    const localRoles = JSON.parse(saved) as RoleWithPermissions[];
    const map = new Map<string, RoleWithPermissions>();
    defaultRoles.forEach((r) => map.set(r.name, r));
    localRoles.forEach((r) => map.set(r.name, r));
    merged = Array.from(map.values());
  } else {
    merged = defaultRoles;
  }
  return merged;
};

const Roles = () => {
  const [roles, setRoles] = useState<RoleWithPermissions[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [modulePerms, setModulePerms] = useState<
    Record<string, Record<string, boolean>>
  >(() =>
    Object.fromEntries(
      MODULES.map((m) => [m, { read: false, write: false, delete: false }])
    )
  );
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editModulePerms, setEditModulePerms] = useState<
    Record<string, Record<string, boolean>>
  >(() =>
    Object.fromEntries(
      MODULES.map((m) => [m, { read: false, write: false, delete: false }])
    )
  );
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  // Load roles on mount
  useEffect(() => {
    setRoles(getMergedRoles());
  }, []);

  // Sync roles to localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_ROLES_KEY, JSON.stringify(roles));
    const roleNames = roles.map((r) => r.name);
    localStorage.setItem(LOCAL_ROLE_NAMES_KEY, JSON.stringify(roleNames));
  }, [roles]);

  const handleAddRole = () => {
    const trimmed = roleName.trim();
    if (!trimmed) return;
    // Flatten module permissions into a string[]
    const permissions: string[] = [];
    for (const mod of MODULES) {
      for (const perm of PERMISSIONS) {
        if (modulePerms[mod][perm]) permissions.push(`${mod}:${perm}`);
      }
    }
    if (!permissions.length) return;
    setRoles([{ name: trimmed, permissions }, ...roles]);
    setAddOpen(false);
    setRoleName("");
    setModulePerms(
      Object.fromEntries(
        MODULES.map((m) => [m, { read: false, write: false, delete: false }])
      )
    );
  };

  const openEdit = (idx: number) => {
    setEditIdx(idx);
    setEditRoleName(roles[idx].name);
    // Parse permissions into module-wise object
    const perms: Record<string, Record<string, boolean>> = Object.fromEntries(
      MODULES.map((m) => [m, { read: false, write: false, delete: false }])
    );
    roles[idx].permissions.forEach((p) => {
      const [mod, perm] = p.split(":");
      if (perms[mod] && perm) perms[mod][perm] = true;
    });
    setEditModulePerms(perms);
  };

  const handleEditSave = () => {
    if (editIdx === null) return;
    const trimmed = editRoleName.trim();
    if (!trimmed) return;
    const permissions: string[] = [];
    for (const mod of MODULES) {
      for (const perm of PERMISSIONS) {
        if (editModulePerms[mod][perm]) permissions.push(`${mod}:${perm}`);
      }
    }
    if (!permissions.length) return;
    setRoles((prev) =>
      prev.map((r, i) => (i === editIdx ? { name: trimmed, permissions } : r))
    );
    setEditIdx(null);
    setEditRoleName("");
    setEditModulePerms(
      Object.fromEntries(
        MODULES.map((m) => [m, { read: false, write: false, delete: false }])
      )
    );
  };

  const handleEditCancel = () => {
    setEditIdx(null);
    setEditRoleName("");
    setEditModulePerms(
      Object.fromEntries(
        MODULES.map((m) => [m, { read: false, write: false, delete: false }])
      )
    );
  };

  // NoRoles component for empty state
  const NoRoles = () => (
    <Box sx={{ textAlign: "center", py: 3, color: "#888", width: "100%" }}>
      No roles added yet.
    </Box>
  );

  return (
    <Box sx={{ mt: 2, ml: { xs: 0, sm: 2 }, maxWidth: 700, width: "100%" }}>
      <Typography sx={{ fontWeight: 700, fontSize: 20, mb: 2, color: "#000" }}>
        Roles & Permissions
      </Typography>
      <MyButton
        variant="contained"
        onClick={() => setAddOpen(true)}
        sx={{
          bgcolor: "#1976d2",
          color: "#fff",
          fontWeight: 600,
          minWidth: 120,
          width: { xs: "100%", sm: "auto" },
          mb: { xs: 2, sm: 0 },
        }}
      >
        Add
      </MyButton>
      <AddRoleDialog
        open={addOpen}
        roleName={roleName}
        modulePerms={modulePerms}
        modules={MODULES}
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
          Object.values(modulePerms).some((m) => Object.values(m).some(Boolean))
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
          {roles.map((role, idx) => {
            const isExpanded = editIdx === null && idx === expandedIdx;
            return (
              <React.Fragment key={role.name + String(idx)}>
                <RoleCard
                  role={role}
                  idx={idx}
                  isExpanded={isExpanded}
                  isEditing={editIdx === idx}
                  editRoleName={editRoleName}
                  onEditChange={(e) => setEditRoleName(e.target.value)}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                  onEditClick={(e) => {
                    e.stopPropagation();
                    openEdit(idx);
                  }}
                  onExpand={() => {
                    if (editIdx !== idx)
                      setExpandedIdx(idx === expandedIdx ? null : idx);
                  }}
                  modules={MODULES}
                  permissions={PERMISSIONS}
                />
                {editIdx === idx && (
                  <AddRoleDialog
                    open={true}
                    roleName={editRoleName}
                    modulePerms={editModulePerms}
                    modules={MODULES}
                    permissions={PERMISSIONS}
                    onRoleNameChange={(e) => setEditRoleName(e.target.value)}
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
                      )
                    }
                  />
                )}
              </React.Fragment>
            );
          })}
        </Box>
      </Paper>
    </Box>
  );
};

export default Roles;
