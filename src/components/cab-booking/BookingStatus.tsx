import React from "react";
import { Select, MenuItem, Chip } from "@mui/material";
import { Booking } from "@/types/cab-booking";
import { getStatusColor, statusOptions } from "@/constants/cab-booking";

interface Props {
  booking: Booking;
  status: string;
  updating: boolean;
  isLoading: boolean;
  isSystemAdmin: boolean;
  isManager: boolean;
  onChangeStatus: (newStatus: string) => Promise<void> | void;
}

const BookingStatus: React.FC<Props> = ({
  booking,
  status,
  updating,
  isLoading,
  isSystemAdmin,
  isManager,
  onChangeStatus,
}) => {
  const canManagerEdit = isManager && status === "pending";
  const canAdminEdit = isSystemAdmin && status === "payment_due";
  const canEditStatus = canManagerEdit || canAdminEdit;

  if (canEditStatus) {
    const opts: typeof statusOptions = [];
    const currentOpt = statusOptions.find((o) => o.value === status);
    if (currentOpt) opts.push(currentOpt);

    if (canManagerEdit) {
      const approveOpt = statusOptions.find((o) => o.value === "approved");
      const rejectOpt = statusOptions.find((o) => o.value === "rejected");
      if (approveOpt && !opts.find((x) => x.value === approveOpt.value))
        opts.push(approveOpt);
      if (rejectOpt && !opts.find((x) => x.value === rejectOpt.value))
        opts.push(rejectOpt);
    }

    if (canAdminEdit) {
      const completeOpt = statusOptions.find((o) => o.value === "completed");
      if (completeOpt && !opts.find((x) => x.value === completeOpt.value))
        opts.push(completeOpt);
    }

    return (
      <Select
        value={status}
        onChange={(e) => onChangeStatus((e.target.value as string) || "")}
        size="small"
        disabled={updating || isLoading}
        sx={{
          background: getStatusColor(status),
          color: "white",
          borderRadius: "12px",
          fontWeight: 600,
          fontSize: 12,
          textTransform: "capitalize",
          minWidth: 140,
          maxWidth: 140,
          px: 1,
          boxShadow: 1,
          display: "flex",
          alignItems: "center",
          "& .MuiSelect-icon": { color: "white" },
        }}
        MenuProps={{ PaperProps: { style: { background: "#fff" } } }}
      >
        {opts.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    );
  }

  return (
    <Chip
      label={statusOptions.find((opt) => opt.value === status)?.label || status}
      sx={{
        background: getStatusColor(status),
        color: "white",
        fontWeight: 600,
        fontSize: 12,
        borderRadius: "12px",
        px: 1,
        minWidth: 140,
        maxWidth: 140,
        height: 28,
        display: "flex",
        alignItems: "center",
      }}
    />
  );
};

export default BookingStatus;
