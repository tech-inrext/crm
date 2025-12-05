import React from 'react';
import { ViewModule as MuiViewModule } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface ViewModuleProps extends SvgIconProps {}

const ViewModule: React.FC<ViewModuleProps> = (props) => {
  return <MuiViewModule {...props} />;
};

export default ViewModule;