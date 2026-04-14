import { memo, useState, useEffect } from "react";
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
  Chip,
  Avatar,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

import {
  Email,
  Phone,
  TrendingUp,
  Edit,
  PersonAdd,
  HomeIcon,
  PinIcon,
} from "@/components/ui/Component";

import { Schedule, MoreVert, NoteAlt, Event } from "@mui/icons-material";

import type { LeadDisplay as Lead } from "../../types/lead";
import StatusDropdown from "./StatusDropdown";
import LeadTypeDropdown from "./LeadTypeDropdown";
import PermissionGuard from "../PermissionGuard";

// Helper for row items with icons
const InfoRow = ({
  icon,
  text,
  color,
  isLink = false,
  href = "",
}: {
  icon: React.ReactNode;
  text: string | React.ReactNode;
  color: string;
  isLink?: boolean;
  href?: string;
}) => {
  // Only apply border for AssignedTo row
  const isAssignedTo =
    typeof text === "object" &&
    text?.props?.children?.type === AssignedDropdown;
  const content = (
    <Box
      className={`flex items-center w-full ${
        isAssignedTo ? "border rounded-lg px-1 py-0.5 box-border" : ""
      }`}
      style={
        isAssignedTo
          ? {
              borderColor: `${color}40`,
              backgroundColor: `${color}08`,
            }
          : {}
      }
    >
      <Box
        sx={{
          mr: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: alpha(color, 0.1),
          color: color,
          flexShrink: 0,
          ...(isAssignedTo ? { border: `1px solid ${alpha(color, 0.4)}` } : {}),
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="body2"
        component="div"
        color="text.primary"
        fontWeight={500}
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          flex: 1,
        }}
      >
        {text}
      </Typography>
    </Box>
  );

  if (isLink && href) {
    return (
      <Box
        component="a"
        href={href}
        onClick={(e) => e.stopPropagation()}
        sx={{
          textDecoration: "none",
          display: "block",
          "&:hover": {
            "& p": { color: "primary.main" },
          },
        }}
      >
        {content}
      </Box>
    );
  }
  return content;
};

interface LeadCardProps {
  lead: Lead;
  onEdit: () => void;
  onScheduleSiteVisit: (leadId: string) => void;
  onOpenFeedback: (leadId: string) => void;
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
  onLeadTypeChange: (leadId: string, newLeadType: string) => Promise<void>;
}

const LeadCard = memo(
  ({
    lead,
    onEdit,
    onScheduleSiteVisit,
    onOpenFeedback,
    onStatusChange,
    onLeadTypeChange,
  }: LeadCardProps) => {
    const [actionsOpen, setActionsOpen] = useState(false);
    const theme = useTheme();

    const leadId = lead._id || lead.id || lead.leadId || "";

    return (
      <Card
        elevation={0}
        onClick={() => onOpenFeedback(leadId)}
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          background: "#fff",
          position: "relative",
          height: "367px",
          minHeight: "367px",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          overflow: "visible",
          cursor: "pointer",
          "&:hover": {
            boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
            transform: "translateY(-4px)",
          },
        }}
      >
        {/* Lead Type Dropdown (Top-Left) */}
        <Box
          sx={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <LeadTypeDropdown
            leadId={lead._id || lead.id || lead.leadId || ""}
            currentLeadType={lead.leadType || ""}
            onLeadTypeChange={onLeadTypeChange}
            variant="chip"
            size="small"
          />
        </Box>

        {/* Status Dropdown (Top-Right) */}
        <Box
          sx={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}
          onClick={(e) => e.stopPropagation()}
        >
          <StatusDropdown
            leadId={lead._id || lead.id || lead.leadId || ""}
            currentStatus={lead.status}
            onStatusChange={onStatusChange}
            variant="chip"
            size="small"
          />
        </Box>

        <CardContent sx={{ p: 2.5, flexGrow: 1, pt: 6 }}>
          {/* Header Section: Name & Project */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              fontWeight={700}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Phone sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography
                  component="a"
                  href={lead.phone ? `tel:${lead.phone}` : "#"}
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  onClick={(e) => e.stopPropagation()}
                  sx={{
                    textDecoration: "none",
                    "&:hover": {
                      color: "primary.main",
                      // textDecoration: "underline",
                    },
                  }}
                >
                  {lead.phone || "Phone not set"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Email sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {lead.email || "Email not set"}
                </Typography>
              </Box>
            </Stack>

            {/* Quick Actions (3 dots) - Moved Above Divider */}
            <Box
              sx={{
                position: "absolute",
                top: 130,
                right: 15,
                zIndex: 50,
              }}
            >
              <PermissionGuard module="lead" action="write" fallback={<></>}>
                <ClickAwayListener onClickAway={() => setActionsOpen(false)}>
                  <Box sx={{ position: "relative" }}>
                    <SpeedDial
                      ariaLabel="Actions"
                      sx={{
                        "& .MuiFab-root": {
                          width: 32,
                          height: 32,
                          minHeight: 32,
                          boxShadow: "none",
                          border: `1px solid ${theme.palette.divider}`,
                          bgcolor: "transparent",
                          color: "text.secondary",
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                          },
                        },
                      }}
                      onClick={(e) => e.stopPropagation()}
                      icon={
                        <SpeedDialIcon
                          icon={<MoreVert sx={{ fontSize: 18 }} />}
                        />
                      }
                      onClose={(_, reason) => {
                        if (
                          reason === "toggle" ||
                          reason === "escapeKeyDown" ||
                          reason === "blur"
                        ) {
                          setActionsOpen(false);
                        }
                      }}
                      onOpen={(_, reason) => {
                        if (reason === "toggle") {
                          setActionsOpen(true);
                        }
                      }}
                      open={actionsOpen}
                      direction="left"
                    >
                      <SpeedDialAction
                        icon={
                          <Edit
                            sx={{
                              fontSize: 16,
                              color: theme.palette.primary.main,
                            }}
                          />
                        }
                        tooltipTitle="Edit"
                        sx={{
                          width: 32,
                          height: 32,
                          minHeight: 32,
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
                            sx={{
                              fontSize: 16,
                              color: theme.palette.warning.main,
                            }}
                          />
                        }
                        tooltipTitle="Notes"
                        sx={{
                          width: 32,
                          height: 32,
                          minHeight: 32,
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.warning.main, 0.2),
                          },
                        }}
                        onClick={() => {
                          setActionsOpen(false);
                          onOpenFeedback(
                            lead._id || lead.id || lead.leadId || ""
                          );
                        }}
                      />
                      <SpeedDialAction
                        icon={
                          <Event
                            sx={{
                              fontSize: 16,
                              color: theme.palette.secondary.main,
                            }}
                          />
                        }
                        tooltipTitle="Site Visit"
                        sx={{
                          width: 32,
                          height: 32,
                          minHeight: 32,
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.secondary.main, 0.2),
                          },
                        }}
                        onClick={() => {
                          setActionsOpen(false);
                          onScheduleSiteVisit(
                            lead._id || lead.id || lead.leadId || ""
                          );
                        }}
                      />
                    </SpeedDial>
                  </Box>
                </ClickAwayListener>
              </PermissionGuard>
            </Box>
          </Box>

          <Divider sx={{ my: 2, borderStyle: "dashed" }} />

          {/* Recent Activities Section */}
          <Box sx={{ mt: 0.5, minWidth: 0 }}>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                display: "block",
                mb: 1.5,
              }}
            >
              Recent Activities
            </Typography>

            <Stack spacing={1.5}>
              {lead.recentActivities && lead.recentActivities.length > 0 ? (
                lead.recentActivities.map((act: any) => (
                  <Box
                    key={act._id}
                    sx={{ display: "flex", gap: 1.5, alignItems: "center" }}
                  >
                    <Avatar
                      sx={{
                        width: 28,
                        height: 28,
                        bgcolor: alpha(
                          act.followUpType === "call back"
                            ? theme.palette.info.main
                            : act.followUpType === "site visit"
                            ? theme.palette.secondary.main
                            : theme.palette.success.main,
                          0.1
                        ),
                        color:
                          act.followUpType === "call back"
                            ? "info.main"
                            : act.followUpType === "site visit"
                            ? "secondary.main"
                            : "success.main",
                      }}
                    >
                      {act.followUpType === "call back" && (
                        <Phone sx={{ fontSize: 14 }} />
                      )}
                      {act.followUpType === "site visit" && (
                        <Event sx={{ fontSize: 14 }} />
                      )}
                      {act.followUpType === "note" && (
                        <NoteAlt sx={{ fontSize: 14 }} />
                      )}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        variant="caption"
                        fontWeight={600}
                        color="text.primary"
                        display="block"
                        sx={{ lineHeight: 1.1 }}
                      >
                        {act.followUpType.charAt(0).toUpperCase() +
                          act.followUpType.slice(1)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        sx={{
                          fontSize: "0.65rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {act.note || "No details provided"}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: "0.65rem",
                        color: "text.disabled",
                        fontWeight: 500,
                      }}
                    >
                      {new Date(act.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontStyle: "italic", opacity: 0.7 }}
                >
                  No recent activities recorded
                </Typography>
              )}
            </Stack>
          </Box>
        </CardContent>
      </Card>
    );
  }
);

LeadCard.displayName = "LeadCard";

export default LeadCard;
