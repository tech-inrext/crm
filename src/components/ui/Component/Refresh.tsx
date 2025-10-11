import React from 'react';
import { Refresh as MuiRefresh } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface RefreshProps extends SvgIconProps {}

const Refresh: React.FC<RefreshProps> = (props) => {
  return <MuiRefresh {...props} />;
};

export default Refresh;