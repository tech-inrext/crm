import React from "react";
import {
  DEPARTMENTS_ROWS_PER_PAGE_OPTIONS,
} from "@/fe/pages/department/constants/departments";
import type {
  DepartmentsListProps,
  Department,
} from "@/fe/pages/department/types";
import DepartmentCard from "@/fe/pages/department/components/DepartmentCard";
import dynamic from "next/dynamic";
import { useGetDepartmentsQuery } from "@/fe/pages/department/departmentApi";
import { Box, CircularProgress } from "@/components/ui/Component";
import { MODULE_STYLES } from "@/styles/moduleStyles";

const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);


// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner: React.FC = () => (
  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
    <CircularProgress />
  </Box>
);

const EmptyState: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      itemsCenter: "center",
      justifyContent: "center",
      py: 8,
      color: "text.secondary",
      textAlign: "center",
    }}
  >
    <Box
      component="svg"
      sx={{
        width: 48,
        height: 48,
        mb: 2,
        opacity: 0.4,
        mx: "auto",
      }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </Box>
    <Box component="p" sx={{ fontSize: "0.875rem", fontWeight: 500 }}>No departments found</Box>
    <Box component="p" sx={{ fontSize: "0.75rem", mt: 1, opacity: 0.6 }}>
      Try adjusting your search or add a new department
    </Box>
  </Box>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const DepartmentsList: React.FC<DepartmentsListProps> = ({
  loading,
  departments,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onEditDepartment,
}) => {
  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {departments.length === 0 ? (
          <EmptyState />
        ) : (
          <Box sx={MODULE_STYLES.departments.cardsGrid}>
            {departments.map((dept: Department) => (
              <DepartmentCard
                key={dept.id ?? dept._id}
                department={dept}
                onEdit={() => onEditDepartment(dept)}
              />
            ))}
          </Box>
        )}
      </Box>

      <Box sx={MODULE_STYLES.departments.paginationWrapper}>
        <Pagination
          page={page}
          pageSize={rowsPerPage ?? 10}
          total={totalItems}
          onPageChange={onPageChange}
          pageSizeOptions={[...DEPARTMENTS_ROWS_PER_PAGE_OPTIONS]}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </>
  );
};

export default DepartmentsList;
