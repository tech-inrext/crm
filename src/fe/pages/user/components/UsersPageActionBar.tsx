"use client";

import React from "react";
import PageHeader from "@/fe/framework/components/PageHeader";
import { Button, Add } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  USERS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/user/constants/users";

interface Props {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  showAllEmployees?: boolean;
  onToggleAllEmployees?: () => void;
  isSystemAdmin?: boolean;
}

const UsersPageActionBar: React.FC<Props> = ({
  search,
  onSearchChange,
  onAdd,
  showAllEmployees,
  onToggleAllEmployees,
  isSystemAdmin,
}) => {
  return (
    <PageHeader title="Users">
      <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
        <div className="w-full md:w-auto flex-1">
          <SearchBar
            className="w-full min-w-[280px]"
            value={search}
            onChange={onSearchChange}
            placeholder={SEARCH_PLACEHOLDER}
          />
        </div>

        {/* All Employees toggle – system admin only */}
        {isSystemAdmin && (
          <Button
            variant={showAllEmployees ? "contained" : "outlined"}
            color="primary"
            onClick={onToggleAllEmployees}
            className="hidden md:flex"
            sx={{ minWidth: 150, textTransform: "none", fontWeight: 600 }}
          >
            {showAllEmployees ? "My Team" : "All Employees"}
          </Button>
        )}

        <div className="hidden md:block">
          <PermissionGuard
            module={USERS_PERMISSION_MODULE}
            action="write"
            fallback={<></>}
          >
            <button
              type="button"
              onClick={onAdd}
              className="flex items-center justify-center gap-2 px-4 py-2 min-w-[150px] h-10 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-transform"
            >
              <Add />
              <span>Add User</span>
            </button>
          </PermissionGuard>
        </div>
      </div>
    </PageHeader>
  );
};

export default UsersPageActionBar;
