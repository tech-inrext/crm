"use client";

import React, { useCallback, useEffect } from "react";
import { AddIcon } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import RolesPageActionBar from "@/fe/pages/roles/components/RolesPageActionBar";
import RolesList from "@/fe/pages/roles/components/RolesList";
import RoleDialog from "@/fe/pages/roles/components/dialog/RoleDialog";
import RolePermissionsDialog from "@/fe/pages/roles/components/dialog/RolePermissionsDialog";
import useRolesPage from "@/fe/pages/roles/hooks/useRolesPage";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/fe/pages/roles/roleApi";
import { invalidateQueryCache } from "@/fe/hooks/createApi";
import {
  FAB_POSITION,
  GRADIENTS,
  ROLES_PERMISSION_MODULE,
  ROLE_CACHE_KEYS,
} from "@/fe/pages/roles/constants/roles";
import {
  buildCreateRolePayload,
  buildUpdateRolePayload,
} from "@/fe/pages/roles/utils";
import type { RoleFormData, TostProps } from "@/fe/pages/roles/types";

const Toast: React.FC<TostProps> = ({ open, message, severity, onClose }) => {
  if (!open) return null;

  const colourClass =
    severity === "success"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white";

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-[1400] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${colourClass}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

const RolesPage: React.FC = () => {
  const {
    search,
    debouncedSearch,
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
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
  } = useRolesPage();

  const {
    items: roles,
    loading,
    page,
    rowsPerPage,
    totalItems,
    refetch,
    setPage,
    setPageSize,
  } = useGetRolesQuery({ search: debouncedSearch });

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const { mutate: createRole } = useCreateRoleMutation();
  const { mutate: updateRole } = useUpdateRoleMutation();

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
    },
    [setPageSize, setPage],
  );

  const handleMutationSuccess = useCallback(async () => {
    invalidateQueryCache(ROLE_CACHE_KEYS.ROLES);
    await refetch();
    handleCloseDialog();
    setSnackbarMessage("Role saved successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 2000);
  }, [
    refetch,
    handleCloseDialog,
    setSnackbarMessage,
    setSnackbarSeverity,
    setSnackbarOpen,
  ]);

  const handleRoleSubmit = useCallback(
    async (formData: RoleFormData) => {
      try {
        if (formData.editId) {
          const payload = buildUpdateRolePayload(formData);
          await updateRole(payload, handleMutationSuccess);
        } else {
          const payload = buildCreateRolePayload(formData);
          await createRole(payload, handleMutationSuccess);
        }
      } catch {
        setSnackbarMessage("Failed to save role.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
        setTimeout(() => setSnackbarOpen(false), 3000);
      }
    },
    [
      createRole,
      updateRole,
      handleMutationSuccess,
      setSnackbarMessage,
      setSnackbarSeverity,
      setSnackbarOpen,
    ],
  );

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
          onPageSizeChange={handlePageSizeChange}
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
        <button
          type="button"
          aria-label="Add role"
          onClick={() => setOpen(true)}
          style={{
            bottom: FAB_POSITION.bottom,
            right: FAB_POSITION.right,
            zIndex: FAB_POSITION.zIndex,
            background: GRADIENTS.button,
          }}
          className="fixed md:hidden flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-transform active:scale-95"
        >
          <AddIcon />
        </button>
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

      {/* Toast notification */}
      <Toast
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </div>
  );
};

export default RolesPage;
