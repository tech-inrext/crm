"use client";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/fe/components/Toast/ToastContext";
import { useDebounce } from "@/hooks/useDebounce";
import {
  SEARCH_DEBOUNCE_DELAY,
  ROLE_CACHE_KEYS,
} from "@/fe/pages/roles/constants/roles";
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from "@/fe/pages/roles/roleApi";
import { invalidateQueryCache } from "@/fe/framework/hooks/createApi";
import {
  buildCreateRolePayload,
  buildUpdateRolePayload,
} from "@/fe/pages/roles/utils";
import type { Role, RoleFormData } from "@/fe/pages/roles/types";


export function useRolesPage() {
  // ─── Search ────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Add / Edit dialog ────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // ─── Permissions view dialog ──────────────────────────────────────────────
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState<Role | null>(null);

  // ─── Toast ─────────────────────────────────────────────────────────────
  const { showToast } = useToast();

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setSelectedRole(null);
  }, []);

  const openEditDialog = useCallback((role: Role) => {
    setSelectedRole(role);
    setEditId(role._id || null);
    setOpen(true);
  }, []);

  const openViewPermissions = useCallback((role: Role) => {
    setSelectedRoleForPermissions(role);
    setPermissionsDialogOpen(true);
  }, []);

  const closePermissionsDialog = useCallback(() => {
    setPermissionsDialogOpen(false);
    setSelectedRoleForPermissions(null);
  }, []);

  // ─── Search reset ────────────────────────────────────────────────────────
  // Reset page to 1 whenever search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // ─── Query & mutations ────────────────────────────────────────────────────
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

  const { mutate: createRole } = useCreateRoleMutation();
  const { mutate: updateRole } = useUpdateRoleMutation();


  const handleMutationSuccess = useCallback(async () => {
    invalidateQueryCache(ROLE_CACHE_KEYS.ROLES);
    await refetch();
    handleCloseDialog();
    showToast("Role saved successfully!", "success");
  }, [refetch, handleCloseDialog, showToast]);

  const handleRoleSubmit = useCallback(
    async (formData: RoleFormData) => {
      try {
        if (formData.editId) {
          await updateRole(
            buildUpdateRolePayload(formData),
            handleMutationSuccess,
          );
        } else {
          await createRole(
            buildCreateRolePayload(formData),
            handleMutationSuccess,
          );
        }
      } catch {
        showToast("Failed to save role.", "error");
      }
    },
    [createRole, updateRole, handleMutationSuccess, showToast],
  );

  return {
    // Search
    search,
    debouncedSearch,
    handleSearchChange,

    // Add/Edit dialog
    open,
    setOpen,
    editId,
    selectedRole,
    handleCloseDialog,
    openEditDialog,

    // Permissions dialog
    permissionsDialogOpen,
    selectedRoleForPermissions,
    openViewPermissions,
    closePermissionsDialog,


    // Query data
    roles,
    loading,
    page,
    rowsPerPage,
    totalItems,
    setPage,
    setPageSize,

    // Submit
    handleRoleSubmit,
  } as const;
}

export default useRolesPage;
