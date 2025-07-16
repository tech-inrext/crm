import React, { useState } from "react";
import {
  Avatar,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Box,
  Typography,
} from "@mui/material";
import { Settings, Security } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import Skeleton from "@mui/material/Skeleton";
import { roleCardStyles, permissionColors } from "./RoleCard.styles";

interface RoleCardProps {
  role: any;
  idx: number;
  openEdit: (idx: number) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ role, idx, openEdit }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      elevation={0}
      sx={roleCardStyles.card}
      onClick={() => setExpanded(!expanded)}
    >
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
            <PermissionGuard module="role" action="write" fallback={null}>
              <IconButton
                className="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(idx);
                }}
                size="small"
                sx={roleCardStyles.editButton}
              >
                <Settings fontSize="small" />
              </IconButton>
            </PermissionGuard>
          </Box>

          {expanded && (
            <Box sx={roleCardStyles.expandedContent}>
              <Typography
                variant="caption"
                sx={roleCardStyles.permissionsTitle}
              >
                Permissions
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {role.permissions.length === 0 ? (
                  <Chip
                    label="No permissions"
                    size="small"
                    variant="outlined"
                  />
                ) : (
                  role.permissions.map((perm: string, i: number) => {
                    const [module, action] = perm.split(":");
                    return (
                      <Chip
                        key={i}
                        label={`${module} ${action}`}
                        size="small"
                        sx={{
                          backgroundColor:
                            permissionColors[
                              action as keyof typeof permissionColors
                            ] || permissionColors.read,
                          color: "white",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                        }}
                      />
                    );
                  })
                )}
              </Box>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export const LoadingSkeleton = () => (
  <Box sx={roleCardStyles.loadingGrid}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Card key={index} sx={roleCardStyles.loadingCard}>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="circular" width={28} height={28} />
          </Box>
          <Skeleton
            variant="rectangular"
            width="100%"
            height={50}
            sx={{ borderRadius: 1 }}
          />
        </Stack>
      </Card>
    ))}
  </Box>
);

export default RoleCard;
