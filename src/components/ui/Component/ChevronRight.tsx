import React from 'react';
import { ChevronRight as MuiChevronRight } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ChevronRightProps extends SvgIconProps {}

const ChevronRight: React.FC<ChevronRightProps> = (props) => {
  return <MuiChevronRight {...props} />;
};

export default ChevronRight;