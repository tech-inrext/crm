"use client";

import React from "react";
import { AddIcon } from "@/components/ui/Component";
import PermissionGuard from "@/components/PermissionGuard";
import { UserDialog, UserDialogView as UserDetailsDialog } from "./components/dialog";
import UsersPageActionBar from "./components/UsersPageActionBar";
import {
  GRADIENTS,
  FAB_POSITION,
  USERS_PERMISSION_MODULE,
} from "./constants/users";
import {
  canEditEmployee,
  getInitialUserForm,
} from "./utils";
import UsersList from "./components/UsersList";
import useUsersPage from "./hooks/useUsersPage";
import type { Employee } from "@/fe/pages/user/types";

const UsersPage: React.FC = () => {
  const {
    currentUser,
    search,
    handleSearchChange,
    open,
    setOpen,
    editId,
    dialogMode,
    selectedUser,
    handleCloseDialog,
    openViewDialog,
    openEditDialog,
    showAllEmployees,
    setShowAllEmployees,
    employees,
    loading,
    page,
    rowsPerPage,
    totalItems,
    setPage,
    handlePageSizeChange,
    handleMutationSuccess,
  } = useUsersPage();

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

    </div>
  );
};

export default UsersPage;
