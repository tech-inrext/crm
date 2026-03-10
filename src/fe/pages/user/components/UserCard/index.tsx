import React from "react";
import { EditIcon, PermissionGuard, Button } from "@/components/ui";
import { USERS_PERMISSION_MODULE } from "@/fe/pages/user/constants/users";
import type { UserCardProps } from "@/fe/pages/user/types";

const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
  const initial = user.name?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="w-full rounded-xl p-3 flex items-center gap-3 min-w-0 bg-gradient-to-br from-[#fafdff] to-[#f1f5fa] shadow-md">
      {user.avatarUrl ? (
        <img
          src={user.avatarUrl}
          alt={user.name}
          className="w-14 h-14 rounded-full object-cover"
        />
      ) : (
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl bg-blue-600 text-white shadow">
          {initial}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-0.5">
          <p className="text-base sm:text-lg font-extrabold leading-tight truncate">
            {user.name}
          </p>
          <p className="text-sm text-gray-500 truncate">{user.email}</p>
          {user.designation && (
            <p className="text-xs sm:text-sm text-blue-600 font-semibold truncate">
              {user.designation}
            </p>
          )}
        </div>
      </div>

      {onEdit && (
        <PermissionGuard
          module={USERS_PERMISSION_MODULE}
          action="write"
          fallback={null}
        >
          <Button
            variant="text"
            size="small"
            onClick={onEdit}
            aria-label="edit user"
            sx={{ ml: 1, color: "#2563eb", "&:hover": { color: "#1d4ed8" } }}
          >
            <EditIcon fontSize="small" />
          </Button>
        </PermissionGuard>
      )}
    </div>
  );
};

export default UserCard;
