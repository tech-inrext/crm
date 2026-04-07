"use client";

import React from "react";
import PermissionGuard from "@/components/PermissionGuard";
import VendorsPageActionBar from "@/fe/pages/vendor/components/VendorsPageActionBar";
import VendorsList from "@/fe/pages/vendor/components/VendorsList";
import VendorDialog from "@/fe/pages/vendor/components/VendorDialog";
import useVendorsPage from "@/fe/pages/vendor/hooks/useVendorsPage";
import {
  VENDORS_PERMISSION_MODULE,
  FAB_POSITION,
  GRADIENTS,
} from "@/fe/pages/vendor/constants/vendors";
import { getInitialVendorForm } from "@/fe/pages/vendor/utils";
import { AddIcon } from "@/components/ui/Component";

const VendorsPage: React.FC = () => {
  const {
    search,
    handleSearchChange,
    open,
    setOpen,
    editId,
    selectedVendor,
    handleCloseDialog,
    openEditDialog,
    vendors,
    loading,
    page,
    rowsPerPage,
    totalItems,
    setPage,
    handlePageSizeChange,
    handleMutationSuccess,
  } = useVendorsPage();

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
      </div>
    </PermissionGuard>
  );
};

export default VendorsPage;
