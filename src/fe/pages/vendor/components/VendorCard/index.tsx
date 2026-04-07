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
import * as styles from "./styles";

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onEdit }) => {
  const phoneHref = vendor.phone ? vendor.phone.replace(/[^+\d]/g, "") : "";

  return (
    <Card elevation={3} sx={styles.cardRoot}>
      {/* Header row */}
      <Box sx={styles.headerBox}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            src={vendor.avatarUrl}
            alt={vendor.name}
            sx={styles.avatar}
          >
            {vendor.name?.[0]?.toUpperCase()}
          </Avatar>

          <Box sx={styles.nameContainer}>
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
              sx={styles.emailText}
            >
              {vendor.email}
            </Typography>
            {vendor.designation && (
              <Chip label={vendor.designation} size="small" sx={styles.designationChip} />
            )}
          </Box>
        </Stack>

        {onEdit && (
          <Tooltip title="Edit Vendor">
            <IconButton
              size="small"
              onClick={onEdit}
              sx={styles.editButton}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      <CardContent sx={styles.cardContent}>
        <Stack direction="column" spacing={0.5}>
          {vendor.phone && (
            <Tooltip title={vendor.phone} placement="top">
              <Stack direction="row" spacing={1} alignItems="center">
                <PhoneIcon fontSize="small" color="action" />
                <Box
                  component="a"
                  href={`tel:${phoneHref}`}
                  sx={styles.contactLink}
                >
                  <Typography
                    fontSize={13}
                    color="text.primary"
                    noWrap
                    sx={styles.contactText}
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
                  sx={styles.addressIcon}
                />
                <Typography
                  fontSize={13}
                  color="text.primary"
                  noWrap
                  sx={styles.contactText}
                >
                  {vendor.address}
                </Typography>
              </Stack>
            </Tooltip>
          )}

          <Box sx={styles.spacer} />

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

