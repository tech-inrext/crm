"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { AddIcon } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "./components/dialog/UserDialog/index";
import UserDetailsDialog from "./components/dialog/UserDialogView/index";
import { useAuth } from "@/contexts/AuthContext";
import UsersPageActionBar from "./components/UsersPageActionBar";
import {
  GRADIENTS,
  FAB_POSITION,
  USERS_PERMISSION_MODULE,
} from "./constants/users";
import {
  canEditEmployee,
  flattenHierarchy,
  getInitialUserForm,
} from "./utils";
import UsersList from "./components/UsersList";
import useUsersPage from "./hooks/useUsersPage";
import {
  useGetUsersQuery,
  useGetMyTeamHierarchyQuery,
} from "./userApi";
import { invalidateQueryCache } from "@/fe/hooks/createApi";
import type { Employee, TostProps } from "./types";

const Toast: React.FC<TostProps> = ({ open, message, severity, onClose }) => {
  if (!open) return null;

  const colourClass =
    severity === "success"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white";

  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-[1400] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${colourClass}`}
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
};

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    search,
    debouncedSearch,
    handleSearchChange,
    open,
    setOpen,
    editId,
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
    showAllEmployees,
    setShowAllEmployees,
  } = useUsersPage();

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

  // ─── My-team hierarchy data — pagination state comes free from createApi ─
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

  // ─── Derived values fed to the table ────────────────────────────────────
  const employees = showAllEmployees ? allEmployees : myTeamPaginated;
  const loading = showAllEmployees ? allLoading : hierarchyLoading;
  const page = showAllEmployees ? allPage : myTeamPage;
  const rowsPerPage = showAllEmployees ? allRowsPerPage : myTeamRowsPerPage;
  const totalItems = showAllEmployees ? allTotalItems : myTeamAll.length;

  const setPage = showAllEmployees ? setAllPage : setMyTeamPage;

  // Reset pages when search changes
  useEffect(() => {
    setAllPage(1);
    setMyTeamPage(1);
  }, [debouncedSearch]);

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
    setSnackbarMessage("User saved successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 2000);
  }, [
    allRefetch,
    hierarchyRefetch,
    handleCloseDialog,
    setSnackbarMessage,
    setSnackbarSeverity,
    setSnackbarOpen,
  ]);


  return (
    <div className="p-4 sm:p-6">
      {/* Header + search/add bar */}
      <UsersPageActionBar
        search={search}
        onSearchChange={handleSearchChange}
        onAdd={() => setOpen(true)}
        showAllEmployees={showAllEmployees}
        onToggleAllEmployees={() => setShowAllEmployees((v) => !v)}
        isSystemAdmin={currentUser?.isSystemAdmin}
      />

      {/* Table / card list */}
      <UsersList
        loading={loading}
        employees={employees}
        page={page}
        rowsPerPage={rowsPerPage}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onEditUser={openEditDialog}
        onViewUser={openViewDialog}
        canEdit={(user: Employee) => canEditEmployee(currentUser, user)}
      />

      {/* Floating action button – mobile only */}
      <PermissionGuard
        module={USERS_PERMISSION_MODULE}
        action="write"
        fallback={<></>}
      >
        <button
          type="button"
          aria-label="Add user"
          onClick={() => setOpen(true)}
          style={{
            bottom: FAB_POSITION.bottom,
            right: FAB_POSITION.right,
            zIndex: FAB_POSITION.zIndex,
            background: GRADIENTS.button,
          }}
          className="fixed flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-transform active:scale-95"
        >
          <AddIcon />
        </button>

        {/* Dialogs */}
        {dialogMode === "view" ? (
          <UserDetailsDialog
            open={open}
            user={selectedUser}
            onClose={handleCloseDialog}
          />
        ) : (
          <UserDialog
            open={open}
            editId={editId}
            initialData={getInitialUserForm(selectedUser)}
            onClose={handleCloseDialog}
            onSave={handleMutationSuccess}
          />
        )}
      </PermissionGuard>

      {/* Toast notification */}
      <Toast
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </div>
  );
};

export default UsersPage;
