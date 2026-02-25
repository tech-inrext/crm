"use client";

import React from "react";
import { useTheme, useMediaQuery, AddIcon, CircularProgress } from "@/components/ui/Component";
import useUsersPage from "@/fe/pages/user/hooks/useUsersPage";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/fe/pages/user/components/dialog/userDialog";
import UserDetailsDialog from "@/fe/pages/user/components/dialog/userDialogView.tsx";
import { useAuth } from "@/contexts/AuthContext";
import UsersPageActionBar from "@/fe/pages/user/components/UsersPageActionBar";
import { GRADIENTS, FAB_POSITION, USERS_PERMISSION_MODULE } from "@/fe/pages/user/constants/users";
import { canEditEmployee, getInitialUserForm } from "@/fe/pages/user/utils";
import { getUsersTableHeader } from "@/fe/pages/user/components/UserTable";
import UsersPageList from "@/fe/pages/user/components/UsersPageList";
import type { Employee } from "@/fe/pages/user/types";
import type {TostProps} from "@/fe/pages/user/types";


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
        employees, loading,
        page, setPage,
        rowsPerPage, setRowsPerPage,
        totalItems,
        saving, setOpen, open,
        editId,
        setForm, loadEmployees,
        getUserById,
        dialogMode, selectedUser,
        handleCloseDialog, openViewDialog, openEditDialog,
        isClient, windowWidth,
        search, handleSearchChange,
        handlePageSizeChange,
        snackbarOpen, snackbarSeverity, snackbarMessage, setSnackbarOpen,
        handleUserSave,
    } = useUsersPage();

    const usersTableHeader = getUsersTableHeader({
        canEditEmployee: (employee: Employee) => canEditEmployee(currentUser, employee),
        onView: openViewDialog,
        onEdit: openEditDialog,
    });

    return (
        <div className="p-4 sm:p-6">
            {/* Header + search/add bar */}
            <UsersPageActionBar
                search={search}
                onSearchChange={handleSearchChange}
                onAdd={() => setOpen(true)}
                saving={saving}
            />

            {/* Table / card list */}
            <UsersPageList
                loading={loading}
                employees={employees}
                isMobile={isMobile}
                isClient={isClient}
                windowWidth={windowWidth}
                page={page}
                rowsPerPage={rowsPerPage}
                totalItems={totalItems}
                usersTableHeader={usersTableHeader}
                onPageChange={setPage}
                onPageSizeChange={handlePageSizeChange}
                onEditUser={openEditDialog}
                canEdit={(user: Employee) => canEditEmployee(currentUser, user)}
            />

            {/* Floating action button – mobile only */}
            <PermissionGuard module={USERS_PERMISSION_MODULE} action="write" fallback={<></>}>
                <button
                    type="button"
                    aria-label="Add user"
                    onClick={() => setOpen(true)}
                    disabled={saving}
                    style={{ bottom: FAB_POSITION.bottom, right: FAB_POSITION.right, zIndex: FAB_POSITION.zIndex }}
                    className="fixed md:hidden flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60"
                    style={{ background: GRADIENTS.button }}
                >
                    {saving ? <CircularProgress size={24} color="inherit" /> : <AddIcon />}
                </button>

                {/* Dialogs */}
                {dialogMode === "view" ? (
                    <UserDetailsDialog open={open} user={selectedUser} onClose={handleCloseDialog} />
                ) : (
                    <UserDialog
                        open={open}
                        editId={editId}
                        initialData={getInitialUserForm(selectedUser)}
                        saving={saving}
                        onClose={handleCloseDialog}
                        onSave={handleUserSave}
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
