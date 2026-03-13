import React from "react";
import {
  USERS_TABLE_HEADER,
  USERS_PERMISSION_MODULE,
} from "@/fe/pages/user/constants/users";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import PermissionGuard from "@/components/PermissionGuard";
import type { Employee, TableHeaderItem } from "@/fe/pages/user/types";
import { IconButton } from "@/components/ui";

interface GetUsersTableHeaderProps {
  canEditEmployee: (user: Employee) => boolean;
  onView: (user: Employee) => void;
  onEdit: (user: Employee) => void;
}

export function getUsersTableHeader({
  canEditEmployee,
  onView,
  onEdit,
}: GetUsersTableHeaderProps): TableHeaderItem[] {
  return USERS_TABLE_HEADER.map((header) =>
    header.label === "Actions"
      ? {
          ...header,
          component: (row: Employee) => (
            <div className="flex items-center gap-1">
              {/* View */}
              <IconButton
                size="small"
                onClick={() => onView(row)}
                aria-label="View user"
                className="text-blue-500 hover:bg-blue-50"
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>

              {/* Edit – only if permitted */}
              {canEditEmployee(row) && (
                <PermissionGuard
                  module={USERS_PERMISSION_MODULE}
                  action="write"
                  fallback={null}
                >
                  <IconButton
                    size="small"
                    onClick={() => onEdit(row)}
                    aria-label="Edit user"
                    className="text-gray-500 hover:bg-gray-100"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </PermissionGuard>
              )}
            </div>
          ),
        }
      : header,
  );
}
