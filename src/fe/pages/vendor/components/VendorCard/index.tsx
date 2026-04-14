"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
} from "@/components/ui/Component";
import Avatar from "@mui/material/Avatar";
import Typography from "@/components/ui/Component/Typography";
import PhoneIcon from "@/components/ui/Component/PhoneIcon";
import LocationOnIcon from "@/components/ui/Component/LocationOn";
import EditIcon from "@mui/icons-material/Edit";
import type { VendorCardProps } from "@/fe/pages/vendor/types";
import * as styles from "./styles";

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onEdit }) => {
  const phoneHref = vendor.phone ? vendor.phone.replace(/[^+\d]/g, "") : "";

  return (
    <Card elevation={0} sx={styles.cardRoot}>
      {/* Header section */}
      <Box sx={styles.headerBox}>
        <Stack direction="row" spacing={0} alignItems="flex-start" sx={{ width: "100%" }}>
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
                fontSize={16}
                color="text.primary"
                noWrap
                sx={{ lineHeight: 1.2 }}
              >
                {vendor.name}
              </Typography>
            </Tooltip>
            {vendor.email && (
              <Typography
                variant="body2"
                noWrap
                sx={styles.emailText}
              >
                {vendor.email}
              </Typography>
            )}
            {vendor.designation && (
              <Chip 
                label={vendor.designation} 
                size="small" 
                sx={styles.designationChip} 
              />
            )}
          </Box>

          {onEdit && (
            <Tooltip title="Edit Vendor">
              <IconButton
                size="small"
                onClick={onEdit}
                className="edit-button"
                sx={styles.editButton}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Box>

      {/* Contact Info section */}
      <CardContent sx={styles.cardContent}>
        <Stack direction="column" spacing={0}>
          {vendor.phone && (
            <Box sx={styles.contactItem}>
              <Box sx={styles.iconShell}>
                <PhoneIcon sx={{ fontSize: 18 }} />
              </Box>
              <Box
                component="a"
                href={`tel:${phoneHref}`}
                sx={styles.contactLink}
              >
                <Typography
                  noWrap
                  className="contact-text"
                  sx={styles.contactText}
                >
                  {vendor.phone}
                </Typography>
              </Box>
            </Box>
          )}

          {vendor.address && (
            <Box sx={styles.contactItem}>
              <Box sx={styles.iconShell}>
                <LocationOnIcon sx={styles.addressIcon} />
              </Box>
              <Tooltip title={vendor.address} placement="top">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    noWrap
                    sx={styles.contactText}
                  >
                    {vendor.address}
                  </Typography>
                </Box>
              </Tooltip>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default VendorCard;
