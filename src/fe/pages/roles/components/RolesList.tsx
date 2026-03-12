"use client";

import React from "react";
import { Box, Typography } from "@/components/ui/Component";
import RoleCard from "@/components/ui/card/RoleCard";
import RolesSkeleton from "@/fe/pages/roles/components/RolesSkeleton";
import dynamic from "next/dynamic";
import type { Role } from "@/fe/pages/roles/types";

const Pagination = dynamic(
  () => import("@/components/ui/Navigation/Pagination"),
  { ssr: false },
);

interface RolesListProps {
  loading: boolean;
  roles: Role[];
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onEditRole: (role: Role) => void;
  onViewPermissions: (role: Role) => void;
}

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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(auto-fill, minmax(240px, 1fr))",
            md: "repeat(auto-fill, minmax(260px, 1fr))",
            lg: "repeat(auto-fill, minmax(280px, 1fr))",
            xl: "repeat(auto-fill, minmax(300px, 1fr))",
          },
          gap: { xs: 2, sm: 2.5, md: 3 },
          mb: { xs: 2, sm: 3 },
          width: "100%",
          alignItems: "stretch",
        }}
      >
        {roles.length > 0 ? (
          roles.map((role, idx) => (
            <Box
              key={role._id || idx}
              sx={{ display: "flex", minHeight: "100%" }}
            >
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
