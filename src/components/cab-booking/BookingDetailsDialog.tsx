import React from "react";
import { Dialog, DialogTitle, DialogContent } from "@mui/material";
import { Booking } from "@/types/cab-booking";
import { formatDateTime, getProjectName } from "@/constants/cab-booking";

interface BookingDetailsDialogProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({
  booking,
  open,
  onClose,
}) => {
  if (!booking) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Booking Details</DialogTitle>
      <DialogContent dividers>
        <div style={{ lineHeight: 2 }}>
          <div>
            <b>Client Name:</b> {booking.clientName}
          </div>
          <div>
            <b>Project:</b> {getProjectName(booking.project)}
          </div>
          <div>
            <b>Pickup Point:</b> {booking.pickupPoint}
          </div>
          <div>
            <b>Drop Point:</b> {booking.dropPoint}
          </div>
          <div>
            <b>Employee Name:</b> {booking.employeeName || "-"}
          </div>
          <div>
            <b>Team Leader:</b> {booking.teamLeader || "-"}
          </div>
          <div>
            <b>Requested Date/Time:</b>{" "}
            {formatDateTime(booking.requestedDateTime)}
          </div>
          <div>
            <b>Status:</b> {booking.status}
          </div>
          <div>
            <b>Driver:</b> {booking.driver || "-"}
          </div>
          <div>
            <b>Vehicle:</b> {booking.vehicle || "-"}
          </div>
          <div>
            <b>Current Location:</b> {booking.currentLocation || "-"}
          </div>
          <div>
            <b>Estimated Arrival:</b> {booking.estimatedArrival || "-"}
          </div>
          <div>
            <b>Notes:</b> {booking.notes || "-"}
          </div>
          {booking.createdAt && (
            <div>
              <b>Created At:</b> {formatDateTime(booking.createdAt)}
            </div>
          )}
          {booking.updatedAt && (
            <div>
              <b>Updated At:</b> {formatDateTime(booking.updatedAt)}
            </div>
          )}
          <div>
            <b>ID:</b> {booking._id}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailsDialog;
