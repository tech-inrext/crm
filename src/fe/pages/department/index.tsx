"use client";

import React from "react";
import { AddIcon, CircularProgress } from "@/components/ui/Component";
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
} from "@/fe/pages/department/constants/departments";
import type { TostProps } from "@/fe/pages/department/types";

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
    saving,
    setOpen,
    open,
    editId,
    selectedDepartment,
    handleCloseDialog,
    openEditDialog,
    search,
    handleSearchChange,
    snackbarOpen,
    snackbarSeverity,
    snackbarMessage,
    setSnackbarOpen,
    handleDepartmentSave,
  } = useDepartmentsPage();

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

  return (
    <div className="p-4 sm:p-6">
      {/* Header + search/add bar */}
      <DepartmentsPageActionBar
        search={search}
        onSearchChange={handleSearchChange}
        onAdd={() => setOpen(true)}
        saving={saving}
      />

      {/* Card list */}
      <div className="mt-2">
        <DepartmentsList search={search} onEditDepartment={openEditDialog} />
      </div>

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
          disabled={saving}
          style={{
            bottom: FAB_POSITION.bottom,
            right: FAB_POSITION.right,
            zIndex: FAB_POSITION.zIndex,
            background: GRADIENTS.button,
          }}
          className="fixed md:hidden flex items-center justify-center w-14 h-14 rounded-full text-white shadow-xl transition-transform active:scale-95 disabled:opacity-60"
        >
          {saving ? (
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
          saving={saving}
          onClose={handleCloseDialog}
          onSave={handleDepartmentSave}
        />
      </PermissionGuard>

      {/* Snackbar / Toast */}
      <Toast
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={() => setSnackbarOpen(false)}
      />
    </div>
  );
};

export default DepartmentsPage;
