"use client";

import { memo } from "react";
import {
  Card,
  CardContent,
  Divider,
  Avatar,
  IconButton,
  Box,
  useTheme,
} from "@mui/material";
import {
  Edit,
  BadgeOutlined,
  PersonOutlined,
  DescriptionOutlined,
} from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import { DEPARTMENTS_PERMISSION_MODULE } from "@/fe/pages/department/constants/departments";
import type { DepartmentCardProps } from "@/fe/pages/department/types";
import { cardSx, avatarSx, dividerSx, iconBubbleSx, editBtnSx } from "./styles";

const InfoRow = ({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: string;
}) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
    <Box sx={iconBubbleSx(color)}>{icon}</Box>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box
        component="span"
        sx={{
          display: "block",
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "text.secondary",
          lineHeight: 1.5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </Box>
    </Box>
  </Box>
);

const DepartmentCard: React.FC<DepartmentCardProps> = memo(
  ({ department, onEdit }) => {
    const theme = useTheme();

    const initial = department.name?.[0]?.toUpperCase() ?? "D";
    const managerName =
      typeof department.managerId === "object" && department.managerId !== null
        ? ((department.managerId as { name?: string }).name ?? "No manager")
        : "No manager";

    const attachmentCount = department.attachments?.length ?? 0;

    return (
      <Card elevation={0} sx={cardSx}>
        <CardContent className="flex-1 !p-4">
          {/* Header */}
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1.5 }}>
            <Avatar sx={avatarSx(theme.palette.primary.main)}>{initial}</Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box
                  component="h3"
                  sx={{
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    color: "text.primary",
                    mb: 0.25,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {department.name}
                </Box>
                <PermissionGuard
                  module={DEPARTMENTS_PERMISSION_MODULE}
                  action="write"
                  fallback={<></>}
                >
                  <IconButton
                    size="small"
                    onClick={onEdit}
                    sx={editBtnSx(theme.palette.primary.main)}
                    title="Edit Department"
                  >
                    <Edit sx={{ fontSize: 18 }} />
                  </IconButton>
                </PermissionGuard>
              </Box>
            </Box>
          </Box>

          <Divider sx={dividerSx} />

          {/* Info Section */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 1.5 }}>
            <InfoRow
              icon={<PersonOutlined sx={{ fontSize: 16 }} />}
              text={managerName}
              color={theme.palette.secondary.main}
            />
            <InfoRow
              icon={<DescriptionOutlined sx={{ fontSize: 16 }} />}
              text={department.description || "No description available"}
              color={theme.palette.info.main}
            />
            <InfoRow
              icon={<BadgeOutlined sx={{ fontSize: 16 }} />}
              text={`${attachmentCount} attachment${attachmentCount !== 1 ? "s" : ""}`}
              color={theme.palette.warning.main}
            />
          </Box>
        </CardContent>
      </Card>
    );
  },
);

DepartmentCard.displayName = "DepartmentCard";

export default DepartmentCard;
