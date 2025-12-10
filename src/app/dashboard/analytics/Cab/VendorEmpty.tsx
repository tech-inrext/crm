import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';

export function VendorEmpty({ appliedFilters, monthOptions }) {
  return (
    <Box sx={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 1.5, p: 2, color: '#856404', textAlign: 'center' }}>
      <Typography sx={{ fontWeight: 600, mb: 1 }}>
        🔍 No vendors found matching your filters
      </Typography>
      <Box sx={{ fontSize: '0.9rem', mb: 1 }}>
        {(appliedFilters.month !== 'all' || appliedFilters.year !== 'all') && (
          <Box sx={{ mb: 0.5 }}>
            <span role="img" aria-label="calendar">📅</span> <strong>No cab booking data found for {[ 
              appliedFilters.month !== 'all' ? monthOptions.find(m => m.value === appliedFilters.month)?.label : null,
              appliedFilters.year !== 'all' ? appliedFilters.year : null
            ].filter(Boolean).join(' ')}</strong>
          </Box>
        )}
        {appliedFilters.status !== 'all' && (
          <Box sx={{ mb: 0.5 }}>
            <span role="img" aria-label="status">📋</span> No vendors with <strong>{appliedFilters.status}</strong> bookings
          </Box>
        )}
        {appliedFilters.avp !== 'all' && (
          <Box sx={{ mb: 0.5 }}>
            <span role="img" aria-label="avp">👤</span> No vendors assigned to selected AVP
          </Box>
        )}
      </Box>
      <Typography sx={{ fontSize: '0.9rem' }}>
        Try selecting a different filter or reset filters to see all vendors.
      </Typography>
    </Box>
  );
}
