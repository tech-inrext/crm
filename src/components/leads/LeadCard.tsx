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
            right: 1,
            top: 1,
            zIndex: 1,
            borderRadius: "4px 4px 0 4px",
            overflow: "visible",
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

        {/* Bottom Right Sticky Action Button */}
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <ClickAwayListener onClickAway={() => setActionsOpen(false)}>
            <Box
              sx={{
                position: "absolute",
                bottom: 6,
                right: 6,
                zIndex: 2,
              }}
            >
              <SpeedDial
                ariaLabel="Lead actions"
                direction="left"
                icon={<SpeedDialIcon icon={<MoreVert />} />}
                open={actionsOpen}
                onClose={() => setActionsOpen(false)}
                FabProps={{
                  size: "small",
                  sx: {
                    backgroundColor: "primary.main",
                    color: "white",
                    boxShadow: "0 6px 16px rgba(25, 118, 210, 0.35)",
                    "&:hover": { backgroundColor: "primary.dark" },
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
                    onOpenFeedback(lead._id || lead.id || lead.leadId || "");
                  }}
                />
                <SpeedDialAction
                  icon={<Event fontSize="small" />}
                  tooltipTitle="Site Visit"
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
