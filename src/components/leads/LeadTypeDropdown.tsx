import React, { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LEAD_TYPES } from "@/constants/leads";
import { ExpandMore } from "@mui/icons-material";

// Color mapping for lead types
const LEAD_TYPE_COLORS = {
  "intake": "#2e7d32", // Purple - Intake
  "hot lead": "#F44336", // Red - Hot
  "warm lead": "#FF9800", // Orange - Warm
  "cold lead": "#2196F3", // Blue - Cold
  "not interested": "#9E9E9E", // Grey - Not interested
  default: "#757575",
} as const;

const getLeadTypeColor = (leadType: string): string =>
  LEAD_TYPE_COLORS[leadType.toLowerCase() as keyof typeof LEAD_TYPE_COLORS] ||
  LEAD_TYPE_COLORS.default;

interface LeadTypeDropdownProps {
  leadId: string;
  currentLeadType?: string;
  onLeadTypeChange: (leadId: string, newLeadType: string) => Promise<void>;
  disabled?: boolean;
  variant?: "chip" | "select";
  size?: "small" | "medium";
}

const LeadTypeDropdown: React.FC<LeadTypeDropdownProps> = ({
  leadId,
  currentLeadType = "intake",
  onLeadTypeChange,
  disabled = false,
  variant = "select",
  size = "small",
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const typeColor = getLeadTypeColor(currentLeadType);

  const handleLeadTypeChange = async (newLeadType: string) => {
    if (newLeadType === currentLeadType || isUpdating) return;

    setIsUpdating(true);
    try {
      await onLeadTypeChange(leadId, newLeadType);
    } catch (error) {
      console.error("Failed to update lead type:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <FormControl size={size} disabled={disabled || isUpdating}>
      <Select
        value={currentLeadType}
        onChange={(e) => handleLeadTypeChange(e.target.value)}
        IconComponent={
          isUpdating
            ? () => (
                <CircularProgress
                  size={14}
                  sx={{
                    color: typeColor,
                    mr: 1,
                    opacity: 0.8,
                  }}
                />
              )
            : ExpandMore
        }
        sx={{
          minWidth: 70,
          maxWidth: 150,
          width: "fit-content",
          height: 24,
          backgroundColor: alpha(typeColor, 0.1),
          color: typeColor,
          fontWeight: 700,
          fontSize: "0.75rem",
          borderRadius: 2,
          cursor: disabled || isUpdating ? "default" : "pointer",
          opacity: disabled || isUpdating ? 0.6 : 1,
          "& .MuiSelect-select": {
            padding: "4px 6px 4px 8px !important",
            paddingRight: "28px !important",
            minHeight: "auto !important",
            display: "flex",
            alignItems: "center",
            lineHeight: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
          "& .MuiSelect-icon": {
            color: typeColor,
            right: 4,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "1rem",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "&:hover": {
            backgroundColor: alpha(typeColor, 0.15),
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
              borderRadius: 2,
              boxShadow: "0 12px 24px rgba(0,0,0,0.12)",
              "& .MuiMenuItem-root": {
                padding: "6px 12px",
                borderRadius: 1,
                margin: "2px 6px",
                minHeight: 34,
              },
            },
          },
        }}
      >
        {LEAD_TYPES.map((leadType) => (
          <MenuItem key={leadType} value={leadType}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: getLeadTypeColor(leadType),
                boxShadow: "0 0 0 2px rgba(0,0,0,0.04)",
              }}
            />
            <Box
              component="span"
              sx={{
                ml: 1.25,
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "capitalize",
              }}
            >
              {leadType}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LeadTypeDropdown;
export { LEAD_TYPE_COLORS, getLeadTypeColor };
