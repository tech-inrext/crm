import React from 'react';
import { Work as MuiWork } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface WorkProps extends SvgIconProps {}

const Work: React.FC<WorkProps> = (props) => {
  return <MuiWork {...props} />;
};

export default Work;