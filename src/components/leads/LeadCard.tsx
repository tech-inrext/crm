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

import AssignedDropdown from "./AssignedDropdown";

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
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const theme = useTheme();

    const [assignedUser, setAssignedUser] = useState<any>(
      lead.assignedTo || null,
    );
    const [isManualAssign, setIsManualAssign] = useState(false);

    const handleAssignedClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleAssignUser = async (user: any) => {
      setAssignedUser(user);
      setIsManualAssign(true);
      try {
        // Use query param for leadId as expected by backend
        const response = await fetch(
          `/api/v0/leads/${lead._id}/assign?leadId=${lead._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ assignedTo: user._id }),
          },
        );
        if (!response.ok) {
          throw new Error("Failed to update assignment");
        }
        const data = await response.json();
        // If backend returns a populated user object, use it. If only id, keep previous user object.
        if (
          data?.data?.assignedTo &&
          typeof data.data.assignedTo === "object"
        ) {
          setAssignedUser(data.data.assignedTo);
        } else if (
          data?.data?.assignedTo &&
          typeof data.data.assignedTo === "string"
        ) {
          // fallback: keep the user object from dropdown
          setAssignedUser(user);
        }
        console.log(`Assigned to: ${user.name || user.fullName}`);
      } catch (error) {
        console.error("Error updating assignment:", error);
      }
    };

    useEffect(() => {
      if (!isManualAssign) {
        setAssignedUser(lead.assignedTo || null);
      }
    }, [lead.assignedTo, isManualAssign]);

    const leadId = lead._id || lead.id || lead.leadId || "";

    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          background: "#fff",
          position: "relative",
          height: "100%",
          minHeight: "340px",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          overflow: "visible",
          "&:hover": {
            boxShadow: "0 16px 32px rgba(0,0,0,0.12)",
            transform: "translateY(-4px)",
          },
        }}
      >
        {/* Lead Type Dropdown (Top-Left) */}
        <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}>
          <LeadTypeDropdown
            leadId={lead._id || lead.id || lead.leadId || ""}
            currentLeadType={lead.leadType || ""}
            onLeadTypeChange={onLeadTypeChange}
            variant="chip"
            size="small"
          />
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
      left: -4,   // 👈 border shifted from left
      right: -4,  // 👈 border shifted from right
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
                    bottom: 24,
                    right: 0,
                    "& .MuiFab-root": {
                      width: 36,
                      height: 36,
                      minHeight: 36,
                      boxShadow: "none",
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: "transparent",
                      color: "text.secondary",
                    },
                  }}
                  icon={
                    <SpeedDialIcon icon={<MoreVert sx={{ fontSize: 20 }} />} />
                  }
                  onClose={(_, reason) => {
                    if (reason === "toggle" || reason === "escapeKeyDown" || reason === "blur") {
                      setActionsOpen(false);
                    }
                  }}
                  onOpen={(_, reason) => {
                    if (reason === "toggle") {
                      setActionsOpen(true);
                    }
                  }}
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
