"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useGetUsersQuery } from "@/fe/pages/user/userApi";
import { invalidateQueryCache } from "@/fe/hooks/createApi";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/user/constants/users";
import type { Employee } from "@/fe/pages/user/types";

type SnackbarSeverity = "success" | "error";
type DialogMode = "create" | "edit" | "view";

export function useUsersPage() {
  // ─── Pagination & Search ────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

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

  // ─── UI ──────────────────────────────────────────────────────────────────
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  // ─── Query (direct createApi usage) ──────────────────────────────────────
  const {
    items: employees,
    loading,
    totalItems,
    refetch,
  } = useGetUsersQuery({
    page,
    rowsPerPage,
    search: debouncedSearch,
  });

  // ─── Window setup ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      setPage(1);
    },
    [],
  );

  // ─── Pagination handler ─────────────────────────────────────────────────
  const handlePageSizeChange = useCallback((newSize: number) => {
    setRowsPerPage(newSize);
    setPage(1);
  }, []);

  // ─── Mutation success handler ────────────────────────────────────────────
  const handleMutationSuccess = useCallback(async () => {
    invalidateQueryCache("/api/v0/employee");
    await refetch();
    handleCloseDialog();
    setSnackbarMessage("User saved successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  }, [refetch, handleCloseDialog]);

  return {
    // Pagination & Data
    page,
    setPage,
    rowsPerPage,
    handlePageSizeChange,
    employees,
    loading,
    totalItems,

    // Search
    search,
    handleSearchChange,

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
    snackbarSeverity,

    // UI
    isClient,
    windowWidth,

    // Refetch
    handleMutationSuccess,
  } as const;
}

export default useUsersPage;
