"use client";

import React, { useCallback, useEffect } from "react";
import { useTheme, useMediaQuery, AddIcon } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/fe/pages/user/components/dialog/userDialog";
import UserDetailsDialog from "@/fe/pages/user/components/dialog/userDialogView.tsx";
import { useAuth } from "@/contexts/AuthContext";
import UsersPageActionBar from "@/fe/pages/user/components/UsersPageActionBar";
import {
  GRADIENTS,
  FAB_POSITION,
  USERS_PERMISSION_MODULE,
} from "@/fe/pages/user/constants/users";
import { canEditEmployee, getInitialUserForm } from "@/fe/pages/user/utils";
import { getUsersTableHeader } from "@/fe/pages/user/components/UserTable";
import UsersPageList from "@/fe/pages/user/components/UsersPageList";
import useUsersPage from "@/fe/pages/user/hooks/useUsersPage";
import { useGetUsersQuery } from "@/fe/pages/user/userApi";
import { invalidateQueryCache } from "@/fe/hooks/createApi";
import type { Employee, TostProps } from "@/fe/pages/user/types";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
    isClient,
    windowWidth,
  } = useUsersPage();

  const {
    items: employees,
    loading,
    page,
    rowsPerPage,
    totalItems,
    refetch,
    setPage,
    setPageSize,
  } = useGetUsersQuery({ search: debouncedSearch });

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

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
    setSnackbarMessage("User saved successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 2000);
  }, [
    refetch,
    handleCloseDialog,
    setSnackbarMessage,
    setSnackbarSeverity,
    setSnackbarOpen,
  ]);

  const usersTableHeader = React.useMemo(
    () =>
      getUsersTableHeader({
        canEditEmployee: (employee: Employee) =>
          canEditEmployee(currentUser, employee),
        onView: openViewDialog,
        onEdit: openEditDialog,
      }),
    [currentUser],
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header + search/add bar */}
      <UsersPageActionBar
        search={search}
        onSearchChange={handleSearchChange}
        onAdd={() => setOpen(true)}
      />

      {/* Table / card list */}
      <UsersPageList
        loading={loading}
        employees={employees}
        page={page}
        rowsPerPage={rowsPerPage}
        totalItems={totalItems}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        search={search}
        isMobile={isMobile}
        isClient={isClient}
        windowWidth={windowWidth}
        usersTableHeader={usersTableHeader}
        onEditUser={openEditDialog}
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
          className="fixed md:hidden flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-transform active:scale-95"
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
