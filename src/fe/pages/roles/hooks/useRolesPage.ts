"use client";

import { useCallback, useState } from "react";
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
import { invalidateQueryCache } from "@/fe/hooks/createApi";
import {
  buildCreateRolePayload,
  buildUpdateRolePayload,
} from "@/fe/pages/roles/utils";
import type { Role, RoleFormData } from "@/fe/pages/roles/types";

type SnackbarSeverity = "success" | "error";

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

  // ─── Snackbar ──────────────────────────────────────────────────────────────
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<SnackbarSeverity>("success");

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

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity, duration = 2000) => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
      setTimeout(() => setSnackbarOpen(false), duration);
    },
    [setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen],
  );

  const handleMutationSuccess = useCallback(async () => {
    invalidateQueryCache(ROLE_CACHE_KEYS.ROLES);
    await refetch();
    handleCloseDialog();
    showSnackbar("Role saved successfully!", "success");
  }, [refetch, handleCloseDialog, showSnackbar]);

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
        showSnackbar("Failed to save role.", "error", 3000);
      }
    },
    [createRole, updateRole, handleMutationSuccess, showSnackbar],
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

    // Snackbar
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    snackbarSeverity,

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
