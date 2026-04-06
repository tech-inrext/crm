"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
} from "@/components/ui/Component";
import Avatar from "@mui/material/Avatar";
import Typography from "@/components/ui/Component/Typography";
import PhoneIcon from "@/components/ui/Component/PhoneIcon";
import LocationOnIcon from "@/components/ui/Component/LocationOn";
import WorkIcon from "@/components/ui/Component/Work";
import EditIcon from "@mui/icons-material/Edit";
import type { VendorCardProps } from "@/fe/pages/vendor/types";

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onEdit }) => {
  const phoneHref = vendor.phone ? vendor.phone.replace(/[^+\d]/g, "") : "";

  return (
    <Card
      elevation={3}
      sx={{
        my: 1,
        mx: { xs: "auto", sm: 0 },
        borderRadius: 4,
        p: 3,
        width: { xs: "95%", sm: 290 },
        minHeight: 140,
        boxShadow: "0 6px 18px rgba(16,24,40,0.06)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(243,247,255,0.7) 100%)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 10px 30px rgba(16,24,40,0.12)",
        },
        display: "flex",
        flexDirection: "column",
        gap: 1,
        justifyContent: "space-between",
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={vendor.avatarUrl}
            alt={vendor.name}
            sx={{
              width: 48,
              height: 48,
              fontWeight: 700,
              fontSize: 16,
              bgcolor: "primary.main",
              color: "white",
              boxShadow: 3,
            }}
          >
            {vendor.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={{ minWidth: 0 }}>
            <Tooltip title={vendor.name} placement="top">
              <Typography
                fontWeight={700}
                fontSize={15}
                color="text.primary"
                noWrap
              >
                {vendor.name}
              </Typography>
            </Tooltip>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ fontSize: 13 }}
            >
              {vendor.email}
            </Typography>
            {vendor.designation && (
              <Chip label={vendor.designation} size="small" sx={{ mt: 0.6 }} />
            )}
          </Box>
        </Stack>

        {onEdit && (
          <Tooltip title="Edit Vendor">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={{ background: "#ffffff", boxShadow: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      <CardContent sx={{ py: 0, px: 0 }}>
        <Stack direction="column" spacing={0.5}>
          {vendor.phone && (
            <Tooltip title={vendor.phone} placement="top">
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" color="action" />
                <Box
                  component="a"
                  href={`tel:${phoneHref}`}
                  sx={{ textDecoration: "none" }}
                >
                  <Typography
                    fontSize={13}
                    color="text.primary"
                    noWrap
                    sx={{ minWidth: 0 }}
                  >
                    {vendor.phone}
                  </Typography>
                </Box>
              </Stack>
            </Tooltip>
          )}

          {vendor.address && (
            <Tooltip title={vendor.address} placement="top">
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <LocationOnIcon
                  fontSize="small"
                  color="action"
                  sx={{ mt: 0.1 }}
                />
                <Typography
                  fontSize={13}
                  color="text.primary"
                  noWrap
                  sx={{ minWidth: 0 }}
                >
                  {vendor.address}
                </Typography>
              </Stack>
            </Tooltip>
          )}

          <Box sx={{ height: 2 }} />

          {vendor.designation && (
            <Stack direction="row" spacing={1} alignItems="center">
              <WorkIcon fontSize="small" color="action" />
              <Typography fontSize={13} color="text.secondary">
                {vendor.designation}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
