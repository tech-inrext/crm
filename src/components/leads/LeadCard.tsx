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

import { Schedule, MoreVert, NoteAlt, Event } from "@mui/icons-material";

import type { LeadDisplay as Lead } from "../../types/lead";
import StatusDropdown from "./StatusDropdown";
import PermissionGuard from "../PermissionGuard";
import AssignedDropdown from "./AssignedDropdown";

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
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleAssignedClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };

    const handleCloseMenu = () => {
      setAnchorEl(null);
    };

    const handleAssignUser = async (user) => {
      setAssignedUser(user);
      setIsManualAssign(true);

      try {
        const response = await fetch(`/api/v0/leads/${lead._id}/assign`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ assignedTo: user._id }),
        });

        if (!response.ok) {
          throw new Error("Failed to update assignment");
        }

        console.log(`Assigned to: ${user.name}`);
      } catch (error) {
        console.error("Error updating assignment:", error);
      }
    };

    const leadId = lead._id || lead.id || lead.leadId || "";
    const [assignedUser, setAssignedUser] = useState<any>(
      lead.assignedTo || null,
    );
    const [isManualAssign, setIsManualAssign] = useState(false);

    useEffect(() => {
      if (!isManualAssign) {
        setAssignedUser(lead.assignedTo || null);
      }
    }, [lead.assignedTo, isManualAssign]);

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
          mt: 1.5,
          mb: 2,
        }}
      >
        {/* Ribbon */}
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

        {/* Status */}
        <Box
          sx={{
            position: "absolute",
            right: 1,
            top: 1,
            zIndex: 1,
            borderRadius: "4px 4px 0 4px",
            overflow: "visible",
          }}
        >
          <StatusDropdown
            leadId={leadId}
            currentStatus={lead.status}
            onStatusChange={onStatusChange}
            variant="chip"
            size="small"
          />
        </Box>

        {/* Actions */}
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <ClickAwayListener onClickAway={() => setActionsOpen(false)}>
            <Box sx={{ position: "absolute", bottom: 6, right: 6, zIndex: 2 }}>
              <SpeedDial
                ariaLabel="Lead actions"
                direction="up"
                icon={<SpeedDialIcon icon={<MoreVert />} />}
                open={actionsOpen}
                onClose={() => setActionsOpen(false)}
                FabProps={{
                  size: "small",
                  sx: {
                    backgroundColor: "#fff",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                      boxShadow: "0 4px 10px rgba(15, 23, 42, 0.12)",
                    },
                  },
                  onClick: (event) => {
                    event.stopPropagation();
                    setActionsOpen((prev) => !prev);
                  },
                }}
              >
                <SpeedDialAction
                  icon={<Edit fontSize="small" />}
                  tooltipTitle="Edit"
                  onClick={() => {
                    setActionsOpen(false);
                    onEdit();
                  }}
                />

                <SpeedDialAction
                  icon={<NoteAlt fontSize="small" />}
                  tooltipTitle="Notes"
                  onClick={() => {
                    setActionsOpen(false);
                    onOpenFeedback(leadId);
                  }}
                />

                <SpeedDialAction
                  icon={<Event fontSize="small" />}
                  tooltipTitle="Site Visit"
                  onClick={() => {
                    setActionsOpen(false);
                    onScheduleSiteVisit(leadId);
                  }}
                />
              </SpeedDial>
            </Box>
          </ClickAwayListener>
        </PermissionGuard>

        <CardContent sx={{ p: 1.5 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {lead?.fullName}
              </Typography>

              <Box display="flex" alignItems="center" gap={1}>
                <HomeIcon sx={{ fontSize: 18 }} />
                <Typography fontSize={12}>{lead.propertyName}</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <PinIcon sx={{ fontSize: 18 }} />
                <Typography fontSize={12}>{lead.location}</Typography>
              </Box>
            </Box>

            <Divider />

            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Email sx={{ fontSize: 18 }} />
                <Typography>{lead.email || "Not provided"}</Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  component="a"
                  href={`tel:${lead.phone}`}
                  sx={{ textDecoration: "none" }}
                >
                  <Phone sx={{ fontSize: 18 }} /> {lead.phone}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp sx={{ fontSize: 18 }} />
                <Typography fontWeight={600}>{lead.budgetRange}</Typography>
              </Box>

              {/* Assigned */}
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{ cursor: "pointer" }}
                onClick={handleAssignedClick}
              >
                <PersonAdd sx={{ fontSize: 18 }} />

                <Typography fontWeight={600}>
                  {assignedUser?.name || assignedUser?.fullName || "Unassigned"}
                </Typography>
              </Box>

              <AssignedDropdown
                assignedTo={assignedUser}
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                onAssign={handleAssignUser}
              />

              {lead.nextFollowUp && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Schedule sx={{ fontSize: 18 }} />
                  <Typography>
                    {(() => {
                      const date = new Date(lead.nextFollowUp);
                      if (isNaN(date.getTime())) return "Invalid date";
                      return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
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
  },
);

LeadCard.displayName = "LeadCard";

export default LeadCard;
