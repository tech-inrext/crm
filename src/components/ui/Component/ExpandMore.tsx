import React from 'react';
import { ExpandMore as MuiExpandMore } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ExpandMoreIconProps extends SvgIconProps {}

const ExpandMore: React.FC<ExpandMoreIconProps> = (props) => {
  return <MuiExpandMore {...props} />;
};

export default ExpandMore;