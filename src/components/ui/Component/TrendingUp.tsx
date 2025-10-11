import React from 'react';
import { TrendingUp as MuiTrendingUp } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface TrendingUpProps extends SvgIconProps {}

const TrendingUp: React.FC<TrendingUpProps> = (props) => {
  return <MuiTrendingUp {...props} />;
};

export default TrendingUp;