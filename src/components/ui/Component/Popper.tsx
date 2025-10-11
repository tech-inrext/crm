import React from 'react';
import { Popper as MuiPopper, PopperProps as MuiPopperProps } from '@mui/material';

export interface PopperProps extends MuiPopperProps {}

const Popper: React.FC<PopperProps> = (props) => {
  return <MuiPopper {...props} />;
};

export default Popper;