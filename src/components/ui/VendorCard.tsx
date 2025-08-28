import React from "react";
import {
  Box,
  IconButton,
  Stack,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShareIcon from "@mui/icons-material/Share";
import PermissionGuard from "@/components/PermissionGuard";
import { VENDORS_PERMISSION_MODULE } from "@/constants/vendors";

interface VendorCardProps {
  vendor: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    designation?: string;
    avatarUrl?: string;
  };
  onEdit?: () => void;
  onView?: () => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onEdit, onView }) => {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        p: 1.2,
        width: 300,
        height: 170,
        boxShadow: "0 4px 12px rgba(25, 118, 210, 0.15)",
        background: "linear-gradient(135deg, #e3f2fd 0%, #f1f5fa 100%)",
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translateY(-2px)" },
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        justifyContent: "flex-start",
      }}
    >
      {/* Header: Avatar + Name + Actions */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
          <Avatar
            src={vendor.avatarUrl}
            alt={vendor.name}
            sx={{
              width: 40,
              height: 40,
              fontWeight: 700,
              fontSize: 16,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: 2,
            }}
          >
            {vendor.name?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography
              fontWeight={700}
              fontSize={14}
              color="text.primary"
              noWrap
            >
              {vendor.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ fontSize: 12 }}
            >
              {vendor.email}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {onView && (
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={onView}
                sx={{ background: "#fafafa", boxShadow: 1 }}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
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
                sx={{ color: "primary.main" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </PermissionGuard>
          )}
        </Box>
      </Box>
      {/* Details Section */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
        {vendor.phone && (
          <Typography fontSize={12} color="text.primary">
            <b>Phone:</b> {vendor.phone}
          </Typography>
        )}
        {vendor.address && (
          <Typography fontSize={12} color="text.primary">
            <b>Address:</b> {vendor.address}
          </Typography>
        )}
        {vendor.designation && (
          <Typography fontSize={12} color="primary">
            <b>Designation:</b> {vendor.designation}
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default VendorCard;
