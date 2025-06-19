import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  Box,
  Paper,
  CircularProgress,
  Button,
  Card,
  CardContent,
  Skeleton,
  useTheme,
  useMediaQuery,
  Fab,
  Tooltip,
  Stack,
  Divider,
  IconButton,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Add,
  Security,
  Settings,
  AdminPanelSettings,
  PersonAdd,
  ViewModule,
  ViewList,
} from "@mui/icons-material";
import axios from "axios";
import RoleCard from "../../components/ui/RoleCard";
import AddRoleDialog from "../../components/ui/AddRoleDialog";
import Pagination from "../../components/ui/Pagination";
import PermissionGuard from "../../components/PermissionGuard";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [mounted, setMounted] = useState(false);
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setMounted(true);
  }, []);
  // Load roles from API on mount
  useEffect(() => {
    loadRoles();
  }, []);

  // Enhanced stats calculation
  const stats = useMemo(() => {
    const totalPermissions = roles.reduce(
      (acc, role) => acc + role.permissions.length,
      0
    );
    const activeRoles = roles.filter(
      (role) => role.permissions.length > 0
    ).length;
    const adminRoles = roles.filter((role) =>
      role.permissions.some((p) => p.includes("write") || p.includes("delete"))
    ).length;

    return {
      total: roles.length,
      active: activeRoles,
      admin: adminRoles,
      avgPermissions:
        roles.length > 0 ? Math.round(totalPermissions / roles.length) : 0,
    };
  }, [roles]);

  // Get role color based on permissions count
  const getRoleColor = (permissionsCount: number) => {
    if (permissionsCount >= 6) return "#4CAF50"; // Green for high permissions
    if (permissionsCount >= 3) return "#FF9800"; // Orange for medium permissions
    return "#2196F3"; // Blue for low permissions
  };

  // Enhanced Loading skeleton component
  const LoadingSkeleton = () => (
    <Box sx={{ mt: 2 }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} sx={{ mb: 2, p: 2 }}>
          <Stack spacing={1}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={60} />
          </Stack>
        </Card>
      ))}
    </Box>
  );

  // Enhanced Role Card Component for Grid View
  const EnhancedRoleCard = ({
    role,
    idx,
  }: {
    role: RoleWithPermissions;
    idx: number;
  }) => (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          elevation: 8,
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
        },
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
        minHeight: 200,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          {/* Header with Avatar and Role Name */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: getRoleColor(role.permissions.length),
                width: 48,
                height: 48,
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              <Security />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {role.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {role.permissions.length} permission
                {role.permissions.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Permissions Display */}
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Permissions:
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {role.permissions.length === 0 ? (
                <Chip
                  label="No permissions"
                  size="small"
                  sx={{ backgroundColor: "#f5f5f5", color: "text.secondary" }}
                />
              ) : (
                role.permissions.map((perm, permIdx) => {
                  const [module, action] = perm.split(":");
                  const actionColor =
                    action === "read"
                      ? "#2196F3"
                      : action === "write"
                      ? "#FF9800"
                      : "#F44336";

                  return (
                    <Chip
                      key={permIdx}
                      label={`${module} ${action}`}
                      size="small"
                      sx={{
                        backgroundColor: actionColor,
                        color: "white",
                        fontWeight: 600,
                        fontSize: "0.7rem",
                      }}
                    />
                  );
                })
              )}
            </Box>
          </Box>

          {/* Action Button - Use existing RoleCard edit functionality */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <PermissionGuard module="role" action="write" fallback={<></>}>
              <Tooltip title="Edit Role">
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    openEdit(idx);
                  }}
                  size="small"
                  sx={{
                    backgroundColor: "primary.main",
                    color: "white",
                    "&:hover": { backgroundColor: "primary.dark" },
                  }}
                >
                  <Settings fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE, { withCredentials: true });
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
      const response = await axios.post(API_BASE, apiRole, {
        withCredentials: true,
      });
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

    console.log("Attempting to update role:", { roleId: role._id, apiRole }); // Debug log    setSaving(true);
    try {
      const response = await axios.patch(`${API_BASE}/${role._id}`, apiRole, {
        withCredentials: true,
      });

      console.log("Role update response:", response.data); // Debug log

      // Update the role in the local state with the response data
      const updatedRoleFromAPI = transformAPIRole(
        response.data.data || response.data
      );
      setRoles((prev) =>
        prev.map((r, i) => (i === editIdx ? updatedRoleFromAPI : r))
      );

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

      // Show user-friendly error message
      let errorMessage = "Failed to update role";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // You could show a toast notification here
      alert(errorMessage);
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
  // Paginate roles
  const pagedRoles = roles.slice((page - 1) * pageSize, page * pageSize);

  if (!mounted)
    return <div style={{ minHeight: "100vh", background: "#f5f7fa" }} />;
  return (
    <Box
      sx={{
        mt: { xs: 3, sm: 4, md: 5 }, // Increased top margin
        pt: { xs: 2, md: 3 }, // Added top padding
        mx: { xs: 2, md: 3 }, // Increased horizontal margin
        width: "calc(100% - 16px)",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        borderRadius: 4,
        p: { xs: 3, md: 4 }, // Increased padding
        minHeight: "100vh",
      }}
    >
      {" "}
      {/* Enhanced Header Section */}
      <Paper
        elevation={8}
        sx={{
          p: { xs: 3, md: 5 }, // Increased padding
          borderRadius: 4,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          border: "1px solid rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          mb: { xs: 3, md: 4 }, // Added responsive bottom margin
          mt: { xs: 1, md: 2 }, // Added top margin
        }}
      >
        {" "}

        {/* Action Bar */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: { xs: "stretch", lg: "center" },
            gap: 2,
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              flex: 1,
              color: "text.primary",
              fontSize: { xs: 24, sm: 28, md: 32 },
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Roles & Permissions
          </Typography>

          {/* View Toggle Buttons */}
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Grid View">
              <IconButton
                onClick={() => setViewMode("grid")}
                sx={{
                  backgroundColor:
                    viewMode === "grid" ? "primary.main" : "action.hover",
                  color: viewMode === "grid" ? "white" : "text.primary",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <ViewModule />
              </IconButton>
            </Tooltip>
            <Tooltip title="List View">
              <IconButton
                onClick={() => setViewMode("list")}
                sx={{
                  backgroundColor:
                    viewMode === "list" ? "primary.main" : "action.hover",
                  color: viewMode === "list" ? "white" : "text.primary",
                  "&:hover": { backgroundColor: "primary.dark" },
                }}
              >
                <ViewList />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Add Role Button */}
          <PermissionGuard module="role" action="write" fal>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setAddOpen(true)}
              disabled={saving}
              sx={{
                minWidth: 160,
                height: 48,
                borderRadius: 3,
                fontWeight: 700,
                fontSize: "1rem",
                background: "linear-gradient(45deg, #667eea, #764ba2)",
                boxShadow: "0 8px 16px rgba(102, 126, 234, 0.3)",
                "&:hover": {
                  background: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
                  boxShadow: "0 12px 24px rgba(102, 126, 234, 0.4)",
                  transform: "translateY(-2px)",
                },
              }}
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Add Role"
              )}
            </Button>
          </PermissionGuard>
        </Box>
      </Paper>
      {/* Content Area */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {viewMode === "grid" ? (
            /* Enhanced Grid View */
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                  xl: "repeat(4, 1fr)",
                },
                gap: 3,
              }}
            >
              {roles.length === 0 ? (
                <Box
                  sx={{
                    gridColumn: "1 / -1",
                    textAlign: "center",
                    py: 8,
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                    borderRadius: 4,
                    border: "2px dashed #e0e0e0",
                  }}
                >
                  <AdminPanelSettings
                    sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }}
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    No roles created yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first role to manage user permissions
                  </Typography>
                </Box>
              ) : (
                pagedRoles.map((role, idx) => {
                  const realIdx = (page - 1) * pageSize + idx;
                  return (
                    <EnhancedRoleCard
                      key={role._id || role.name + String(realIdx)}
                      role={role}
                      idx={realIdx}
                    />
                  );
                })
              )}
            </Box>
          ) : (
            /* Enhanced List View - Uses existing RoleCard component */
            <Paper
              elevation={8}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, fontSize: 18, mb: 3, color: "#1a237e" }}
              >
                All Roles
              </Typography>

              {roles.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderRadius: 3,
                    border: "2px dashed #e0e0e0",
                  }}
                >
                  <AdminPanelSettings
                    sx={{ fontSize: 64, color: "#bdbdbd", mb: 2 }}
                  />
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    No roles created yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first role to manage user permissions
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: { xs: "center", sm: "flex-start" },
                    width: "100%",
                  }}
                >
                  {pagedRoles.map((role, idx) => {
                    const realIdx = (page - 1) * pageSize + idx;
                    const isExpanded =
                      editIdx === null && realIdx === expandedIdx;
                    return (
                      <React.Fragment
                        key={role._id || role.name + String(realIdx)}
                      >
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
              )}

              {/* Enhanced Pagination */}
              {roles.length > 0 && (
                <Box
                  sx={{
                    mt: 4,
                    pt: 3,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={roles.length}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                  />
                </Box>
              )}
            </Paper>
          )}
        </>
      )}
      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <PermissionGuard module="role" action="write" fal>
          <Fab
            color="primary"
            aria-label="add role"
            onClick={() => setAddOpen(true)}
            disabled={saving}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              background: "linear-gradient(45deg, #667eea, #764ba2)",
              "&:hover": {
                background: "linear-gradient(45deg, #5a6fd8, #6a42a0)",
              },
            }}
          >
            {saving ? <CircularProgress size={24} color="inherit" /> : <Add />}
          </Fab>
        </PermissionGuard>
      )}
      {/* Add Role Dialog */}
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
    </Box>
  );
};

export default Roles;
