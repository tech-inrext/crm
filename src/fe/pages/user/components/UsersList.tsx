import React from "react";
import type { UsersListProps, Employee } from "@/fe/pages/user/types";
import UserCard from "@/fe/pages/user/components/UserCard";
import { USERS_ROWS_PER_PAGE_OPTIONS } from "@/fe/pages/user/constants/users";
import dynamic from "next/dynamic";

const TableMap = dynamic(() => import("@/components/ui/table/TableMap"), { ssr: false });
const Pagination = dynamic(() => import("@/components/ui/Navigation/Pagination"), { ssr: false });

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-16">
    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
    <p className="text-sm font-medium">No users found</p>
    <p className="text-xs mt-1 opacity-60">Try adjusting your search or add a new user</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const UsersList: React.FC<UsersListProps> = ({
  loading,
  employees,
  isMobile,
  isClient,
  windowWidth,
  page,
  rowsPerPage,
  totalItems,
  usersTableHeader,
  onPageChange,
  onPageSizeChange,
  onEditUser,
  canEdit,
}) => {
  if (loading) return <LoadingSpinner />;
  if (employees.length === 0) return <EmptyState />;

  const paginationBar = (
    <div className="flex justify-end mt-4">
      <Pagination
        page={page}
        pageSize={rowsPerPage}
        total={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        pageSizeOptions={[...USERS_ROWS_PER_PAGE_OPTIONS]}
      />
    </div>
  );

  if (isMobile) {
    return (
      <div>
        <div className="grid grid-cols-1 gap-3 mb-2">
          {employees.map((user: Employee) => (
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
          data={employees}
          header={usersTableHeader}
          onEdit={() => { }}
          onDelete={() => { }}
          size={isClient && windowWidth < 600 ? "small" : "medium"}
          stickyHeader
        />
      </div>
      {paginationBar}
    </div>
  );
};

export default UsersList;
