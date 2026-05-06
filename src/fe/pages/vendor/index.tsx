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
import { Box, AddIcon, Fab } from "@/components/ui/Component";
import { MODULE_STYLES } from "@/styles/moduleStyles";

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
    setPageSize,
    handleMutationSuccess,
  } = useVendorsPage();

  return (
    <PermissionGuard module={VENDORS_PERMISSION_MODULE}>
      <Box sx={MODULE_STYLES.vendors.vendorsContainer}>
        {/* Header Section */}
        <Box sx={{ flexShrink: 0, mb: 0.5 }}>
          <VendorsPageActionBar
            search={search}
            onSearchChange={handleSearchChange}
            onAdd={() => setOpen(true)}
          />
        </Box>

        {/* Content Section */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <VendorsList
            loading={loading}
            vendors={vendors}
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            onEditVendor={openEditDialog}
          />
        </Box>

        {/* Mobile FAB */}
        <PermissionGuard
          module={VENDORS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Fab
            aria-label="Add vendor"
            onClick={() => setOpen(true)}
            sx={{
              position: "fixed",
              bottom: FAB_POSITION.bottom,
              right: FAB_POSITION.right,
              zIndex: FAB_POSITION.zIndex,
              background: GRADIENTS.button,
              color: "white",
              display: { md: "none" },
              "&:active": {
                transform: "scale(0.95)",
              },
            }}
          >
            <AddIcon />
          </Fab>
        </PermissionGuard>

        <VendorDialog
          open={open}
          editId={editId}
          initialData={getInitialVendorForm(selectedVendor)}
          onClose={handleCloseDialog}
          onSave={handleMutationSuccess}
        />
      </Box>
    </PermissionGuard>
  );
};

export default VendorsPage;
