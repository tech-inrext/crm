"use client";

import { useCallback, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/roles/constants/roles";
import type { Role } from "@/fe/pages/roles/types";

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
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
  } as const;
}

export default useRolesPage;
