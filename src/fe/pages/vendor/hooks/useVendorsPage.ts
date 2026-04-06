"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/vendor/constants/vendors";
import type { Vendor } from "@/fe/pages/vendor/types";
import { useGetVendorsQuery } from "../vendorApi";
import { useToast } from "@/fe/components/Toast/ToastContext";
import { invalidateQueryCache } from "@/fe/framework/hooks/createApi";

export function useVendorsPage() {
  const { showToast } = useToast();

  // ─── Search ─────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Dialog State ───────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // ─── Data Fetching ──────────────────────────────────────────────────────
  const {
    items: vendors,
    loading,
    page,
    rowsPerPage,
    totalItems,
    refetch,
    setPage,
    setPageSize,
  } = useGetVendorsQuery({ search: debouncedSearch, isCabVendor: true });

  // ─── Reset to page 1 when search changes ────────────────────────────────
  useEffect(() => {
    setPage(1);
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

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setPageSize(newSize);
      setPage(1);
    },
    [setPageSize, setPage],
  );

  const handleMutationSuccess = useCallback(async () => {
    invalidateQueryCache("/api/v0/employee");
    await refetch();
    handleCloseDialog();
    showToast("Vendor saved successfully!", "success");
  }, [refetch, handleCloseDialog, showToast]);

  return {
    // Search
    search,
    handleSearchChange,

    // Dialog
    open,
    setOpen,
    editId,
    selectedVendor,
    handleCloseDialog,
    openEditDialog,

    // Data
    vendors,
    loading,
    page,
    rowsPerPage,
    totalItems,
    setPage,
    handlePageSizeChange,
    handleMutationSuccess,
  } as const;
}

export default useVendorsPage;
