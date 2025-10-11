import React from 'react';
import { MonetizationOn as MuiMonetizationOn } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface MonetizationOnProps extends SvgIconProps {}

const MonetizationOn: React.FC<MonetizationOnProps> = (props) => {
  return <MuiMonetizationOn {...props} />;
};

export default MonetizationOn;