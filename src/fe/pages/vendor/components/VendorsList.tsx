import React from "react";
import VendorCard from "@/fe/pages/vendor/components/VendorCard";
import VendorsSkeleton from "@/fe/pages/vendor/components/VendorsSkeleton";
import EmptyState from "@/fe/pages/vendor/components/EmptyState";
import { VENDORS_ROWS_PER_PAGE_OPTIONS } from "@/fe/pages/vendor/constants/vendors";
import type { VendorsListProps } from "@/fe/pages/vendor/types";
import dynamic from "next/dynamic";
import { Box } from "@/components/ui/Component";
import { MODULE_STYLES } from "@/styles/moduleStyles";

const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
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
  if (loading) return <VendorsSkeleton rows={rowsPerPage || 10} />;

  return (
    <>
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {vendors.length === 0 ? (
          <EmptyState />
        ) : (
          <Box sx={MODULE_STYLES.vendors.cardsGrid}>
            {vendors.map((vendor) => (
              <VendorCard
                key={vendor._id}
                vendor={vendor}
                onEdit={() => onEditVendor(vendor)}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={MODULE_STYLES.vendors.paginationWrapper}>
        <Pagination
          page={page}
          pageSize={rowsPerPage ?? 10}
          total={totalItems}
          onPageChange={onPageChange}
          pageSizeOptions={[...VENDORS_ROWS_PER_PAGE_OPTIONS]}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </>
  );
};

export default VendorsList;


