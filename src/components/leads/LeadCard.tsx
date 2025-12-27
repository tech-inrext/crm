import { memo, useMemo } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";

import {
  Email,
  Phone,
  TrendingUp,
  Edit,
  Delete,
  PersonAdd,
  HomeIcon,
  PinIcon,
} from "@/components/ui/Component";

import { Schedule } from "@mui/icons-material";

import type { LeadDisplay as Lead } from "../../types/lead";
import StatusChip, { getStatusColor } from "./StatusChip";
import StatusDropdown from "./StatusDropdown";
import PermissionGuard from "../PermissionGuard";

// Style constants
const GRADIENTS = {
  paper: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
};

const COMMON_STYLES = {
  iconButton: (bg: string, hover?: string) => ({
    backgroundColor: bg,
    color: "white",
    "&:hover": { backgroundColor: hover || `${bg}99` },
  }),
};

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
}

// Helper to darken a hex color
const darkenColor = (hex: string, percent: number = 20): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max(((num >> 8) & 0x00ff) - amt, 0);
  const B = Math.max((num & 0x0000ff) - amt, 0);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
};

const LeadCard = memo(
  ({ lead, onEdit, onDelete, onStatusChange }: LeadCardProps) => {
    // Get status color and its darker shade for the fold
    const statusColor = getStatusColor(lead.status || "");
    const statusFoldColor = darkenColor(statusColor, 25);

    return (
      <Card
        elevation={2}
        sx={{
          borderRadius: 3,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            elevation: 8,
            transform: "translateY(-4px)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
          },
          border: "1px solid",
          borderColor: "divider",
          background: GRADIENTS.paper,
          position: "relative",
          overflow: "visible",
          mt: 1.5, // margin top to accommodate the floating badges
          mb: 2, // margin bottom to accommodate the floating edit pill
        }}
      >
        {/* Ribbon clip hanging over card edge - TOP LEFT */}
        <Box
          sx={{
            position: "absolute",
            top: -8,
            left: -6,
            backgroundColor: "#22c55e",
            color: "white",
            px: 1.5,
            py: 0.5,
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.5px",
            whiteSpace: "nowrap",
            borderRadius: "4px 4px 4px 0",
            boxShadow: "0 2px 8px rgba(34, 197, 94, 0.4)",
            // Folded corner effect on left side
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -6,
              left: 0,
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "0 6px 6px 0",
              borderColor: "transparent #16a34a transparent transparent",
            },
          }}
        >
          Warm Lead
        </Box>

        {/* Top-Right Status Pin - same style as Warm Lead */}
        <Box
          sx={{
            position: "absolute",
            right: -6,
            top: -8,
            zIndex: 1,
            borderRadius: "4px 4px 0 4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            overflow: "visible",
            // Folded corner effect on right side
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -6,
              right: 0,
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "6px 6px 0 0",
              borderColor: "#1565c0 transparent transparent transparent",
            },
          }}
        >
          <StatusDropdown
            leadId={lead._id || lead.id || lead.leadId || ""}
            currentStatus={lead.status}
            onStatusChange={onStatusChange}
            variant="chip"
            size="small"
          />
        </Box>

        {/* Bottom Center Edit Pill */}
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <Tooltip title="Edit Lead">
            <IconButton
              onClick={() => onEdit(lead)}
              size="small"
              sx={{
                position: "absolute",
                bottom: 0,
                left: "50%",
                transform: "translate(-50%, 50%)",
                backgroundColor: "primary.main",
                color: "white",
                px: 2,
                py: 0.5,
                borderRadius: "20px",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                "&:hover": {
                  backgroundColor: "primary.dark",
                  transform: "translate(-50%, 50%) scale(1.05)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <Edit sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography
                component="span"
                sx={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                Edit
              </Typography>
            </IconButton>
          </Tooltip>
        </PermissionGuard>
        <CardContent sx={{ p: 1.5 }}>
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="text.primary"
                  >
                    {lead?.fullName}
                  </Typography>

                  <Box sx={{ display: "flex" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <HomeIcon
                        sx={{ color: "text.secondary", fontSize: 18 }}
                      />
                      <Typography
                        fontSize={12}
                        variant="body2"
                        color="text.secondary"
                      >
                        {lead.propertyName}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <PinIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                      <Typography
                        fontSize={12}
                        variant="body2"
                        color="text.secondary"
                      >
                        {lead.location}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider />

            <Stack spacing={1}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Email sx={{ color: "text.secondary", fontSize: 18 }} />
                <Typography variant="body2" color="text.primary">
                  {lead.email || "Not provided"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  component="a"
                  href={`tel:${lead.phone}`}
                  variant="body2"
                  color="primary.main"
                  gap={1}
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      textDecoration: "underline",
                      cursor: "pointer",
                    },
                  }}
                >
                  <Phone
                    sx={{
                      color: "text.secondary",
                      fontSize: 18,
                    }}
                  />
                  {lead.phone}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUp sx={{ color: "text.secondary", fontSize: 18 }} />
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={600}
                >
                  {lead.budgetRange}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PersonAdd sx={{ color: "text.secondary", fontSize: 18 }} />
                <Typography
                  variant="body2"
                  color="text.primary"
                  fontWeight={600}
                >
                  {lead.assignedTo}
                </Typography>
              </Box>
              {lead.nextFollowUp && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Schedule sx={{ color: "text.secondary", fontSize: 18 }} />
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{ fontSize: "0.875rem" }}
                  >
                    {(() => {
                      const date = new Date(lead.nextFollowUp);
                      if (isNaN(date.getTime())) return "Invalid date";
                      return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}`;
                    })()}
                  </Typography>
                </Box>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  }
);

LeadCard.displayName = "LeadCard";

export default LeadCard;
