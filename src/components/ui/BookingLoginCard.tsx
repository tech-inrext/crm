import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
} from "@mui/material";
import { Edit, Visibility } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import { STATUS_OPTIONS } from "@/constants/bookingLogin";

interface BookingLoginCardProps {
  booking: any;
  onEdit: () => void;
  onView: () => void;
}

const BookingLoginCard: React.FC<BookingLoginCardProps> = ({
  booking,
  onEdit,
  onView,
}) => {
  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || "default";
  };

  return (
    <Card sx={{ width: "100%", mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {booking.projectName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {booking.customer1Name}
            </Typography>
          </Box>
          <Chip
            label={booking.status}
            color={getStatusColor(booking.status) as any}
            size="small"
          />
        </Box>

        <Box mb={2}>
          <Typography variant="body2">
            <strong>Unit:</strong> {booking.unitNo} | <strong>Area:</strong> {booking.area} sq ft
          </Typography>
          <Typography variant="body2">
            <strong>Phone:</strong> {booking.phoneNo}
          </Typography>
          {booking.email && (
            <Typography variant="body2">
              <strong>Email:</strong> {booking.email}
            </Typography>
          )}
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            Created by: {booking.createdBy?.name}
          </Typography>
          
          <Box>
            <IconButton size="small" onClick={onView} color="primary">
              <Visibility />
            </IconButton>
            <PermissionGuard module="booking-login" action="write" fallback={null}>
              <IconButton size="small" onClick={onEdit} color="secondary">
                <Edit />
              </IconButton>
            </PermissionGuard>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingLoginCard;


