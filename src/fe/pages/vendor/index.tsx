"use client";

import React, { useCallback, useEffect } from "react";
import PermissionGuard from "@/components/PermissionGuard";
import VendorsPageActionBar from "@/fe/pages/vendor/components/VendorsPageActionBar";
import VendorsList from "@/fe/pages/vendor/components/VendorsList";
import VendorDialog from "@/fe/pages/vendor/components/dialog/vendorDialog";
import useVendorsPage from "@/fe/pages/vendor/hooks/useVendorsPage";
import { useGetVendorsQuery } from "@/fe/pages/vendor/vendorApi";
import { invalidateQueryCache } from "@/fe/hooks/createApi";
import {
  VENDORS_PERMISSION_MODULE,
  FAB_POSITION,
  GRADIENTS,
} from "@/fe/pages/vendor/constants/vendors";
import { getInitialVendorForm } from "@/fe/pages/vendor/utils";
import type { ToastProps } from "@/fe/pages/vendor/types";
import { AddIcon } from "@/components/ui/Component";

const Toast: React.FC<ToastProps> = ({ open, message, severity, onClose }) => {
  if (!open) return null;
  const colourClass =
    severity === "success"
      ? "bg-green-600 text-white"
      : "bg-red-600 text-white";
  return (
    <div
      role="alert"
      className={`fixed top-4 right-4 z-1400 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all ${colourClass}`}
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

const VendorsPage: React.FC = () => {
  const {
    search,
    debouncedSearch,
    handleSearchChange,
    open,
    setOpen,
    editId,
    selectedVendor,
    handleCloseDialog,
    openEditDialog,
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    setSnackbarMessage,
    snackbarSeverity,
    setSnackbarSeverity,
  } = useVendorsPage();

  const {
    items: vendors,
    loading,
    page,
    rowsPerPage,
    totalItems,
    refetch,
    setPage,
    setPageSize,
  } = useGetVendorsQuery({ search: debouncedSearch, isCabVendor: true });

  // Reset to page 1 when search changes
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
    setSnackbarMessage("Vendor saved successfully!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setTimeout(() => setSnackbarOpen(false), 3000);
  }, [
    refetch,
    handleCloseDialog,
    setSnackbarMessage,
    setSnackbarSeverity,
    setSnackbarOpen,
  ]);

  return (
    <PermissionGuard module={VENDORS_PERMISSION_MODULE}>
      <div className="p-4 sm:p-6">
        <VendorsPageActionBar
          search={search}
          onSearchChange={handleSearchChange}
          onAdd={() => setOpen(true)}
        />

        <VendorsList
          loading={loading}
          vendors={vendors}
          page={page}
          rowsPerPage={rowsPerPage}
          totalItems={totalItems}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          onEditVendor={openEditDialog}
        />

        {/* Mobile FAB */}
        <PermissionGuard
          module={VENDORS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <button
            type="button"
            aria-label="Add vendor"
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
        </PermissionGuard>

        <VendorDialog
          open={open}
          editId={editId}
          initialData={getInitialVendorForm(selectedVendor)}
          onClose={handleCloseDialog}
          onSave={handleMutationSuccess}
        />

        <Toast
          open={snackbarOpen}
          message={snackbarMessage}
          severity={snackbarSeverity}
          onClose={() => setSnackbarOpen(false)}
        />
      </div>
    </PermissionGuard>
  );
};

export default VendorsPage;
