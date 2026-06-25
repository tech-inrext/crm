import React from "react";
import { Select, MenuItem, Chip } from "@/components/ui/Component";
import { Booking } from "@/fe/pages/cab-booking/types/cab-booking";
import { getStatusColor, statusOptions } from "@/fe/pages/cab-booking/constants/cab-booking";

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
          fontSize: 11,
          textTransform: "capitalize",
          width: "fit-content",
          px: 1.5,
          boxShadow: 1,
          display: "flex",
          alignItems: "center",
          "& .MuiSelect-icon": { color: "white" },
          "& .MuiSelect-select": { pr: "24px !important", py: "4px" },
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
        fontSize: 11,
        borderRadius: "12px",
        px: 1.5,
        height: 26,
        width: "fit-content",
        display: "flex",
        alignItems: "center",
      }}
    />
  );
};

export default BookingStatus;
