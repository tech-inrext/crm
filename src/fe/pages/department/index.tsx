"use client";

import React, { useCallback } from "react";
import useDepartmentsPage from "@/fe/pages/department/hooks/useDepartmentsPage";
import PermissionGuard from "@/components/PermissionGuard";
import DepartmentDialog from "@/fe/pages/department/components/dialog/departmentDialog";
import DepartmentsPageActionBar from "@/fe/pages/department/components/DepartmentsPageActionBar";
import { DepartmentsList } from "@/fe/pages/department/components/DepartmentsList";
import {
  GRADIENTS,
  FAB_POSITION,
  DEPARTMENTS_PERMISSION_MODULE,
  DEFAULT_DEPARTMENT_FORM,
  DEPARTMENTS_API_BASE,
  DEFAULT_PAGE_SIZE,
} from "@/fe/pages/department/constants/departments";
import type { TostProps } from "@/fe/pages/department/types";

import {
  useGetDepartmentsQuery,
} from "@/fe/pages/department/departmentApi";
import { invalidateQueryCache } from "@/fe/framework/hooks/createApi";
import { Box, Add as AddIcon, CircularProgress } from "@/components/ui/Component";
import { MODULE_STYLES } from "@/styles/moduleStyles";

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

const DepartmentsPage: React.FC = () => {
  const {
    open,
    setOpen,
    editId,
    selectedDepartment,
    handleCloseDialog,
    openEditDialog,
    search,
    handleSearchChange,
    debouncedSearch,
    snackbarOpen,
    snackbarSeverity,
    snackbarMessage,
    setSnackbarOpen,
    setSnackbarMessage,
    setSnackbarSeverity,
  } = useDepartmentsPage();

  const [rowsPerPageLocal, setRowsPerPageLocal] = React.useState(DEFAULT_PAGE_SIZE);

  const {
    data: departmentsData,
    loading,
    refetch,
    page,
    rowsPerPage,
    setPage,
    setPageSize,
  } = useGetDepartmentsQuery({ 
    search: debouncedSearch,
    limit: rowsPerPageLocal
  });

  const handlePageSizeChange = useCallback(
    (newSize: number) => {
      setRowsPerPageLocal(newSize);
      setPageSize(newSize);
      setPage(1);
    },
    [setPageSize, setPage],
  );

  const handleMutationSuccess = useCallback(async () => {
    invalidateQueryCache(DEPARTMENTS_API_BASE);
    await refetch();
    handleCloseDialog();
    setSnackbarMessage("Departments updated successfully");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 2000);
  }, [refetch, handleCloseDialog, setSnackbarMessage, setSnackbarOpen, setSnackbarSeverity]);

  const initialData = selectedDepartment
    ? {
        name: selectedDepartment.name ?? "",
        description: selectedDepartment.description ?? "",
        managerId:
          typeof selectedDepartment.managerId === "object" &&
          selectedDepartment.managerId !== null
            ? ((selectedDepartment.managerId as any)._id ?? "")
            : ((selectedDepartment.managerId as string) ?? ""),
        attachments: selectedDepartment.attachments ?? [],
      }
    : DEFAULT_DEPARTMENT_FORM;

  const departments: any[] = Array.isArray((departmentsData as any)?.data)
    ? (departmentsData as any).data
    : Array.isArray(departmentsData)
      ? (departmentsData as any[])
      : [];
  const totalItems =
    (departmentsData as any)?.pagination?.totalItems ?? departments.length;

  return (
    <PermissionGuard module={DEPARTMENTS_PERMISSION_MODULE}>
      <Box sx={MODULE_STYLES.departments.departmentsContainer}>
        {/* Header Section */}
        <Box sx={{ flexShrink: 0, mb: 0.5 }}>
          <DepartmentsPageActionBar
            search={search}
            onSearchChange={handleSearchChange}
            onAdd={() => setOpen(true)}
            saving={loading}
          />
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <DepartmentsList
            loading={loading}
            departments={departments}
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            onEditDepartment={openEditDialog}
          />
        </Box>

        {/* Floating action button – mobile only */}
        <PermissionGuard
          module={DEPARTMENTS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <button
            type="button"
            aria-label="Add department"
            onClick={() => setOpen(true)}
            disabled={loading}
            style={{
              bottom: FAB_POSITION.bottom,
              right: FAB_POSITION.right,
              zIndex: FAB_POSITION.zIndex,
              background: GRADIENTS.button,
            }}
            className="fixed md:hidden flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <AddIcon />
            )}
          </button>

          {/* Dialog */}
          <DepartmentDialog
            open={open}
            editId={editId}
            initialData={initialData}
            onClose={handleCloseDialog}
            onSave={handleMutationSuccess}
          />
        </PermissionGuard>

        {/* Snackbar / Toast */}
        <Toast
          open={snackbarOpen}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        />
      </Box>
    </PermissionGuard>
  );
};

export default DepartmentsPage;
