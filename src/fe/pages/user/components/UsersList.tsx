import React from "react";
import type { UsersListProps, Employee } from "@/fe/pages/user/types";
import UserCard from "@/fe/pages/user/components/UserCard";
import UsersSkeleton from "@/fe/pages/user/components/UsersSkeleton";
import dynamic from "next/dynamic";
import People from "@/components/ui/Component/People";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";

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
  onEditUser,
  onViewUser,
  canEdit,
}) => {
  const { managers, departments } = useUserDialogData(true);
  const employeeList = employees || [];

  // Show skeleton while loading OR if employees hasn't been populated yet
  if (loading || !employees) {
    return <UsersSkeleton rows={rowsPerPage || 10} />;
  }

  if (employeeList.length === 0) return <EmptyState />;

  const paginationBar = (
    <div className="flex justify-center mt-8">
      <Pagination
        page={page}
        pageSize={rowsPerPage ?? 10}
        total={totalItems}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employeeList.map((user: Employee) => (
          <UserCard
            key={user.id ?? user._id}
            user={{
              name: user.name,
              email: user.email,
              designation: user.designation,
              avatarUrl: user.avatarUrl,
              photo: (user as any).photo,
              phone: user.phone,
              managerId: user.managerId,
              departmentId: user.departmentId,
              managerName: (user as any).managerName,
              departmentName: (user as any).departmentName,
            }}
            onEdit={canEdit(user) ? () => onEditUser(user) : undefined}
            onView={() => onViewUser(user)}
            managers={managers}
            departments={departments}
          />
        ))}
      </div>
      {paginationBar}
    </div>
  );
};

export default UsersList;
