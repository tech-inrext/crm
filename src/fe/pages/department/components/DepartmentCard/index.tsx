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
  <div className="flex items-start gap-0">
    <Box sx={iconBubbleSx(color)}>{icon}</Box>
    <div className="flex-1 min-w-0">
      <span className="block text-sm font-medium text-gray-700 leading-relaxed">
        {text}
      </span>
    </div>
  </div>
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
        <CardContent className="flex-1 !p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <Avatar sx={avatarSx(theme.palette.primary.main)}>{initial}</Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl font-bold leading-tight text-gray-900 mb-1">
                {department.name}
              </h3>
            </div>
          </div>

          <Divider sx={dividerSx} />

          {/* Info Section */}
          <div className="space-y-4 mt-4">
            <InfoRow
              icon={<PersonOutlined sx={{ fontSize: 18 }} />}
              text={managerName}
              color={theme.palette.secondary.main}
            />
            <InfoRow
              icon={<DescriptionOutlined sx={{ fontSize: 18 }} />}
              text={department.description || "No description available"}
              color={theme.palette.info.main}
            />
            <InfoRow
              icon={<BadgeOutlined sx={{ fontSize: 18 }} />}
              text={`${attachmentCount} attachment${attachmentCount !== 1 ? "s" : ""}`}
              color={theme.palette.warning.main}
            />
          </div>
        </CardContent>

        {/* Footer */}
        <div className="flex justify-end px-5 pb-4">
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
        </div>
      </Card>
    );
  },
);

DepartmentCard.displayName = "DepartmentCard";

export default DepartmentCard;
