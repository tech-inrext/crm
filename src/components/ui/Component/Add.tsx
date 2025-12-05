import React from 'react';
import { Add as MuiAdd } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface AddProps extends SvgIconProps {}

const Add: React.FC<AddProps> = (props) => {
  return <MuiAdd {...props} />;
};

export default Add;