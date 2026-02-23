import React from "react";
import { CircularProgress, Add } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  USERS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/modules/user/constants/users";

import type { UsersActionBarProps } from "@/fe/modules/user/types";

const UsersActionBar: React.FC<UsersActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
      <div className="w-full md:w-auto flex-1">
        <SearchBar
          className="w-full min-w-[280px]"
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </div>

      <div className="hidden md:block">
        <PermissionGuard
          module={USERS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <button
            type="button"
            onClick={onAdd}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2 min-w-[150px] h-10 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-transform disabled:opacity-60"
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <>
                <Add />
                <span>Add User</span>
              </>
            )}
          </button>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default UsersActionBar;
