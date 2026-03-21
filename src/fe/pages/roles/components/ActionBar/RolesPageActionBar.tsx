"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Add, Button, Box, PermissionGuard } from "@/components/ui/Component";
import SearchBar from "@/components/ui/search/SearchBar";
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
      <Box sx={{ width: "100%", maxWidth: "600px", flexGrow: 1 }}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>

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
    </PageHeader>
  );
};

export default RolesPageActionBar;
