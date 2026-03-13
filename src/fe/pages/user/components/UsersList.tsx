import React from "react";
import type { UsersListProps, Employee } from "@/fe/pages/user/types";
import UserCard from "@/fe/pages/user/components/UserCard";
import UsersSkeleton from "@/fe/pages/user/components/UsersSkeleton";
import dynamic from "next/dynamic";
import People from "@/components/ui/Component/People";

const TableMap = dynamic(() => import("@/components/ui/table/TableMap"), {
  ssr: false,
});
const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

// ─── Sub-components ───────────────────────────────────────────────────────────

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <People className="w-12 h-12 mb-3 opacity-40" />
    <p className="text-sm font-medium">No users found</p>
    <p className="text-xs mt-1 opacity-60">
      Try adjusting your search or add a new user
    </p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const UsersList: React.FC<UsersListProps> = ({
  loading,
  employees,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
  isMobile,
  isClient,
  windowWidth,
  usersTableHeader,
  onEditUser,
  canEdit,
}) => {
  const employeeList = employees || [];

  // Show skeleton while loading OR if employees hasn't been populated yet
  if (loading || !employees) {
    return <UsersSkeleton isMobile={isMobile} rows={rowsPerPage || 10} />;
  }

  if (employeeList.length === 0) return <EmptyState />;

  const paginationBar = (
    <div className="flex justify-center mt-4">
      <Pagination
        page={page}
        pageSize={rowsPerPage ?? 10}
        total={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
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
