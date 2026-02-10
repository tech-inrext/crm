import React from 'react';
import { Phone as MuiPhone } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material/SvgIcon';

export interface PhoneProps extends SvgIconProps {}

const Phone: React.FC<PhoneProps> = (props) => {
  return <MuiPhone {...props} />;
};

export default Phone;