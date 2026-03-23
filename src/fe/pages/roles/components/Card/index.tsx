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
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, height: "100%" }}>
        <Stack spacing={1} sx={{ height: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar className="role-avatar" sx={roleCardStyles.avatar}>
              <Security fontSize="small" />
            </Avatar>
            <Typography
              variant="subtitle1"
              noWrap
              sx={{ ...roleCardStyles.title, flex: 1 }}
            >
              {role.name}
            </Typography>
            <Tooltip title="View Permissions">
              <IconButton
                className="view-permissions-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewPermissions(role);
                }}
                size="small"
                sx={roleCardStyles.editButton}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <PermissionGuard module="role" action="write" fallback={null}>
              <IconButton
                className="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
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
