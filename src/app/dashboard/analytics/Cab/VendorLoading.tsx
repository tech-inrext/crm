import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import CircularProgress from '@/components/ui/Component/CircularProgress';

export function VendorLoading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" p={5} sx={{ background: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}>
      <Box textAlign="center">
        <CircularProgress size={40} thickness={3} sx={{ color: '#1976d2', mb: 1.5 }} />
        <Typography sx={{ color: '#666', fontSize: '1rem' }}>Loading vendor data...</Typography>
      </Box>
    </Box>
  );
}
