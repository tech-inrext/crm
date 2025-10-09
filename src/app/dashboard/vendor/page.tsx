"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import dynamic from "next/dynamic";

import { useVendors } from "@/hooks/useVendors";
import PermissionGuard from "@/components/ui/permission/PermissionGuard";
import VendorDialog from "@/components/ui/dialogs/VendorDialog";
import VendorsActionBar from "@/components/ui/actions/VendorsActionBar";
import VendorCard from "@/components/ui/cards/VendorCard";

import {
  DEFAULT_VENDOR_FORM,
  VENDORS_ROWS_PER_PAGE_OPTIONS,
  SEARCH_DEBOUNCE_DELAY,
  VENDORS_PERMISSION_MODULE,
} from "@/constants/vendors";
import { useDebounce } from "@/hooks/useDebounce";

// Your Pagination component expects: page, pageSize, total, onPageChange, onPageSizeChange, pageSizeOptions
const Pagination = dynamic(() => import("@/components/ui/Navigation/Pagination"), {
  ssr: false,
});

const Vendors: React.FC = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

  // Pagination state (1-based)
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    VENDORS_ROWS_PER_PAGE_OPTIONS[0]
  );

  // Hook fetches with ?page=&limit=&search=&isCabVendor=true
  const {
    employees, // current page of vendors
    loading,
    totalItems, // total vendors count from API
    saving,
    setOpen,
    open,
    editId,
    setEditId,
    addVendor,
    updateVendor,
  } = useVendors(debouncedSearch, page, rowsPerPage);

  // Reset to first page when search or page size changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, rowsPerPage]);

  // Clamp page if totals shrink to avoid landing on an empty page
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
    if (page > totalPages) setPage(totalPages);
  }, [totalItems, rowsPerPage, page]);

  const handlePageSizeChange = (size: number) => {
    setRowsPerPage(size);
    setPage(1);
  };

  return (
    <PermissionGuard module={VENDORS_PERMISSION_MODULE}>
      <Box sx={{ p: { xs: 1, md: 3 }, width: "100%" }}>
        <VendorsActionBar
          search={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          onAdd={() => setOpen(true)}
          saving={saving}
        />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : employees.length === 0 ? (
          <Typography variant="body1" sx={{ mt: 4, textAlign: "center" }}>
            No vendors found.
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
            {employees.map((vendor) => (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                onEdit={() => setEditId(vendor._id!)}
              />
            ))}
          </Box>
        )}

        <Pagination
          page={page}
          pageSize={rowsPerPage}
          total={totalItems}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={VENDORS_ROWS_PER_PAGE_OPTIONS}
        />

        <VendorDialog
          open={open}
          editId={editId}
          initialData={DEFAULT_VENDOR_FORM}
          saving={saving}
          onClose={() => {
            setOpen(false);
            setEditId(null);
          }}
          onSave={async (values) => {
            // Ensure dialog closes after successful save (add or edit).
            try {
              if (editId) {
                // updateVendor expects (vendorId, data)
                await updateVendor(editId, values as any);
                setEditId(null);
              } else {
                await addVendor(values as any);
              }
              setOpen(false);
            } catch (err) {
              // rethrow so VendorDialog/Formik can handle submission errors
              throw err;
            }
          }}
        />
      </Box>
    </PermissionGuard>
  );
};

export default Vendors;
