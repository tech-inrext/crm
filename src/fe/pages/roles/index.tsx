"use client";

import React from "react";
import { AddIcon, Fab } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import RolesPageActionBar from "@/fe/pages/roles/components/ActionBar/RolesPageActionBar";
import RolesList from "@/fe/pages/roles/components/RolesList";
import RoleDialog from "@/fe/pages/roles/components/Dialog/RoleDialog";
import RolePermissionsDialog from "@/fe/pages/roles/components/Dialog/RolePermissionsDialog";
import useRolesPage from "@/fe/pages/roles/hooks/useRolesPage";
import { ROLES_PERMISSION_MODULE } from "@/fe/pages/roles/constants/roles";
import { fabStyle } from "@/fe/pages/roles/styles";

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
    <div className="p-4 sm:p-6">
      {/* Header + search/add bar */}
      <RolesPageActionBar
        search={search}
        onSearchChange={handleSearchChange}
        onAdd={() => setOpen(true)}
      />

      {/* Role cards grid */}
      <div className="mt-2">
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
      </div>

      {/* Floating action button – mobile only */}
      <PermissionGuard
        module={ROLES_PERMISSION_MODULE}
        action="write"
        fallback={<></>}
      >
        <Fab aria-label="Add role" onClick={() => setOpen(true)} sx={fabStyle}>
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

    </div>
  );
};

export default RolesPage;
