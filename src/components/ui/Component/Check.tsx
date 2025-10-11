import React from 'react';
import { Check as MuiCheck } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface CheckProps extends SvgIconProps {}

const Check: React.FC<CheckProps> = (props) => {
  return <MuiCheck {...props} />;
};

export default Check;