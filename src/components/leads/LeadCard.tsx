import { memo, useState } from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Divider,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  ClickAwayListener,
} from "@mui/material";

import {
  Email,
  Phone,
  TrendingUp,
  Edit,
  PersonAdd,
  HomeIcon,
  PinIcon,
} from "@/components/ui/Component";

import { Schedule } from "@mui/icons-material";
import { MoreVert, NoteAlt, Event } from "@mui/icons-material";

import type { LeadDisplay as Lead } from "../../types/lead";
import StatusDropdown from "./StatusDropdown";
import PermissionGuard from "../PermissionGuard";

// Style constants
const GRADIENTS = {
  paper: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
};

interface LeadCardProps {
  lead: Lead;
  onEdit: () => void;
  onScheduleSiteVisit: (leadId: string) => void;
  onOpenFeedback: (leadId: string) => void;
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
}

const LeadCard = memo(
  ({
    lead,
    onEdit,
    onScheduleSiteVisit,
    onOpenFeedback,
    onStatusChange,
  }: LeadCardProps) => {
    const [actionsOpen, setActionsOpen] = useState(false);

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
          height: "266px",
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

        {/* Status Dropdown (Top-Right) */}
        <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
          <StatusDropdown
            leadId={lead._id || lead.id || lead.leadId || ""}
            currentStatus={lead.status}
            onStatusChange={onStatusChange}
            variant="chip"
            size="small"
          />
        </Box>

        {/* Bottom Right Sticky Action Button */}
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <ClickAwayListener onClickAway={() => setActionsOpen(false)}>
            <Box
              sx={{
                mb: 0.5,
                lineHeight: 1.3,
                color: "text.primary",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {lead?.fullName || "Unknown Lead"}
            </Typography>

            <Stack spacing={0.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <HomeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {lead.propertyName || "Property not set"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <PinIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {lead.location || "Location not set"}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 2, borderStyle: "dashed" }} />

          {/* Contact Details Grid */}
          <Stack spacing={1.5}>
            <InfoRow
              icon={<Email sx={{ fontSize: 18 }} />}
              text={lead.email || "Not provided"}
              color={theme.palette.info.main}
            />
            <InfoRow
              icon={<Phone sx={{ fontSize: 18 }} />}
              text={lead.phone}
              color={theme.palette.success.main}
              isLink
              href={`tel:${lead.phone}`}
            />
            <InfoRow
              icon={<TrendingUp sx={{ fontSize: 18 }} />}
              text={lead.budgetRange || "Budget N/A"}
              color={theme.palette.warning.main}
            />

            <Box
              onClick={handleAssignedClick}
              sx={{
                position: "relative",
                borderRadius: 2,
                width: 240,
                ml: 1,
                py: 0.5,
                boxSizing: "border-box",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",

                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: -4, // 👈 border shifted from left
                  right: -4, // 👈 border shifted from right
                  border: `0.5px solid ${alpha(theme.palette.secondary.main, 0.25)}`,
                  borderRadius: 2,
                  pointerEvents: "none",
                },
              }}
            >
              <InfoRow
                icon={<PersonAdd sx={{ fontSize: 18 }} />}
                text={
                  <Box sx={{ display: "inline-block" }}>
                    <Box component="span" sx={{ color: "black" }}>
                      {assignedUser?.name ||
                        assignedUser?.fullName ||
                        "Unassigned"}
                    </Box>
                  </Box>
                }
                color={theme.palette.secondary.main}
              />

              {/* ✅ Dropdown Icon */}
              <KeyboardArrowDown
                sx={{
                  fontSize: 20,
                  color: alpha(theme.palette.secondary.main, 0.7),
                }}
              />
            </Box>

            {/* AssignedDropdown rendered at root for proper closing */}
            {anchorEl && (
              <AssignedDropdown
                assignedTo={assignedUser}
                anchorEl={anchorEl}
                onClose={() => {
                  setAnchorEl(null);
                }}
                onAssign={handleAssignUser}
              />
            )}
          </Stack>
        </CardContent>
        {/* Footer / Actions */}
        <Box
          sx={{
            p: 2,
            pt: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            mt: "auto",
          }}
        >
          <PermissionGuard module="lead" action="write" fallback={<></>}>
            <ClickAwayListener onClickAway={() => setActionsOpen(false)}>
              <Box sx={{ position: "relative", zIndex: 20 }}>
                <SpeedDial
                  ariaLabel="Actions"
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    right: 0,
                    "& .MuiFab-root": {
                      width: 36,
                      height: 36,
                      minHeight: 36,
                      boxShadow: "none",
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: "transparent",
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        color: "primary.main",
                        borderColor: "primary.main",
                      },
                    },
                  }}
                  icon={
                    <SpeedDialIcon icon={<MoreVert sx={{ fontSize: 20 }} />} />
                  }
                  onClose={() => setActionsOpen(false)}
                  onOpen={() => setActionsOpen(true)}
                  open={actionsOpen}
                  direction="up"
                >
                  <SpeedDialAction
                    icon={
                      <Edit
                        sx={{ fontSize: 18, color: theme.palette.primary.main }}
                      />
                    }
                    tooltipTitle="Edit"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                      },
                    }}
                    onClick={() => {
                      setActionsOpen(false);
                      onEdit();
                    }}
                  />
                  <SpeedDialAction
                    icon={
                      <NoteAlt
                        sx={{ fontSize: 18, color: theme.palette.warning.main }}
                      />
                    }
                    tooltipTitle="Notes"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.warning.main, 0.2),
                      },
                    }}
                    onClick={() => {
                      setActionsOpen(false);
                      onOpenFeedback(lead._id || lead.id || lead.leadId || "");
                    }}
                  />
                  <SpeedDialAction
                    icon={
                      <Event
                        sx={{
                          fontSize: 18,
                          color: theme.palette.secondary.main,
                        }}
                      />
                    }
                    tooltipTitle="Site Visit"
                    sx={{
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      "&:hover": {
                        bgcolor: alpha(theme.palette.secondary.main, 0.2),
                      },
                    }}
                    onClick={() => {
                      setActionsOpen(false);
                      onScheduleSiteVisit(
                        lead._id || lead.id || lead.leadId || "",
                      );
                    }}
                  />
                </SpeedDial>
              </Box>
            </ClickAwayListener>
          </PermissionGuard>
        </Box>
      </Card>
    );
  },
);

LeadCard.displayName = "LeadCard";

export default LeadCard;
