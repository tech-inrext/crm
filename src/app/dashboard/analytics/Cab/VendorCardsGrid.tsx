import React from 'react';
import Box from '@/components/ui/Component/Box';
import Card from '@/components/ui/Component/Card';
import CardContent from '@/components/ui/Component/CardContent';
import Typography from '@/components/ui/Component/Typography';

export function VendorCardsGrid({ displayVendors }) {
  return (
    <Box
      display="grid"
      gridTemplateColumns="repeat(2, 1fr)"  // 👈 FIXED 2 cards per row
      gap={2}
    >
      {displayVendors.map((vendor, idx) => {
        const paymentDueValue = Number(vendor.paymentDue) || 0;

        return (
          <Card
            key={vendor.id || idx}
            sx={{
              background: '#fff',
              borderRadius: 2,
              p: 2,
              border: '1px solid #e0e0e0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={1.5}
              borderBottom="1px solid #f0f0f0"
              pb={1}
            >
              <Typography variant="h6" sx={{ color: '#222', fontSize: '1.1rem', m: 0 }}>
                {vendor.name}
              </Typography>
            </Box>

            {/* Stats */}
            <Box display="flex" gap={1.5} mb={1.25} justifyContent="space-between">
              <Box sx={{ background: '#e8f5e9', px: 4, py: 1.75, borderRadius: 1, textAlign: 'center', minWidth: 90 }}>
                <Typography sx={{ fontWeight: 700, color: '', fontSize: '1rem' }}>{vendor.completedBookings || 0}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>Completed</Typography>
              </Box>

              <Box sx={{ background: '#fff3e0', px: 5, py: 1.75, borderRadius: 1, textAlign: 'center', minWidth: 80 }}>
                <Typography sx={{ fontWeight: 700, color: '', fontSize: '1rem' }}>{vendor.pendingBookings || 0}</Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#666' }}>Pending</Typography>
              </Box>

              <Box sx={{ background: '#ffd7d7', px: 3, py: 1.75, borderRadius: 1, textAlign: 'center', minWidth: 80 }}>
                <Typography sx={{ fontWeight: 700, color: '', fontSize: '1rem' }}>
                  ₹{paymentDueValue.toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#d32f2f' }}>Payment Due</Typography>
              </Box>

              <Box sx={{ background: '#e3f2fd', px: 2, py: 1.75, borderRadius: 1, textAlign: 'center', minWidth: 80 }}>
                <Typography sx={{ fontWeight: 700, color: '', fontSize: '1rem' }}>
                  ₹{(vendor.totalSpendings || 0).toLocaleString()}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', color: '#1976d2' }}>Total Spendings</Typography>
              </Box>
            </Box>

            <Box mt={1} sx={{ fontSize: '0.8rem', color: '#666' }}>
              📞 {vendor.phone || vendor.contactNumber || 'N/A'}

              {vendor.avp && (
                <Box mt={0.5} component="span" display="block">
                  👤 AVP: {typeof vendor.avp === 'object' ? vendor.avp.name : vendor.avp}
                </Box>
              )}

              {vendor.lastBookingDate && (
                <Box mt={0.5} component="span" display="block">
                  📅 Last: {new Date(vendor.lastBookingDate).toLocaleDateString()}
                </Box>
              )}
            </Box>
          </Card>
        );
      })}
    </Box>
  );
}
