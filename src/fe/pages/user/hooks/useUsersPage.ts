"use client";

import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useUsers } from "@/fe/pages/user/hooks/useUsers";
import { useUserDialog } from "@/fe/pages/user/hooks/useUserDialog";
import {
  SEARCH_DEBOUNCE_DELAY,
  DEFAULT_USER_FORM,
} from "@/fe/pages/user/constants/users";

export function useUsersPage() {
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  const [search, setSearch] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  const users = useUsers(debouncedSearch);

  const {
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,
  } = useUserDialog({
    employees: users.employees,
    loading: users.loading,
    getUserById: users.getUserById,
    setEditId: users.setEditId,
    setOpen: users.setOpen,
    setForm: users.setForm,
    defaultForm: DEFAULT_USER_FORM,
  });

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
      users.setPage(1);
    },
    [users],
  );

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      users.setRowsPerPage(newSize);
      users.setPage(1);
    },
    [users],
  );

  const handleUserSave = useCallback(
    async (values: any) => {
      try {
        if (users.editId) {
          await users.updateUser(users.editId, values);
          setSnackbarMessage("User updated successfully");
        } else {
          await users.addUser(values);
          setSnackbarMessage("User created successfully");
        }
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
        handleCloseDialog();
        users.setPage(1);
        setSearch("");
        await users.loadEmployees();
      } catch (err: any) {
        const message =
          err?.message || err?.response?.data?.message || "Failed to save user";
        setSnackbarMessage(
          err?.status === 409
            ? message || "User with same email or phone exists"
            : message,
        );
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    },
    [users, handleCloseDialog],
  );

  return {
    // users hook exports
    ...users,
    // dialog exports
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
    debouncedSearch,
    handleSearchChange,
    handlePageSizeChange,
    // snackbar
    snackbarMessage,
    snackbarSeverity,
    snackbarOpen,
    setSnackbarOpen,
    handleUserSave,
  } as const;
}

export default useUsersPage;
