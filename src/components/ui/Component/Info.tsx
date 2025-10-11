import React from 'react';
import { Info as MuiInfo } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface InfoProps extends SvgIconProps {}

const Info: React.FC<InfoProps> = (props) => {
  return <MuiInfo {...props} />;
};

export default Info;