import React from "react";
import type {
  DepartmentsListProps,
  Department,
} from "@/fe/pages/department/types";
import DepartmentCard from "@/fe/pages/department/components/DepartmentCard";
import dynamic from "next/dynamic";
import { useGetDepartmentsQuery } from "@/fe/pages/department/departmentApi";

const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-16">
    <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg
      className="w-12 h-12 mb-3 opacity-40"
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
    </svg>
    <p className="text-sm font-medium">No departments found</p>
    <p className="text-xs mt-1 opacity-60">
      Try adjusting your search or add a new department
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const DepartmentsList: React.FC<DepartmentsListProps> = ({
  search = "",
  onEditDepartment,
}) => {
  const {
    data,
    loading,
    page,
    rowsPerPage,
    goToPage,
    setPageSize: setRowsPerPage,
  } = useGetDepartmentsQuery({ search });

  const departments: Department[] = Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray(data)
      ? (data as Department[])
      : [];
  const totalItems =
    (data as any)?.pagination?.totalItems ?? departments.length;

  if (loading) return <LoadingSpinner />;
  if (departments.length === 0) return <EmptyState />;

  const paginationBar = (
    <div className="flex justify-center mt-4">
      <Pagination
        page={page}
        pageSize={rowsPerPage ?? 10}
        total={totalItems}
        onPageChange={goToPage}
        onPageSizeChange={setRowsPerPage}
      />
    </div>
  );

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-2">
        {departments.map((dept: Department) => (
          <DepartmentCard
            key={dept.id ?? dept._id}
            department={dept}
            onEdit={() => onEditDepartment(dept)}
          />
        ))}
      </div>
      {paginationBar}
    </div>
  );
};

export default DepartmentsList;
