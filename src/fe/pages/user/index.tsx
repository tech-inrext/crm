"use client";

import React from "react";
import {
    Box,
    Fab,
    CircularProgress,
    useTheme,
    useMediaQuery,
    Snackbar,
    Alert,
    AddIcon,
} from "@/components/ui/Component";
import useUsersPage from "@/fe/pages/user/hooks/useUsersPage";
import PermissionGuard from "@/components/PermissionGuard";
import UserDialog from "@/fe/pages/user/components/dialog/UserDialog";
import UserDetailsDialog from "@/fe/pages/user/components/dialog/UserDetailsDialog";
import { useAuth } from "@/contexts/AuthContext";
import UsersPageActionBar from "@/fe/pages/user/components/UsersPageActionBar";
import {
    GRADIENTS,
    FAB_POSITION,
    USERS_PERMISSION_MODULE,
} from "@/fe/pages/user/constants/users";
import { default as MODULE_STYLES } from "@/fe/pages/user/styles";
import { canEditEmployee, getInitialUserForm } from "@/fe/pages/user/utils";
import { getUsersTableHeader } from "@/fe/pages/user/components/table/UsersTableConfig";
import UsersPageList from "@/fe/pages/user/components/UsersPageList";

const UsersPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const {
        employees,
        loading,
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        totalItems,
        saving,
        setOpen,
        open,
        editId,
        setEditId,
        addUser,
        updateUser,
        setForm,
        loadEmployees,
        getUserById,
        dialogMode,
        selectedUser,
        handleCloseDialog,
        openViewDialog,
        openEditDialog,
        isClient,
        windowWidth,
        search,
        handleSearchChange,
        handlePageSizeChange,
        snackbarOpen,
        snackbarSeverity,
        snackbarMessage,
        setSnackbarOpen,
        handleUserSave,
    } = useUsersPage();

    const usersTableHeader = getUsersTableHeader({
        canEditEmployee: (employee) => canEditEmployee(currentUser, employee),
        onView: openViewDialog,
        onEdit: openEditDialog,
    });

    return (
        <Box sx={MODULE_STYLES.users.usersContainer}>
            <UsersPageActionBar
                search={search}
                onSearchChange={handleSearchChange}
                onAdd={() => setOpen(true)}
                saving={saving}
            />

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
                canEdit={(user) => canEditEmployee(currentUser, user)}
            />

            <PermissionGuard
                module={USERS_PERMISSION_MODULE}
                action="write"
                fallback={<></>}
            >
                <Fab
                    color="primary"
                    aria-label="add user"
                    onClick={() => setOpen(true)}
                    disabled={saving}
                    sx={{
                        position: "fixed",
                        bottom: FAB_POSITION.bottom,
                        right: FAB_POSITION.right,
                        background: GRADIENTS.button,
                        display: { xs: "flex", md: "none" },
                        zIndex: FAB_POSITION.zIndex,
                        boxShadow: 3,
                        "&:hover": { background: GRADIENTS.buttonHover },
                    }}
                >
                    {saving ? (
                        <CircularProgress size={24} color="inherit" />
                    ) : (
                        <AddIcon />
                    )}
                </Fab>

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
                        saving={saving}
                        onClose={handleCloseDialog}
                        onSave={handleUserSave}
                    />
                )}
            </PermissionGuard>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={(_, reason) =>
                    reason !== "clickaway" && setSnackbarOpen(false)
                }
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity={snackbarSeverity}
                    variant="filled"
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default UsersPage;
