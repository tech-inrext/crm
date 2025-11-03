import { memo } from "react";
import { Chip } from "@mui/material";

// Constants
const STATUS_COLORS = {
  new: "#2196F3",
  "not interested": "#F44336",
  "not connected": "#FF5722",
  "follow-up": "#FF9800",
  "call back": "#FFC107",
  "details shared": "#9C27B0",
  "site visit done": "#673AB7",
  closed: "#4CAF50",
  default: "#757575",
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
