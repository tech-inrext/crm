import React from 'react';
import { AccountTree as MuiAccountTree } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface AccountTreeProps extends SvgIconProps {}

const AccountTree: React.FC<AccountTreeProps> = (props) => {
  return <MuiAccountTree {...props} />;
};

export default AccountTree;