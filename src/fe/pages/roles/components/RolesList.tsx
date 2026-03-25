"use client";

import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import RoleCard from "./Card";
import RolesSkeleton from "@/fe/pages/roles/components/RolesSkeleton";
import EmptyState from "./EmptyState";
import dynamic from "next/dynamic";
import type { Role, RolesListProps } from "@/fe/pages/roles/types";
import { rolesGridSx, roleCardWrapperSx } from "@/fe/pages/roles/styles";

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
  if (loading) return <RolesSkeleton count={rowsPerPage || 6} />;

  return (
    <>
      {roles.length > 0 ? (
        <Box sx={rolesGridSx}>
          {roles.map((role, idx) => (
            <Box key={role._id || idx} sx={roleCardWrapperSx}>
              <RoleCard
                role={role}
                idx={idx}
                openEdit={() => onEditRole(role)}
                onViewPermissions={onViewPermissions}
              />
            </Box>
          ))}
        </Box>
      ) : (
        <EmptyState />
      )}

      <div className="flex justify-center mt-4">
        <Pagination
          page={page}
          pageSize={rowsPerPage ?? 8}
          total={totalItems}
          onPageChange={onPageChange}
          pageSizeOptions={[4, 8, 12, 24]}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </>
  );
};

export default RolesList;
