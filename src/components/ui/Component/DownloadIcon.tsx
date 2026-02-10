import React from 'react';
import { Download as MuiDownload } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface DownloadIconProps extends SvgIconProps {}

const DownloadIcon: React.FC<DownloadIconProps> = (props) => {
  return <MuiDownload {...props} />;
};

export default DownloadIcon;