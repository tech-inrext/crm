"use client";

import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import RoleCard from "@/components/ui/card/RoleCard";
import RolesSkeleton from "@/fe/pages/roles/components/RolesSkeleton";
import dynamic from "next/dynamic";
import type { Role, RolesListProps } from "@/fe/pages/roles/types";
import { rolesGridSx, roleCardWrapperSx } from "@/fe/pages/roles/styles";

const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

const EmptyState: React.FC = () => (
  <Typography textAlign="center" width="100%" mt={2} color="text.primary">
    No roles found.
  </Typography>
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
      <Box sx={rolesGridSx}>
        {roles.length > 0 ? (
          roles.map((role, idx) => (
            <Box key={role._id || idx} sx={roleCardWrapperSx}>
              <RoleCard
                role={role}
                idx={idx}
                openEdit={() => onEditRole(role)}
                onViewPermissions={onViewPermissions}
              />
            </Box>
          ))
        ) : (
          <EmptyState />
        )}
      </Box>

      <div className="flex justify-center mt-4">
        <Pagination
          page={page}
          pageSize={rowsPerPage}
          total={totalItems}
          onPageChange={onPageChange}
          pageSizeOptions={[3, 6, 12, 24]}
          onPageSizeChange={onPageSizeChange}
        />
      </div>
    </>
  );
};

export default RolesList;
