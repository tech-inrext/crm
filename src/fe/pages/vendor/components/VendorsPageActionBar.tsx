"use client";

import React from "react";
import { PageHeader } from "@/fe/framework";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  VENDORS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/vendor/constants/vendors";
import type { VendorsPageActionBarProps } from "@/fe/pages/vendor/types";

const VendorsPageActionBar: React.FC<VendorsPageActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving = false,
}) => {
  return (
    <PageHeader title="Vendors" subtitle="Manage cab vendors">
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            placeholder={SEARCH_PLACEHOLDER}
            sx={{ width: "100%", minWidth: 280 }}
          />
        </div>

        <PermissionGuard
          module={VENDORS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <button
            type="button"
            onClick={onAdd}
            disabled={saving}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            + Add Vendor
          </button>
        </PermissionGuard>
      </div>
    </PageHeader>
  );
};

export default VendorsPageActionBar;
