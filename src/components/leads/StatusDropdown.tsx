import React, { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  CircularProgress,
  Chip,
} from "@mui/material";
import { LEAD_STATUSES } from "@/constants/leads";
import { getStatusColor } from "./StatusChip";
import { ExpandMore } from "@mui/icons-material";

interface StatusDropdownProps {
  leadId: string;
  currentStatus: string;
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
  disabled?: boolean;
  variant?: "chip" | "select";
  size?: "small" | "medium";
}

const StatusDropdown: React.FC<StatusDropdownProps> = ({
  leadId,
  currentStatus,
  onStatusChange,
  disabled = false,
  variant = "select",
  size = "small",
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      await onStatusChange(leadId, newStatus);
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter out empty status from dropdown options
  const statusOptions = LEAD_STATUSES.filter((status) => status !== "");

  return (
    <FormControl size={size} disabled={disabled || isUpdating}>
      <Select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        IconComponent={
          isUpdating
            ? () => (
                <CircularProgress
                  size={14}
                  sx={{
                    color: "white",
                    mr: 1,
                    opacity: 0.8,
                  }}
                />
              )
            : ExpandMore
        }
        sx={{
          minWidth: 70,
          maxWidth: 110,
          width: "fit-content",
          height: 24,
          backgroundColor: getStatusColor(currentStatus),
          color: "white",
          fontWeight: 600,
          fontSize: "0.75rem",
          borderRadius: 3,
          cursor: disabled || isUpdating ? "default" : "pointer",
          opacity: disabled || isUpdating ? 0.6 : 1,
          "& .MuiSelect-select": {
            padding: "4px 6px 4px 8px !important",
            paddingRight: "20px !important",
            minHeight: "auto !important",
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          "& .MuiSelect-icon": {
            color: "white",
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1rem",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "&:hover": {
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            opacity: disabled || isUpdating ? 0.6 : 0.9,
          },
          "&.Mui-focused": {
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              maxHeight: 300,
              "& .MuiMenuItem-root": {
                padding: "8px 16px",
              },
            },
          },
        }}
      >
        {statusOptions.map((status) => (
          <MenuItem key={status} value={status}>
            <Chip
              label={status}
              size="small"
              sx={{
                backgroundColor: getStatusColor(status),
                color: "white",
                fontWeight: 600,
                fontSize: "0.75rem",
                minWidth: "100px",
                height: 24,
                "& .MuiChip-label": {
                  padding: "0 8px",
                },
              }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default StatusDropdown;
