import React, { useState } from "react";
import {
  Select,
  MenuItem,
  FormControl,
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

  const alphaBg = alpha(typeColor, 0.1);
  const alphaHoverBg = alpha(typeColor, 0.15);

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
                  className="mr-2 opacity-80"
                  style={{ color: typeColor }}
                />
              )
            : (props) => (
                <ExpandMore
                  {...props}
                  style={{ color: typeColor }}
                  className={`!top-1/2 !-translate-y-1/2 !right-1 !text-base ${props.className || ""}`}
                />
              )
        }
        style={{
          backgroundColor: alphaBg,
          color: typeColor,
          ["--hover-bg" as any]: alphaHoverBg,
        }}
        className={`
          min-w-[70px] max-w-[150px] w-fit !h-6
          !font-bold !text-xs !rounded-lg
          ${disabled || isUpdating ? "!cursor-default !opacity-60" : "cursor-pointer"}
          [&_.MuiSelect-select]:!flex [&_.MuiSelect-select]:!items-center
          [&_.MuiSelect-select]:!p-[4px_6px_4px_8px] [&_.MuiSelect-select]:!pr-7
          [&_.MuiSelect-select]:!min-h-0 [&_.MuiSelect-select]:leading-none
          [&_.MuiSelect-select]:whitespace-nowrap [&_.MuiSelect-select]:overflow-hidden
          [&_.MuiSelect-select]:text-ellipsis
          [&_.MuiOutlinedInput-notchedOutline]:!border-none [&_.MuiOutlinedInput-notchedOutline]:!border-0
          !outline-none !shadow-none
          hover:!bg-[var(--hover-bg)]
        `}
        MenuProps={{
          PaperProps: {
            className: `
              max-h-[300px] !rounded-lg !shadow-[0_12px_24px_rgba(0,0,0,0.12)]
              [&_.MuiMenuItem-root]:!p-[6px_12px] [&_.MuiMenuItem-root]:!rounded
              [&_.MuiMenuItem-root]:!m-[2px_6px] [&_.MuiMenuItem-root]:!min-h-[34px]
            `,
          },
        }}
      >
        {LEAD_TYPES.map((leadType) => (
          <MenuItem key={leadType} value={leadType}>
            <div
              className="w-2.5 h-2.5 rounded-full shadow-[0_0_0_2px_rgba(0,0,0,0.04)]"
              style={{ backgroundColor: getLeadTypeColor(leadType) }}
            />
            <span className="ml-2.5 font-semibold text-[0.85rem] capitalize">
              {leadType}
            </span>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LeadTypeDropdown;
export { LEAD_TYPE_COLORS, getLeadTypeColor };
