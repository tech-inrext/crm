import React from 'react';
import { Clear as MuiClear } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ClearProps extends SvgIconProps {}

const Clear: React.FC<ClearProps> = (props) => {
  return <MuiClear {...props} />;
};

export default Clear;