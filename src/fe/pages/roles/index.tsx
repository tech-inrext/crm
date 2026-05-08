"use client";

import React from "react";
import PermissionGuard from "@/components/PermissionGuard";
import RolesPageActionBar from "@/fe/pages/roles/components/ActionBar/RolesPageActionBar";
import RolesList from "@/fe/pages/roles/components/RolesList";
import RoleDialog from "@/fe/pages/roles/components/Dialog/RoleDialog";
import RolePermissionsDialog from "@/fe/pages/roles/components/Dialog/RolePermissionsDialog";
import useRolesPage from "@/fe/pages/roles/hooks/useRolesPage";
import { ROLES_PERMISSION_MODULE } from "@/fe/pages/roles/constants/roles";

import { Box, Add as AddIcon, CircularProgress, Fab } from "@/components/ui/Component";
import { MODULE_STYLES } from "@/styles/moduleStyles";

const RolesPage: React.FC = () => {
  const {
    search,
    handleSearchChange,
    open,
    setOpen,
    selectedRole,
    handleCloseDialog,
    openEditDialog,
    permissionsDialogOpen,
    selectedRoleForPermissions,
    openViewPermissions,
    closePermissionsDialog,
    roles,
    loading,
    page,
    rowsPerPage,
    totalItems,
    setPage,
    setPageSize,
    handleRoleSubmit,
  } = useRolesPage();

  return (
    <PermissionGuard module={ROLES_PERMISSION_MODULE}>
      <Box sx={MODULE_STYLES.roles.rolesContainer}>
        {/* Header Section */}
        <Box sx={{ flexShrink: 0, mb: 0.5 }}>
          <RolesPageActionBar
            search={search}
            onSearchChange={handleSearchChange}
            onAdd={() => setOpen(true)}
          />
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <RolesList
            loading={loading}
            roles={roles}
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onEditRole={openEditDialog}
            onViewPermissions={openViewPermissions}
          />
        </Box>

        {/* Floating action button – mobile only */}
        <PermissionGuard
          module={ROLES_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Fab
            aria-label="Add role"
            onClick={() => setOpen(true)}
            sx={MODULE_STYLES.layout.mobileFab}
          >
            <AddIcon />
          </Fab>
        </PermissionGuard>

        {/* Add / Edit dialog */}
        <RoleDialog
          open={open}
          role={selectedRole}
          onSubmit={handleRoleSubmit}
          onClose={handleCloseDialog}
        />

        {/* View permissions dialog */}
        <RolePermissionsDialog
          open={permissionsDialogOpen}
          role={selectedRoleForPermissions}
          onClose={closePermissionsDialog}
        />
      </Box>
    </PermissionGuard>
  );
};

export default RolesPage;
