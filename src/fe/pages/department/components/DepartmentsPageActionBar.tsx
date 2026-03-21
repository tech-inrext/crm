"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { CircularProgress, Add } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  DEPARTMENTS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/department/constants/departments";
import type { DepartmentsActionBarProps } from "@/fe/pages/department/types";

const DepartmentsPageActionBar: React.FC<DepartmentsActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  return (
    <PageHeader title="Departments">
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
            module={DEPARTMENTS_PERMISSION_MODULE}
            action="write"
            fallback={<></>}
          >
            <button
              type="button"
              onClick={onAdd}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-4 py-2 min-w-[180px] h-10 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-transform disabled:opacity-60"
            >
              {saving ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <>
                  <Add />
                  <span>Add Department</span>
                </>
              )}
            </button>
          </PermissionGuard>
        </div>
      </div>
    </PageHeader>
  );
};

export default DepartmentsPageActionBar;
