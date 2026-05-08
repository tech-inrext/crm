"use client";

import React from "react";
import {
  Avatar,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Box,
  Typography,
  Settings,
  PermissionGuard,
  Skeleton,
  Visibility,
} from "@/components/ui/Component";
import Security from "@/components/ui/Component/Security";
import { roleCardStyles, permissionColors } from "./styles";
import type { RoleCardProps } from "@/fe/pages/roles/types";

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  idx,
  openEdit,
  onViewPermissions,
  small,
}) => {
  return (
    <Card elevation={0} sx={roleCardStyles.card}>
      <CardContent sx={{ p: 2, height: "100%" }}>
        <Stack spacing={1} sx={{ height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar className="role-avatar" sx={roleCardStyles.avatar}>
              <Security fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" noWrap sx={roleCardStyles.title}>
                {role.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Rank: {role.rank || 0}
              </Typography>
            </Box>
            <Tooltip title="View Permissions">
              <IconButton
                className="view-permissions-button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onViewPermissions(role);
                }}
                size="small"
                sx={roleCardStyles.viewButton}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <PermissionGuard module="role" action="write" fallback={null}>
              <IconButton
                className="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  openEdit(role);
                }}
                size="small"
                sx={roleCardStyles.editButton}
              >
                <Settings fontSize="small" />
              </IconButton>
            </PermissionGuard>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RoleCard;
