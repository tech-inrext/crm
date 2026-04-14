"use client";

import React from "react";
import PageHeader from "@/fe/components/PageHeader";
import { Add, Button, PermissionGuard, Box } from "@/components/ui";
import SearchBar from "@/components/ui/search/SearchBar";
import {
  USERS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/fe/pages/user/constants/users";
import { Props } from "@/fe/pages/user/types";

const UsersPageActionBar: React.FC<Props> = ({
  search,
  onSearchChange,
  onAdd,
  showAllEmployees,
  onToggleAllEmployees,
  isSystemAdmin,
}) => {
  return (
    <PageHeader title="Business Partners">
      <Box sx={{ width: "100%", maxWidth: "600px", flexGrow: 1 }}>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>

      {isSystemAdmin && (
        <Button
          variant={showAllEmployees ? "outlined" : "contained"}
          onClick={onToggleAllEmployees}
        >
          {showAllEmployees ? "My Team" : "All Employees"}
        </Button>
      )}

      <PermissionGuard
        module={USERS_PERMISSION_MODULE}
        action="write"
        fallback={<></>}
      >
        <Button variant="contained" onClick={onAdd} startIcon={<Add />}>
          Add User
        </Button>
      </PermissionGuard>
    </PageHeader>
  );
};

export default UsersPageActionBar;
