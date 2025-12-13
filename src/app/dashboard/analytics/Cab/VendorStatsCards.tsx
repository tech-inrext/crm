import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import Paper from '@/components/ui/Component/Paper';

export function VendorStatsCards({ displayVendors, appliedFilters }) {
  return (
    <Paper sx={{ background: '#f8f9fa', borderRadius: 2, p: 2, mb: 2, border: '1px solid #dee2e6' }} elevation={0}>
      <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(140px, 1fr))" gap={1.5} mt={1.5}>
        <Box sx={{ background: '#e3f2fd', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: '#1976d2', fontSize: '1.5rem' }}>{displayVendors.reduce((sum, v) => sum + (v.totalBookings || 0), 0)}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Total Bookings</Typography>
        </Box>
        <Box sx={{ background: '#e8f5e9', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: '#388e3c', fontSize: '1.5rem' }}>{displayVendors.reduce((sum, v) => sum + (v.completedBookings || 0), 0)}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Completed</Typography>
        </Box>
        <Box sx={{ background: '#fff3e0', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: '#f57c00', fontSize: '1.5rem' }}>{displayVendors.reduce((sum, v) => sum + (v.pendingBookings || 0), 0)}</Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>Pending</Typography>
        </Box>
        <Box sx={{ background: '#f3e5f5', p: 1.5, borderRadius: 1.5, textAlign: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: '#7b1fa2', fontSize: '1.1rem' }}>
            {appliedFilters.status === 'payment-due'
              ? `₹${displayVendors.reduce((sum, v) => sum + (v.paymentDue || 0), 0).toLocaleString()}`
              : `₹${displayVendors.reduce((sum, v) => sum + (v.totalSpendings || 0), 0).toLocaleString()}`}
          </Typography>
          <Typography sx={{ fontSize: '0.85rem', color: '#666' }}>
            {appliedFilters.status === 'payment-due' ? 'Total Payment Due' : 'Total Spendings'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
