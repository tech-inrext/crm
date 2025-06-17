import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

const MyLoader: React.FC = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
    <CircularProgress />
  </Box>
);

export default MyLoader;
