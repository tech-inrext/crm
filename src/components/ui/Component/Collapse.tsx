import React from 'react';
import { Collapse as MuiCollapse } from '@mui/material';
import { CollapseProps as MuiCollapseProps } from '@mui/material/Collapse';

export interface CollapseProps extends MuiCollapseProps {}

const Collapse: React.FC<CollapseProps> = (props) => {
  return <MuiCollapse {...props} />;
};

export default Collapse;