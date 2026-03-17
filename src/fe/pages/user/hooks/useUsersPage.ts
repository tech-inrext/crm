"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/user/constants/users";
import type { Employee } from "@/fe/pages/user/types";

type SnackbarSeverity = "success" | "error";
type DialogMode = "create" | "edit" | "view";

export function useUsersPage() {
  // ─── Search ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── View toggle (my team vs all employees) ──────────────────────────────
  const [showAllEmployees, setShowAllEmployees] = useState(false);

  // ─── Dialog State ───────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);

  // ─── Snackbar ───────────────────────────────────────────────────────────
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<SnackbarSeverity>("success");

  // ─── Dialog handlers ─────────────────────────────────────────────────────
  const handleCloseDialog = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setSelectedUser(null);
    setDialogMode("create");
  }, []);

  const openViewDialog = useCallback((employee: Employee) => {
    setSelectedUser(employee);
    setDialogMode("view");
    setOpen(true);
  }, []);

  const openEditDialog = useCallback((employee: Employee) => {
    setSelectedUser(employee);
    setEditId(employee._id || null);
    setDialogMode("edit");
    setOpen(true);
  }, []);

  // ─── Search handler ─────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  return {
    // Search
    search,
    debouncedSearch,
    handleSearchChange,

    // View toggle
    showAllEmployees,
    setShowAllEmployees,

    // Dialog
    open,
    setOpen,
    editId,
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,

    // Snackbar
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
  } as const;
}

export default useUsersPage;
