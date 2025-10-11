import React from 'react';
import { AssignmentInd as MuiAssignmentInd } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface AssignmentIndProps extends SvgIconProps {}

const AssignmentInd: React.FC<AssignmentIndProps> = (props) => {
  return <MuiAssignmentInd {...props} />;
};

export default AssignmentInd;