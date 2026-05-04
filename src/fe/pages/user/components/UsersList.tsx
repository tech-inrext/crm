import React from "react";
import type { UsersListProps, Employee } from "@/fe/pages/user/types";
import UserCard from "@/fe/pages/user/components/UserCard";
import UsersSkeleton from "@/fe/pages/user/components/UsersSkeleton";
import dynamic from "next/dynamic";
import EmptyState from "@/fe/pages/user/components/EmptyState";
import { useUserDialogData } from "@/fe/pages/user/hooks/useUserDialogData";

import Pagination from "@/components/ui/Navigation/Pagination";


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

  const paginationBar = (
    <div className=" py-4">
      <Pagination
        page={page}
        pageSize={rowsPerPage ?? 8}
        total={totalItems}
        onPageChange={onPageChange}
        pageSizeOptions={[4, 8, 12]}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pb-4">
        {loading || !employees ? (
          <UsersSkeleton rows={rowsPerPage || 10} />
        ) : employeeList.length === 0 ? (
          <EmptyState />
        ) : (
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
        )}
      </div>
      <div className="flex-shrink-0 border-t border-gray-100 backdrop-blur-sm z-10">
        {paginationBar}
      </div>
    </div>
  );
};

export default UsersList;
