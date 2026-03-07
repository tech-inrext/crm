import React, { useState } from "react";
import type {
  UsersListProps,
  Employee,
  PaginatedResponse,
} from "@/fe/pages/user/types";
import UserCard from "@/fe/pages/user/components/UserCard";
import dynamic from "next/dynamic";
import { useGetUsersQuery, useGetUserByIdQuery } from "@/fe/pages/user/userApi";
import { debounce } from "@mui/material";

const TableMap = dynamic(() => import("@/components/ui/table/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-16">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
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
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
    <p className="text-sm font-medium">No users found</p>
    <p className="text-xs mt-1 opacity-60">
      Try adjusting your search or add a new user
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Search = (onSearch) => {
  const [searchKey, setSearchKey] = useState("");

  const handleChange = (value) => {
    setSearchKey(value);
  };

  return (
    <input value={searchKey} onChange={(e) => handleChange(e.target.value)} />
  );
};

export const UsersList: React.FC<UsersListProps> = ({
  isMobile,
  isClient,
  windowWidth,
  search = "",
  usersTableHeader,
  onEditUser,
  canEdit,
}) => {
  const [filters, setFilters] = React.useState({
    search: search,
    isCabAdmin: false,
  });

  // Update filters when search prop changes
  React.useEffect(() => {
    setFilters((prev) => ({ ...prev, search }));
  }, [search]);

  const handleFilter = (key, value) => {
    const newFilter = { ...filters, [key]: value };
    setFilters(newFilter);
  };

  const {
    data: employees,
    loading,
    page,
    rowsPerPage,
    goToPage,
    setPage,
    setRowsPerPage,
    refetch,
  } = useGetUsersQuery(filters);

  const { data: user } = useGetUserByIdQuery({
    id: "699df4c0de3bfbc734e8491e",
  });

  const employeeList = employees?.data || [];
  const totalItems = employees?.pagination?.totalItems ?? 0;

  if (loading) return <LoadingSpinner />;
  if (employeeList.length === 0) return <EmptyState />;

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

  if (isMobile) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-3 mb-2">
          {employeeList.map((user: Employee) => (
            <UserCard
              key={user.id ?? user._id}
              user={{
                name: user.name,
                email: user.email,
                designation: user.designation,
                avatarUrl: user.avatarUrl,
              }}
              onEdit={canEdit(user) ? () => onEditUser(user) : undefined}
            />
          ))}
        </div>
        {paginationBar}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-xl overflow-hidden shadow-lg bg-white">
        <TableMap
          data={employeeList}
          header={usersTableHeader}
          onEdit={() => {}}
          onDelete={() => {}}
          size={isClient && windowWidth < 600 ? "small" : "medium"}
          stickyHeader
        />
      </div>
      {paginationBar}
    </div>
  );
};

export default UsersList;
