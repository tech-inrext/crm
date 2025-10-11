import React from 'react';
import { Refresh as MuiRefresh } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface RefreshIconProps extends SvgIconProps {}

const RefreshIcon: React.FC<RefreshIconProps> = (props) => {
  return <MuiRefresh {...props} />;
};

export default RefreshIcon;