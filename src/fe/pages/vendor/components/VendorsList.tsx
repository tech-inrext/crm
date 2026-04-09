import React from "react";
import VendorCard from "@/fe/pages/vendor/components/VendorCard";
import VendorsSkeleton from "@/fe/pages/vendor/components/VendorsSkeleton";
import EmptyState from "@/fe/pages/vendor/components/EmptyState";
import * as styles from "./styles";
import { VENDORS_ROWS_PER_PAGE_OPTIONS } from "@/fe/pages/vendor/constants/vendors";
import type { VendorsListProps } from "@/fe/pages/vendor/types";
import dynamic from "next/dynamic";
import { Box } from "@/components/ui/Component";

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
    <div>
      {vendors.length === 0 ? (
        <EmptyState />
      ) : (
        <Box sx={styles.vendorsGridSx}>
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor._id}
              vendor={vendor}
              onEdit={() => onEditVendor(vendor)}
            />
          ))}
        </Box>
      )}

      {/* Pagination Bar */}
      <div className="flex justify-center mt-8">
        <Pagination
          page={page}
          pageSize={rowsPerPage ?? 10}
          total={totalItems}
          onPageChange={onPageChange}
          pageSizeOptions={[...VENDORS_ROWS_PER_PAGE_OPTIONS]}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </div>
  );
};

export default VendorsList;


