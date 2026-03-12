"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/vendor/constants/vendors";
import type { Vendor } from "@/fe/pages/vendor/types";

type SnackbarSeverity = "success" | "error";

export function useVendorsPage() {
  // ─── Search ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Dialog State ───────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // ─── Snackbar ───────────────────────────────────────────────────────────
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<SnackbarSeverity>("success");

  // ─── Reset to page 1 when search changes ────────────────────────────────
  const [resetPageToken, setResetPageToken] = useState(0);

  useEffect(() => {
    setResetPageToken((t) => t + 1);
  }, [debouncedSearch]);

  // ─── Dialog handlers ─────────────────────────────────────────────────────
  const handleCloseDialog = useCallback(() => {
    setOpen(false);
    setEditId(null);
    setSelectedVendor(null);
  }, []);

  const openEditDialog = useCallback((vendor: Vendor) => {
    setSelectedVendor(vendor);
    setEditId(vendor._id || null);
    setOpen(true);
  }, []);

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

    // Dialog
    open,
    setOpen,
    editId,
    selectedVendor,
    handleCloseDialog,
    openEditDialog,

    // Snackbar
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,

    // Internal
    resetPageToken,
  } as const;
}

export default useVendorsPage;
