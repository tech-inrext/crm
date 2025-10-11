import React from 'react';
import { LockReset as MuiLockReset } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface LockResetIconProps extends SvgIconProps {}

const LockReset: React.FC<LockResetIconProps> = (props) => {
  return <MuiLockReset {...props} />;
};

export default LockReset;