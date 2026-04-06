"use client";

import React from "react";
import { Box, CircularProgress, Typography } from "@/components/ui/Component";
import dynamic from "next/dynamic";
import VendorCard from "@/fe/pages/vendor/components/VendorCard";
import { VENDORS_ROWS_PER_PAGE_OPTIONS } from "@/fe/pages/vendor/constants/vendors";
import type { VendorsListProps } from "@/fe/pages/vendor/types";

const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  {
    ssr: false,
  },
);

const VendorsList: React.FC<VendorsListProps> = ({
  loading,
  vendors,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onEditVendor,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (vendors.length === 0) {
    return (
      <Typography variant="body1" sx={{ mt: 4, textAlign: "center" }}>
        No vendors found.
      </Typography>
    );
  }

  return (
    <>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor._id}
            vendor={vendor}
            onEdit={() => onEditVendor(vendor)}
          />
        ))}
      </Box>

      <Pagination
        page={page}
        pageSize={rowsPerPage}
        total={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={VENDORS_ROWS_PER_PAGE_OPTIONS}
      />
    </>
  );
};

export default VendorsList;
