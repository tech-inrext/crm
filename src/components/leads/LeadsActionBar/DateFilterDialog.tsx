// src/components/leads/LeadsActionBar/DateFilterDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@/components/ui/Component";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { FilterState } from "../types/LeadsActionBarTypes";

interface DateFilterDialogProps {
  open: boolean;
  onClose: () => void;
  tempDateRange: FilterState["tempDateRange"];
  onTempDateRangeChange: (dateRange: FilterState["tempDateRange"]) => void;
  onApply: () => void;
  onClear: () => void;
}

const DateFilterDialog: React.FC<DateFilterDialogProps> = ({
  open,
  onClose,
  tempDateRange,
  onTempDateRangeChange,
  onApply,
  onClear,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="pb-1 font-semibold">Filter by Date Range</DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="flex flex-col gap-2 mt-1">
            <DatePicker
              label="Start Date"
              value={tempDateRange.startDate}
              onChange={(newValue) =>
                onTempDateRangeChange({ ...tempDateRange, startDate: newValue })
              }
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
            <DatePicker
              label="End Date"
              value={tempDateRange.endDate}
              onChange={(newValue) =>
                onTempDateRangeChange({ ...tempDateRange, endDate: newValue })
              }
              minDate={tempDateRange.startDate || undefined}
              slotProps={{ textField: { fullWidth: true, size: "small" } }}
            />
          </div>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions className="px-3 pb-2 gap-1">
        <Button onClick={onClear} color="error" variant="outlined" size="small">
          Clear
        </Button>
        <Button onClick={onClose} variant="outlined" size="small">
          Cancel
        </Button>
        <Button
          onClick={onApply}
          variant="contained"
          size="small"
          disabled={!tempDateRange.startDate && !tempDateRange.endDate}
        >
          Apply Filter
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateFilterDialog;