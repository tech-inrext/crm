import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import PermissionGuard from "@/components/PermissionGuard";
import { VENDORS_PERMISSION_MODULE } from "@/constants/vendors";

interface VendorCardProps {
  vendor: {
    name: string;
    email: string;
    designation?: string;
    avatarUrl?: string;
  };
  onEdit?: () => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onEdit }) => {
  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 2,
        minWidth: 0,
        width: "100%",
        boxShadow: "0 2px 8px rgba(25, 118, 210, 0.10)",
        background: "linear-gradient(135deg, #fafdff 0%, #f1f5fa 100%)",
      }}
    >
      <Avatar
        src={vendor.avatarUrl}
        alt={vendor.name}
        sx={{
          width: 56,
          height: 56,
          fontWeight: 700,
          fontSize: 24,
          bgcolor: "primary.main",
          color: "white",
          boxShadow: 1,
        }}
      >
        {vendor.name?.[0]?.toUpperCase()}
      </Avatar>
      <CardContent sx={{ flex: 1, p: 0, minWidth: 0 }}>
        <Stack spacing={0.5}>
          <Typography
            variant="h6"
            fontWeight={700}
            color="text.primary"
            sx={{
              lineHeight: 1.2,
              fontSize: { xs: 16, sm: 18 },
            }}
            noWrap
          >
            {vendor.name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: 13, sm: 14 }, wordBreak: "break-all" }}
            noWrap
          >
            {vendor.email}
          </Typography>
          {vendor.designation && (
            <Typography
              variant="caption"
              color="primary"
              sx={{
                fontWeight: 600,
                fontSize: { xs: 12, sm: 13 },
              }}
              noWrap
            >
              {vendor.designation}
            </Typography>
          )}
        </Stack>
      </CardContent>
      {onEdit && (
        <PermissionGuard
          module={VENDORS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <IconButton
            size="small"
            onClick={onEdit}
            aria-label="edit vendor"
            sx={{ ml: 1, color: "primary.main" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </PermissionGuard>
      )}
    </Card>
  );
};

export default VendorCard;
