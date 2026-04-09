import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import dynamic from "next/dynamic";
import VendorCard from "@/fe/pages/vendor/components/VendorCard";
import VendorsSkeleton from "@/fe/pages/vendor/components/VendorsSkeleton";
import EmptyState from "@/fe/pages/vendor/components/EmptyState";
import * as styles from "./styles";
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
    return <VendorsSkeleton rows={rowsPerPage} />;
  }

  if (vendors.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <Box sx={styles.vendorsGridSx}>
        {vendors.map((vendor) => (
          <VendorCard
            key={vendor._id}
            vendor={vendor}
            onEdit={() => onEditVendor(vendor)}
          />
        ))}
      </Box>

      <Box sx={styles.paginationContainerSx}>
        <Pagination
          page={page}
          pageSize={rowsPerPage}
          total={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSizeOptions={VENDORS_ROWS_PER_PAGE_OPTIONS}
        />
      </Box>
    </>
  );
};

export default VendorsList;

