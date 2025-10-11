import React from 'react';
import { Security as MuiSecurity } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface SecurityIconProps extends SvgIconProps {}

const Security: React.FC<SecurityIconProps> = (props) => {
  return <MuiSecurity {...props} />;
};

export default Security;