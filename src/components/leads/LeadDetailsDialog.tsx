import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Divider,
  IconButton,
  Chip,
} from "@/components/ui/Component";
import {
  Person,
  Email,
  Phone,
  Home,
  LocationOn,
  MonetizationOn,
  AssignmentInd,
  Event,
  Notes,
  Info,
  Source,
  SvgIconComponent,
} from "@mui/icons-material";
import Avatar from "@/components/ui/Component/Avatar";
import { LeadFormData } from "./LeadDialog";
import { format } from "date-fns";

interface User {
  _id: string;
  id?: string;
  name?: string;
  username?: string;
  email: string;
}

interface LeadDetailsDialogProps {
  lead: LeadFormData | null;
  open: boolean;
  onClose: () => void;
  users?: User[];
}

type StatusColor = "info" | "primary" | "success" | "error" | "default";

const STATUS_COLOR_MAP: Record<string, StatusColor> = {
  new: "info",
  contacted: "primary",
  interested: "success",
  closed: "success",
  lost: "error",
} as const;

const DATE_FORMAT = "PP p";
const DEFAULT_VALUE = "-";

interface DetailItemProps {
  icon: SvgIconComponent;
  label: string;
  value: string | null | undefined;
}

const DetailItem: React.FC<DetailItemProps> = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-1.5">
    <Icon className="opacity-70 text-gray-600" fontSize="small" />
    <div>
      <Typography
        variant="caption"
        className="block leading-none text-gray-600"
      >
        {label}
      </Typography>
      <Typography variant="body2" className="font-medium text-gray-900">
        {value || DEFAULT_VALUE}
      </Typography>
    </div>
  </div>
);

const LeadDetailsDialog: React.FC<LeadDetailsDialogProps> = ({
  lead,
  open,
  onClose,
  users = [],
}) => {
  const assignedToName = useMemo(() => {
    if (!lead?.assignedTo) return DEFAULT_VALUE;

    const assignedUser = users.find(
      (user) => user._id === lead.assignedTo || user.id === lead.assignedTo
    );

    return (
      assignedUser?.name ||
      assignedUser?.username ||
      assignedUser?.email ||
      lead.assignedTo
    );
  }, [lead?.assignedTo, users]);

  const getStatusColor = (status: string): StatusColor => {
    return STATUS_COLOR_MAP[status?.toLowerCase()] || "default";
  };

  const formattedFollowUpDate = useMemo(() => {
    if (!lead?.nextFollowUp) return "Not scheduled";
    try {
      return format(new Date(lead.nextFollowUp), DATE_FORMAT);
    } catch {
      return "Invalid date";
    }
  }, [lead?.nextFollowUp]);

  if (!lead) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        className: "rounded-3xl overflow-hidden shadow-2xl",
      }}
    >
      <DialogTitle className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold tracking-wide text-lg sm:text-xl py-2.5 px-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Person className="text-[28px]" />
          <span>Lead Details</span>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className="text-white/80 hover:text-white hover:bg-white/15"
          size="small"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24"
            viewBox="0 0 24 24"
            width="24"
            fill="currentColor"
          >
            <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers className="bg-gray-50 p-0">
        <div className="p-2.5 sm:p-4">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 bg-white p-3 rounded-2xl shadow-sm">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 text-2xl sm:text-3xl font-bold bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-lg">
              {lead.fullName ? (
                lead.fullName.substring(0, 2).toUpperCase()
              ) : (
                <Person />
              )}
            </Avatar>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <Typography
                    variant="h5"
                    className="font-extrabold text-gray-900 mb-1 text-xl sm:text-2xl"
                  >
                    {lead.fullName}
                  </Typography>
                  <div className="flex gap-1 flex-wrap items-center">
                    <Chip
                      label={lead.status}
                      size="small"
                      color={getStatusColor(lead.status) as any}
                      className="capitalize font-bold h-6 px-1"
                    />
                    {lead.source && (
                      <Chip
                        icon={<Source className="text-sm" />}
                        label={lead.source}
                        size="small"
                        variant="outlined"
                        className="h-6 text-xs border-gray-300 bg-transparent"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Contact Information Card */}
            <div className="bg-white p-3 rounded-2xl shadow-sm">
              <Typography
                variant="overline"
                className="mb-2.5 flex items-center gap-1 tracking-wider text-xs font-extrabold text-blue-600"
              >
                <AssignmentInd fontSize="small" />
                CONTACT & ASSIGNMENT
              </Typography>
              <div className="flex flex-col gap-2.5">
                <DetailItem
                  icon={Email}
                  label="Email Address"
                  value={lead.email}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone Number"
                  value={lead.phone}
                />
                <Divider className="border-dashed" />
                <DetailItem
                  icon={AssignmentInd}
                  label="Assigned Agent"
                  value={assignedToName}
                />
                <DetailItem
                  icon={Event}
                  label="Next Follow-up"
                  value={formattedFollowUpDate}
                />
              </div>
            </div>

            {/* Property Details Card */}
            <div className="bg-white p-3 rounded-2xl shadow-sm h-fit">
              <Typography
                variant="overline"
                className="mb-2.5 flex items-center gap-1 tracking-wider text-xs font-extrabold text-purple-600"
              >
                <Home fontSize="small" />
                PROPERTY CONFIGURATION
              </Typography>
              <div className="flex flex-col gap-2.5">
                <DetailItem
                  icon={Home}
                  label="Property Name"
                  value={lead.propertyName}
                />
                <DetailItem
                  icon={Info}
                  label="Property Type"
                  value={lead.propertyType}
                />
                <DetailItem
                  icon={LocationOn}
                  label="Location"
                  value={lead.location}
                />
                <DetailItem
                  icon={MonetizationOn}
                  label="Budget Range"
                  value={lead.budgetRange}
                />
              </div>
            </div>
          </div>
          {/* Notes Section */}
          {lead.followUpNotes?.length > 0 && (
            <div className="bg-white p-3 rounded-2xl shadow-sm mt-3">
              <Typography
                variant="overline"
                className="mb-2 flex items-center gap-1 tracking-wider text-xs font-extrabold text-orange-600"
              >
                <Notes fontSize="small" />
                LATEST ACTIVITY & NOTES
              </Typography>
              <div className="flex flex-col gap-1.5">
                {lead.followUpNotes
                  .slice()
                  .reverse()
                  .map((noteObj: any, idx: number) => (
                    <div
                      key={idx}
                      className={`p-2 bg-gray-50 rounded-2xl border-l-[3px] ${
                        idx === 0 ? "border-orange-400" : "border-gray-300"
                      }`}
                    >
                      <Typography variant="body2" className="text-gray-900">
                        {noteObj.note || noteObj}
                      </Typography>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default LeadDetailsDialog;
