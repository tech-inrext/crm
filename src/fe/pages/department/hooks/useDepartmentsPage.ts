"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useDepartments } from "@/fe/pages/department/hooks/useDepartments";
import { useDepartmentDialog } from "@/fe/pages/department/hooks/useDepartmentDialog";
import type { MutationError } from "@/fe/hooks/useMutation";
import {
  SEARCH_DEBOUNCE_DELAY,
  DEFAULT_DEPARTMENT_FORM,
} from "@/fe/pages/department/constants/departments";
import type { DepartmentFormData } from "@/fe/pages/department/types";

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
  const depts = useDepartments(debouncedSearch);
  const { loadDepartments } = depts;

  const {
    dialogMode,
    selectedDepartment,
    handleCloseDialog,
    openEditDialog,
  } = useDepartmentDialog({
    departments: depts.departments,
    loading: depts.loading,
    getDepartmentById: depts.getDepartmentById,
    setEditId: depts.setEditId,
    setOpen: depts.setOpen,
    setForm: depts.setForm,
    defaultForm: DEFAULT_DEPARTMENT_FORM,
  });

  // ── Window / client-side setup ───────────────────────────────────────────
  useEffect(() => {
    setIsClient(true);
    if (typeof window === "undefined") return;
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── Snackbar helpers ─────────────────────────────────────────────────────
  const showSnackbar = useCallback(
    (message: string, severity: SnackbarSeverity = "success") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setSnackbarOpen(true);
    },
    [],
  );

  // ── Search ───────────────────────────────────────────────────────────────
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      depts.setPage(1);
    },
    [depts],
  );

  // ── Pagination ───────────────────────────────────────────────────────────
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      depts.setRowsPerPage(newSize);
      depts.setPage(1);
    },
    [depts],
  );

  // ── Save (create / update) ────────────────────────────────────────────────
  const handleDepartmentSave = useCallback(
    async (values: DepartmentFormData) => {
      try {
        if (depts.editId) {
          await depts.updateDepartment(depts.editId, values);
          showSnackbar("Department updated successfully");
        } else {
          await depts.addDepartment(values);
          showSnackbar("Department created successfully");
        }
        handleCloseDialog();
        depts.setPage(1);
        setSearch("");
        await loadDepartments();
      } catch (err) {
        const { message, status } = resolveErrorMessage(
          err,
          "Failed to save department",
        );
        showSnackbar(
          status === 409
            ? message || "Department with same name or ID already exists"
            : message,
          "error",
        );
      }
    },
    [depts, loadDepartments, handleCloseDialog, showSnackbar],
  );

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDepartmentDelete = useCallback(
    async (id: string) => {
      try {
        await depts.deleteDepartment(id);
        showSnackbar("Department deleted successfully");
        depts.setPage(1);
        await loadDepartments();
      } catch (err) {
        const { message } = resolveErrorMessage(
          err,
          "Failed to delete department",
        );
        showSnackbar(message, "error");
      }
    },
    [depts, loadDepartments, showSnackbar],
  );

  return {
    // depts hook exports
    ...depts,
    // dialog exports
    dialogMode,
    selectedDepartment,
    handleCloseDialog,
    openEditDialog,
    // UI state
    isClient,
    windowWidth,
    search,
    setSearch,
    handleSearchChange,
    // snackbar
    snackbarMessage,
    snackbarSeverity,
    snackbarOpen,
    setSnackbarOpen,
    // handlers
    handleDepartmentSave,
    handleDepartmentDelete,
  } as const;
}

export default useDepartmentsPage;
