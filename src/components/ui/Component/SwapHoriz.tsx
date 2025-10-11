import React from 'react';
import { SwapHoriz as MuiSwapHoriz } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface SwapHorizIconProps extends SvgIconProps {}

const SwapHoriz: React.FC<SwapHorizIconProps> = (props) => {
  return <MuiSwapHoriz {...props} />;
};

export default SwapHoriz;