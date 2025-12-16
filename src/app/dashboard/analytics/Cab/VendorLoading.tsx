import React from 'react';
import Box from '@/components/ui/Component/Box';
import Typography from '@/components/ui/Component/Typography';
import CircularProgress from '@/components/ui/Component/CircularProgress';

export function VendorLoading() {
  return (
    <Box className="flex justify-center items-center p-8 bg-gray-100 rounded-xl border border-gray-300">
      <Box className="text-center">
        <CircularProgress
          size={40}
          thickness={3}
          className="text-blue-600 mb-4"
        />
        <Typography className="text-gray-600 text-base">
          Loading vendor data...
        </Typography>
      </Box>
    </Box>
  );
}
