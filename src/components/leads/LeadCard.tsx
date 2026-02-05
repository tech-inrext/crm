import { memo, useState, useEffect } from "react";
import {
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
      <div className="relative flex flex-col h-full min-h-[340px] bg-white border border-gray-300 rounded-2xl shadow-md transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 mt-1.5 mb-2">
        {/* Ribbon */}
        <div className="absolute top-[-8px] left-[-6px] bg-green-500 text-white px-2 py-1 text-xs font-bold tracking-wide rounded-tr-lg shadow-md">
          Warm Lead
          <div className="absolute bottom-[-6px] left-0 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-green-600"></div>
        </div>

        {/* Status */}
        <div className="absolute top-1 right-1 z-10">
          <StatusDropdown
            leadId={leadId}
            currentStatus={lead.status}
            onStatusChange={onStatusChange}
            variant="chip"
            size="small"
          />
        </div>

        {/* Actions */}
        <PermissionGuard module="lead" action="write" fallback={<></>}>
          <ClickAwayListener onClickAway={() => setActionsOpen(false)}>
            <div className="absolute bottom-6 right-6 z-20">
              <SpeedDial
                ariaLabel="Lead actions"
                direction="up"
                icon={<SpeedDialIcon icon={<MoreVert />} />}
                open={actionsOpen}
                onClose={() => setActionsOpen(false)}
                FabProps={{
                  size: "small",
                  className:
                    "bg-white text-gray-500 border border-gray-300 shadow-sm hover:bg-gray-100 hover:shadow-md",
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
            </div>
          </ClickAwayListener>
        </PermissionGuard>

        <div className="p-4">
          <div className="space-y-4">
            <div>
              <h6 className="text-lg font-bold">{lead?.fullName}</h6>

              <div className="flex items-center gap-2">
                <HomeIcon className="text-sm" />
                <p className="text-xs">{lead.propertyName}</p>
              </div>

              <div className="flex items-center gap-2">
                <PinIcon className="text-sm" />
                <p className="text-xs">{lead.location}</p>
              </div>
            </div>

            <hr className="border-gray-300" />

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Email className="text-sm" />
                <p>{lead.email || "Not provided"}</p>
              </div>

              <div className="flex items-center gap-2">
                <a href={`tel:${lead.phone}`} className="no-underline">
                  <Phone className="text-sm" /> {lead.phone}
                </a>
              </div>

              <div className="flex items-center gap-2">
                <TrendingUp className="text-sm" />
                <p className="font-semibold">{lead.budgetRange}</p>
              </div>

              {/* Assigned */}
              <div
                onClick={handleAssignedClick}
                className="flex items-center justify-between border border-gray-300 rounded-lg px-4 py-2 cursor-pointer transition-colors duration-200 hover:border-blue-500 hover:bg-gray-100"
              >
                <div className="flex items-center gap-2">
                  <PersonAdd className="text-sm text-gray-500" />
                  <p className="font-semibold text-sm">
                    {assignedUser?.name ||
                      assignedUser?.fullName ||
                      "Unassigned"}
                  </p>
                </div>

                <p className="text-xs text-gray-500">▼</p>
              </div>

              <AssignedDropdown
                assignedTo={assignedUser}
                anchorEl={anchorEl}
                onClose={handleCloseMenu}
                onAssign={handleAssignUser}
              />

              {lead.nextFollowUp && (
                <div className="flex items-center gap-2">
                  <Schedule className="text-sm" />
                  <p>
                    {(() => {
                      const date = new Date(lead.nextFollowUp);
                      if (isNaN(date.getTime())) return "Invalid date";
                      return `${date.toLocaleDateString()} ${date.toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" },
                      )}`;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

LeadCard.displayName = "LeadCard";

export default LeadCard;
