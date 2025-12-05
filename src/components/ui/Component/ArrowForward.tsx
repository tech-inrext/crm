import React from 'react';
import { ArrowForward as MuiArrowForward } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ArrowForwardProps extends SvgIconProps {}

const ArrowForward: React.FC<ArrowForwardProps> = (props) => {
  return <MuiArrowForward {...props} />;
};

export default ArrowForward;