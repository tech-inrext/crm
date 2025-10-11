import React from 'react';
import { Visibility as MuiVisibility } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface VisibilityProps extends SvgIconProps {}

const Visibility: React.FC<VisibilityProps> = (props) => {
  return <MuiVisibility {...props} />;
};

export default Visibility;