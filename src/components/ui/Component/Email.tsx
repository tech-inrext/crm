import React from 'react';
import { Email as MuiEmail } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface EmailProps extends SvgIconProps {}

const Email: React.FC<EmailProps> = (props) => {
  return <MuiEmail {...props} />;
};

export default Email;