import React, { useState, useEffect } from "react";
import {Box, Typography, IconButton, Avatar, CloseIcon, TrendingUp, Phone, PersonAdd} from "@/components/ui/Component";
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import AssignedDropdown from "./AssignedDropdown";

export default function FollowUpHeader({
  leadInfo, 
  handleDialogClose, 
  isMobile,
  onLeadUpdate
}: {
  leadInfo: any, 
  handleDialogClose: () => void, 
  isMobile: boolean,
  onLeadUpdate?: () => void
}) {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [assignedUser, setAssignedUser] = useState(leadInfo?.assignedTo || null);

    useEffect(() => {
        if (leadInfo?.assignedTo) {
            setAssignedUser(leadInfo.assignedTo);
        }
    }, [leadInfo?.assignedTo]);

    const handleAssignUser = async (user: any) => {
        setAssignedUser(user);
        try {
            const leadId = leadInfo._id || leadInfo.id || leadInfo.leadId;
            const response = await fetch(
                `/api/v0/leads/${leadId}/assign?leadId=${leadId}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ assignedTo: user._id }),
                }
            );
            if (!response.ok) {
                throw new Error("Failed to update assignment");
            }
            if (onLeadUpdate) onLeadUpdate();
        } catch (error) {
            console.error("Error updating assignment:", error);
        }
    };
    return (
        <div>
            <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #f3f4f6",
          pt: "10px",
        }}
      >
        {/* Title row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 1.5,
            pb: 1,
            px: 2.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: isMobile ? "0.95rem" : "1rem",
              color: "text.primary",
            }}
          >
            Updates & Reminders
          </Typography>
          <IconButton
            onClick={handleDialogClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Lead info strip */}
        {leadInfo && (
          <Box
            sx={{
              px: 2.5,
              pb: 1.25,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
          {isMobile && (
            <ChevronLeftIcon 
              onClick={handleDialogClose}
              sx={{ cursor: "pointer", ml: -1 }}
            />
          )}

            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.75rem",
                fontWeight: 700,
                bgcolor: "#eff6ff",
                color: "#2563eb",
                border: "1.5px solid #dbeafe",
              }}
            >
              {leadInfo.fullName
                ? leadInfo.fullName.substring(0, 2).toUpperCase()
                : "?"}
            </Avatar>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <Typography
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#111827",
                    lineHeight: 1.3,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flexShrink: 1,
                  }}
                >
                  {leadInfo.fullName || "Unknown Lead"}
                </Typography>
                <Box
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    ml: 0.5,
                    bgcolor: "action.hover",
                    borderRadius: 1,
                    px: 0.8,
                    flexShrink: 0,
                    "&:hover": { bgcolor: "action.selected" },
                  }}
                >
                  <PersonAdd sx={{ fontSize: 13, color: "text.secondary", mr: 0.6 }} />
                  <Typography variant="caption" sx={{ fontSize: "0.65rem", color: "text.secondary" }}>
                    {assignedUser?.name || assignedUser?.fullName || "Unassigned"}
                  </Typography>
                  <KeyboardArrowDown sx={{ fontSize: 14, color: "text.secondary" }} />
                </Box>
              </Box>

              <AssignedDropdown
                assignedTo={assignedUser}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                onAssign={handleAssignUser}
                managerId={leadInfo.managerId}
              />
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap", mt: 0.5 }}>
                {leadInfo.phone && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <Phone sx={{ fontSize: 13, color: "#6b7280" }} />
                    <Typography
                      component="a"
                      href={`tel:${leadInfo.phone}`}
                      sx={{
                        fontSize: "0.7rem",
                        color: "#6b7280",
                        textDecoration: "none",
                        "&:hover": { color: "#2563eb" },
                      }}
                    >
                      {leadInfo.phone}
                    </Typography>
                  </Box>
                )}
                {leadInfo.budgetRange && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
                    <TrendingUp sx={{ fontSize: 13, color: "#6b7280" }} />
                    <Typography
                      sx={{
                        fontSize: "0.68rem",
                        color: "#6b7280",
                        fontWeight: 500,
                      }}
                    >
                      {leadInfo.budgetRange}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </Box>
        </div>
    );
}