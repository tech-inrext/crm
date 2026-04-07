"use client";

import React from "react";
import { PageHeader } from "@/fe/framework";
import SearchBar from "@/components/ui/search/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  VENDORS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/vendor/constants/vendors";
import { Button, Box } from "@/components/ui/Component";
import * as styles from "./styles";
import type { VendorsPageActionBarProps } from "@/fe/pages/vendor/types";

const VendorsPageActionBar: React.FC<VendorsPageActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving = false,
}) => {
  return (
    <PageHeader title="Vendors" subtitle="Manage cab vendors">
      <Box sx={styles.searchBarSx}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>

      <PermissionGuard
        module={VENDORS_PERMISSION_MODULE}
        action="write"
        fallback={<></>}
      >
        <Button
          variant="contained"
          onClick={onAdd}
          disabled={saving}
          sx={{ display: { xs: "none", md: "inline-flex" } }}
        >
          + Add Vendor
        </Button>
      </PermissionGuard>
    </PageHeader>
  );
};

export default VendorsPageActionBar;