"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { SEARCH_DEBOUNCE_DELAY } from "@/fe/pages/user/constants/users";
import type { Employee } from "@/fe/pages/user/types";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/fe/components/Toast/ToastContext";
import {
  useGetUsersQuery,
  useGetMyTeamHierarchyQuery,
} from "../userApi";
import { flattenHierarchy } from "../utils";
import { invalidateQueryCache } from "@/fe/hooks/createApi";

type DialogMode = "create" | "edit" | "view";

export function useUsersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

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
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  // ─── All-employees data (server-paginated) ─────────────────────────────
  const {
    items: allEmployees,
    loading: allLoading,
    page: allPage,
    rowsPerPage: allRowsPerPage,
    totalItems: allTotalItems,
    refetch: allRefetch,
    setPage: setAllPage,
    setPageSize: setAllPageSize,
  } = useGetUsersQuery({ search: debouncedSearch });

  // ─── My-team hierarchy data ─────────────────────────────────────────────
  const {
    data: hierarchyData,
    loading: hierarchyLoading,
    refetch: hierarchyRefetch,
    page: myTeamPage,
    rowsPerPage: myTeamRowsPerPage,
    setPage: setMyTeamPage,
    setPageSize: setMyTeamPageSize,
  } = useGetMyTeamHierarchyQuery(
    currentUser?._id ? { managerId: currentUser._id } : {},
  );

  // Flatten hierarchy tree → filter by search → paginate client-side
  const myTeamAll = useMemo(() => {
    if (!hierarchyData?.data) return [];
    const flat = flattenHierarchy(hierarchyData.data);
    if (!debouncedSearch) return flat;
    const q = debouncedSearch.toLowerCase();
    return flat.filter(
      (e) =>
        e.name?.toLowerCase().includes(q) ||
        (e.email as string | undefined)?.toLowerCase().includes(q) ||
        (e.phone as string | undefined)?.includes(q),
    );
  }, [hierarchyData, debouncedSearch]);

  const myTeamPaginated = useMemo(() => {
    const start = (myTeamPage - 1) * myTeamRowsPerPage;
    return myTeamAll.slice(start, start + myTeamRowsPerPage);
  }, [myTeamAll, myTeamPage, myTeamRowsPerPage]);

  // ─── Derived values ────────────────────────────────────────────────────
  const employees = showAllEmployees ? allEmployees : myTeamPaginated;
  const loading = showAllEmployees ? allLoading : hierarchyLoading;
  const page = showAllEmployees ? allPage : myTeamPage;
  const rowsPerPage = showAllEmployees ? allRowsPerPage : myTeamRowsPerPage;
  const totalItems = showAllEmployees ? allTotalItems : myTeamAll.length;
  const setPage = showAllEmployees ? setAllPage : setMyTeamPage;

  // ─── Window setup ────────────────────────────────────────────────────────
  useEffect(() => {
    setIsClient(true);
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setAllPage(1);
    setMyTeamPage(1);
  }, [debouncedSearch]);

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

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      if (showAllEmployees) {
        setAllPageSize(newSize);
        setAllPage(1);
      } else {
        setMyTeamPageSize(newSize);
        setMyTeamPage(1);
      }
    },
    [
      showAllEmployees,
      setAllPageSize,
      setAllPage,
      setMyTeamPageSize,
      setMyTeamPage,
    ],
  );

  const handleMutationSuccess = useCallback(async () => {
    invalidateQueryCache("/api/v0/employee");
    await Promise.all([allRefetch(), hierarchyRefetch()]);
    handleCloseDialog();
    showToast("User saved successfully!", "success");
  }, [
    allRefetch,
    hierarchyRefetch,
    handleCloseDialog,
    showToast,
  ]);

  return {
    currentUser,
    // Search
    search,
    debouncedSearch,
    handleSearchChange,

    // View toggle
    showAllEmployees,
    setShowAllEmployees,

    // Data
    employees,
    loading,
    page,
    rowsPerPage,
    totalItems,
    setPage,
    handlePageSizeChange,
    handleMutationSuccess,

    // Dialog
    open,
    setOpen,
    editId,
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,

    // UI
    isClient,
    windowWidth,
  } as const;
}

export default useUsersPage;
