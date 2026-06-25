"use client";

import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import RoleCard from "./Card";
import RolesSkeleton from "@/fe/pages/roles/components/RolesSkeleton";
import EmptyState from "./EmptyState";
import dynamic from "next/dynamic";
import type { Role, RolesListProps } from "@/fe/pages/roles/types";
import { MODULE_STYLES } from "@/styles/moduleStyles";
import { ROLES_ROWS_PER_PAGE_OPTIONS } from "@/fe/pages/roles/constants/roles";

const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

const RolesList: React.FC<RolesListProps> = ({
  loading,
  roles,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
  onEditRole,
  onViewPermissions,
}) => {
  if (loading) return <RolesSkeleton count={rowsPerPage || 8} />;

  return (
    <>
      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {roles.length > 0 ? (
          <Box sx={MODULE_STYLES.roles.rolesGrid}>
            {roles.map((role, idx) => (
              <RoleCard
                key={role._id || idx}
                role={role}
                idx={idx}
                openEdit={() => onEditRole(role)}
                onViewPermissions={onViewPermissions}
              />
            ))}
          </Box>
        ) : (
          <EmptyState />
        )}
      </Box>

      <Box sx={MODULE_STYLES.roles.paginationWrapper}>
        <Pagination
          page={page}
          pageSize={rowsPerPage ?? 8}
          total={totalItems}
          onPageChange={onPageChange}
          pageSizeOptions={[...ROLES_ROWS_PER_PAGE_OPTIONS]}
          onPageSizeChange={onPageSizeChange}
        />
      </Box>
    </>
  );
};

export default RolesList;
