"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useDebounce } from "@/hooks/useDebounce";
import {
  SEARCH_DEBOUNCE_DELAY,
  DEFAULT_DEPARTMENT_FORM,
  DEPARTMENTS_API_BASE,
} from "@/fe/pages/department/constants/departments";
import { useDepartmentDialog } from "@/fe/pages/department/hooks/useDepartmentDialog";
import type { Department, DepartmentFormData } from "@/fe/pages/department/types";

type SnackbarSeverity = "success" | "error";

function resolveErrorMessage(
  err: unknown,
  fallback = "An error occurred",
): { message: string; status?: number } {
  if (err && typeof err === "object" && "message" in err) {
    const e = err as MutationError;
    return { message: e.message ?? fallback, status: e.status };
  }
  if (err instanceof Error) return { message: err.message };
  return { message: fallback };
}

export function useDepartmentsPage() {
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  const [search, setSearch] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<SnackbarSeverity>("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // ─── Dialog State ───────────────────────────────────────────────────────
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  /**
   * Mock fetching by ID or finding in local state.
   * In a real app with createApi, this might be a manual fetch.
   */
  const getDepartmentById = async (id: string) => {
    try {
      const resp = await axios.get(`${DEPARTMENTS_API_BASE}/${id}`);
      return resp.data;
    } catch {
      return null;
    }
  };

  const {
    dialogMode,
    handleCloseDialog,
    openEditDialog,
    selectedDepartment,
  } = useDepartmentDialog({
    departments: [], // Not needed for alignment
    loading: false,
    getDepartmentById,
    setEditId,
    setOpen,
    setForm: () => { },
    defaultForm: DEFAULT_DEPARTMENT_FORM,
  },
  );

  // ── Window / client-side setup ───────────────────────────────────────────
  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  return {
    isClient,
    windowWidth,
    search,
    debouncedSearch,
    handleSearchChange,
    open,
    setOpen,
    editId,
    selectedDepartment,
    dialogMode,
    handleCloseDialog,
    openEditDialog,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
  } as const;
}

export default useDepartmentsPage;
