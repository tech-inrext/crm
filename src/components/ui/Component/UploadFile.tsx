import React from 'react';
import { UploadFile as MuiUploadFile } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface UploadFileProps extends SvgIconProps {}

const UploadFile: React.FC<UploadFileProps> = (props) => {
  return <MuiUploadFile {...props} />;
};

export default UploadFile;