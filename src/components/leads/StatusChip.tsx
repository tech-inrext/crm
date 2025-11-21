import { memo } from "react";
import { Chip } from "@/components/ui/Component";

// Constants
// const STATUS_COLORS = {
//   new: "#2196F3",
//   contacted: "#FF9800",
//   "site visit": "#9C27B0",
//   closed: "#4CAF50",
//   dropped: "#F44336",
//   default: "#757575",
// } as const;

const STATUS_COLORS = {
  new: "#2196F3", // Blue
  "follow-up": "#FFC107", // Amber
  "call back": "#00BCD4", // Cyan
  "not connected": "#9E9E9E", // Grey
  "details shared": "#3F51B5", // Indigo
  "site visit done": "#9C27B0", // Purple
  closed: "#4CAF50", // Green
  "not interested": "#F44336", // Red
  "": "#757575", // Default or empty status
  default: "#757575", // Fallback color
} as const;

// Utility function
const getStatusColor = (status: string): string =>
  STATUS_COLORS[status.toLowerCase() as keyof typeof STATUS_COLORS] ||
  STATUS_COLORS.default;

interface StatusChipProps {
  status: string;
}

const StatusChip = memo(({ status }: StatusChipProps) => (
  <Chip
    label={status}
    size="small"
    sx={{
      backgroundColor: getStatusColor(status),
      color: "white",
      fontWeight: 600,
      fontSize: "0.75rem",
      minWidth: "80px",
    }}
  />
));

StatusChip.displayName = "StatusChip";

export default StatusChip;
export { STATUS_COLORS, getStatusColor };
