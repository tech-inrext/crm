"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Fab,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Button,
  TableContainer,
} from "@mui/material";
import { Add, Edit } from "@mui/icons-material";
import dynamic from "next/dynamic";
import { useVendors } from "@/hooks/useVendors";
import PermissionGuard from "@/components/PermissionGuard";
import VendorDialog from "@/components/ui/VendorDialog";
import VendorsActionBar from "@/components/ui/VendorsActionBar";
import VendorCard from "@/components/ui/VendorCard";
import {
  GRADIENTS,
  COMMON_STYLES,
  DEFAULT_VENDOR_FORM,
  VENDORS_TABLE_HEADER,
  VENDORS_ROWS_PER_PAGE_OPTIONS,
  SEARCH_DEBOUNCE_DELAY,
  FAB_POSITION,
  VENDORS_PERMISSION_MODULE,
} from "@/constants/vendors";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import { useDebounce } from "@/hooks/useDebounce";

const TableMap = dynamic(() => import("@/components/ui/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(() => import("@/components/ui/Pagination"), {
  ssr: false,
});

const Vendors: React.FC = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(
    VENDORS_ROWS_PER_PAGE_OPTIONS[0]
  );
  const {
    employees,
    loading,
    totalItems,
    saving,
    setOpen,
    open,
    editId,
    setEditId,
    addVendor,
    updateVendor,
    setForm,
    // ...other vendor logic
  } = useVendors(debouncedSearch, page, rowsPerPage);

  // ...rest of the logic, UI, and handlers

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
                onEdit={() => setEditId(vendor._id)}
              />
            ))}
          </Box>
        )}
        <Pagination
          page={page}
          count={Math.ceil(totalItems / rowsPerPage)}
          onChange={(_, value) => setPage(value)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(Number(e.target.value))}
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
          onSave={editId ? updateVendor : addVendor}
        />
      </Box>
    </PermissionGuard>
  );
};

export default Vendors;
