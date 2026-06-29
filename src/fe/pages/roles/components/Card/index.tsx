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
  Edit,
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
      <CardContent sx={{ p: 2.5, height: "100%" }}>
        <Stack spacing={1} sx={{ height: "100%", justifyContent: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Avatar className="role-avatar" sx={roleCardStyles.avatar}>
              <Security fontSize="small" />
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={role.name} placement="top" arrow>
                <Typography variant="subtitle1" noWrap sx={roleCardStyles.title}>
                  {role.name}
                </Typography>
              </Tooltip>
              <Typography sx={roleCardStyles.rank}>
                Rank: {role.rank || 0}
              </Typography>
            </Box>
            <Box sx={{ 
              display: "flex", 
              flexDirection: { xs: "row", sm: "column" }, 
              gap: { xs: 1, sm: 0.5 } 
            }}>
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
                  <Edit fontSize="small" />
                </IconButton>
              </PermissionGuard>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default RoleCard;
