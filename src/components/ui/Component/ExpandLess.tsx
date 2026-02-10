import React from 'react';
import { ExpandLess as MuiExpandLess } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ExpandLessProps extends SvgIconProps {}

const ExpandLess: React.FC<ExpandLessProps> = (props) => {
  return <MuiExpandLess {...props} />;
};

export default ExpandLess;