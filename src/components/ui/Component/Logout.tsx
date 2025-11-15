import React from 'react';
import { Logout as MuiLogout } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface LogoutIconProps extends SvgIconProps {}

const Logout: React.FC<LogoutIconProps> = (props) => {
  return <MuiLogout {...props} />;
};

export default Logout;