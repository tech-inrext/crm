"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Add, Button } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  ROLES_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/roles/constants/roles";
import { addRoleButtonSx } from "@/fe/pages/roles/styles";
import { RolesPageActionBarProps } from "@/fe/pages/roles/types";

const RolesPageActionBar: React.FC<RolesPageActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
}) => {
  return (
    <PageHeader title="Roles">
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
            module={ROLES_PERMISSION_MODULE}
            action="write"
            fallback={<></>}
          >
            <Button
              variant="contained"
              onClick={onAdd}
              startIcon={<Add />}
              sx={addRoleButtonSx}
            >
              Add Role
            </Button>
          </PermissionGuard>
        </div>
      </div>
    </PageHeader>
  );
};

export default RolesPageActionBar;
