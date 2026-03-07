"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/fe/pages/user/hooks/useUsers";
import { useUserDialog } from "@/fe/pages/user/hooks/useUserDialog";
import type { MutationError } from "@/fe/hooks/useMutation";
import {
  SEARCH_DEBOUNCE_DELAY,
  DEFAULT_USER_FORM,
} from "@/fe/pages/user/constants/users";
import type { UserFormData } from "@/fe/pages/user/types";

type SnackbarSeverity = "success" | "error";

/** Extracts a human-readable message from a MutationError or unknown thrown value. */
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

export function useUsersPage() {
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  const [search, setSearch] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<SnackbarSeverity>("success");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
  const users = useUsers(debouncedSearch);
  // Destructure stable references upfront so TypeScript can resolve
  // their types without going through the wide `users` object union
  const { loadEmployees, queryState } = users;

  const {
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,
  } = useUserDialog({
    employees: users.employees,
    loading: queryState.loading,
    getUserById: users.getUserById,
    setEditId: users.setEditId,
    setOpen: users.setOpen,
    setForm: users.setForm,
    defaultForm: DEFAULT_USER_FORM,
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
      queryState.setPage(1);
    },
    [queryState],
  );

  // ── Pagination ───────────────────────────────────────────────────────────
  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      queryState.setPageSize(newSize);
      queryState.setPage(1);
    },
    [queryState],
  );

  // ── Save (create / update) ───────────────────────────────────────────────
  /**
   * Cache invalidation is handled inside useMutation via `invalidateKeys`,
   * so we no longer need to manually call `loadEmployees()` after save —
   * the next render cycle will pick up fresh data automatically.
   */
  const handleUserSave = useCallback(
    async (values: UserFormData) => {
      try {
        if (users.editId) {
          await users.updateUser(users.editId, values);
          showSnackbar("User updated successfully");
        } else {
          await users.addUser(values);
          showSnackbar("User created successfully");
        }
        handleCloseDialog();
        queryState.setPage(1);
        setSearch("");
        // Force a fresh fetch to get the updated list (bypasses cache)
        await loadEmployees();
      } catch (err) {
        const { message, status } = resolveErrorMessage(
          err,
          "Failed to save user",
        );
        showSnackbar(
          status === 409
            ? message || "User with same email or phone already exists"
            : message,
          "error",
        );
      }
    },
    [users, loadEmployees, handleCloseDialog, showSnackbar],
  );

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleUserDelete = useCallback(
    async (id: string) => {
      try {
        await users.deleteUser(id);
        showSnackbar("User deleted successfully");
        queryState.setPage(1);
        // Force a fresh fetch to get the updated list (bypasses cache)
        await loadEmployees();
      } catch (err) {
        const { message } = resolveErrorMessage(err, "Failed to delete user");
        showSnackbar(message, "error");
      }
    },
    [users, loadEmployees, showSnackbar],
  );

  return {
    // Query state from createApi (grouped)
    queryState,
    // Data
    employees: users.employees,
    // Actions
    addUser: users.addUser,
    updateUser: users.updateUser,
    deleteUser: users.deleteUser,
    getUserById: users.getUserById,
    // Dialog state
    open: users.open,
    setOpen: users.setOpen,
    editId: users.editId,
    setEditId: users.setEditId,
    form: users.form,
    setForm: users.setForm,
    // Mutation state
    saving: users.saving,
    createError: users.createError,
    updateError: users.updateError,
    deleteError: users.deleteError,
    abortAll: users.abortAll,
    // Dialog exports
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,
    // UI state
    isClient,
    windowWidth,
    search,
    setSearch,
    handleSearchChange,
    handlePageSizeChange,
    // snackbar
    snackbarMessage,
    snackbarSeverity,
    snackbarOpen,
    setSnackbarOpen,
    // handlers
    handleUserSave,
    handleUserDelete,
  } as const;
}

export default useUsersPage;
