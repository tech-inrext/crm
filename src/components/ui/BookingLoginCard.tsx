// components/ui/BookingLoginCard.tsx

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Button,
} from "@mui/material";
import { Edit, Visibility, Check, Close, Delete } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import { STATUS_OPTIONS } from "@/constants/bookingLogin";

interface BookingLoginCardProps {
  booking: any;
  onEdit: () => void;
  onView: () => void;
  onDelete: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  hasAccountsRole: boolean;
}

const BookingLoginCard: React.FC<BookingLoginCardProps> = ({
  booking,
  onEdit,
  onView,
  onDelete,
  onApprove,
  onReject,
  hasAccountsRole,
}) => {
  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(opt => opt.value === status);
    return statusOption?.color || "default";
  };

  return (
    <Card 
      sx={{ 
        width: "100%", 
        mb: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {booking.projectName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {booking.customer1Name}
            </Typography>
          </Box>
          <Chip
            label={booking.status?.toUpperCase() || 'DRAFT'}
            color={getStatusColor(booking.status) as any}
            size="small"
            variant="filled"
          />
        </Box>

        <Box mb={2}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Unit:</strong> {booking.unitNo} | <strong>Area:</strong> {booking.area} sq ft
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Phone:</strong> {booking.phoneNo}
          </Typography>
          {booking.email && (
            <Typography variant="body2">
              <strong>Email:</strong> {booking.email}
            </Typography>
          )}
        </Box>

        {/* Approve/Reject buttons for Accounts role */}
        {onApprove && onReject && booking.status === 'submitted' && (
          <Box display="flex" gap={1} mb={2}>
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Check />}
              onClick={onApprove}
              fullWidth
              sx={{ py: 0.8 }}
            >
              Approve
            </Button>
            <Button
              size="small"
              variant="contained"
              color="error"
              startIcon={<Close />}
              onClick={onReject}
              fullWidth
              sx={{ py: 0.8 }}
            >
              Reject
            </Button>
          </Box>
        )}

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {booking.createdBy?.name ? `Created by: ${booking.createdBy.name}` : ''}
          </Typography>
          
          <Box display="flex" gap={0.5}>
            <IconButton 
              size="small" 
              onClick={onView} 
              color="primary"
              sx={{ 
                backgroundColor: 'primary.light', 
                '&:hover': { backgroundColor: 'primary.main' },
                color: 'white'
              }}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <PermissionGuard module="booking-login" action="write" fallback={null}>
  <IconButton 
    size="small" 
    onClick={onEdit} 
    color="secondary"
    disabled={
      (!hasAccountsRole && booking.status !== 'draft') ||
      (hasAccountsRole && (booking.status === 'approved' || booking.status === 'rejected'))
    }
    sx={{ 
      backgroundColor: 
        ((!hasAccountsRole && booking.status !== 'draft') || 
         (hasAccountsRole && (booking.status === 'approved' || booking.status === 'rejected'))) 
          ? 'grey.300' 
          : 'secondary.light', 
      '&:hover': { 
        backgroundColor: 
          ((!hasAccountsRole && booking.status !== 'draft') || 
           (hasAccountsRole && (booking.status === 'approved' || booking.status === 'rejected'))) 
            ? 'grey.300' 
            : 'secondary.main' 
      },
      color: 'white'
    }}
    title={
      (!hasAccountsRole && booking.status !== 'draft') 
        ? "Cannot edit submitted booking. Only draft bookings can be edited." 
        : (hasAccountsRole && (booking.status === 'approved' || booking.status === 'rejected'))
          ? "Cannot edit approved or rejected bookings"
          : "Edit Booking"
    }
  >
    <Edit fontSize="small" />
  </IconButton>
</PermissionGuard>
            <PermissionGuard module="booking-login" action="delete" fallback={null}>
              <IconButton 
                size="small" 
                onClick={onDelete} 
                color="error"
                disabled={!hasAccountsRole && booking.status !== 'draft'}
                sx={{ 
                  backgroundColor: (!hasAccountsRole && booking.status !== 'draft') 
                    ? 'grey.300' 
                    : 'error.light', 
                  '&:hover': { 
                    backgroundColor: (!hasAccountsRole && booking.status !== 'draft') 
                      ? 'grey.300' 
                      : 'error.main' 
                  },
                  color: 'white'
                }}
                title={
                  (!hasAccountsRole && booking.status !== 'draft') 
                    ? "Only draft bookings can be deleted" 
                    : "Delete Booking"
                }
              >
                <Delete fontSize="small" />
              </IconButton>
            </PermissionGuard>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingLoginCard;

