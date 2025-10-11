import React from 'react';
import { ViewList as MuiViewList } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ViewListProps extends SvgIconProps {}

const ViewList: React.FC<ViewListProps> = (props) => {
  return <MuiViewList {...props} />;
};

export default ViewList;