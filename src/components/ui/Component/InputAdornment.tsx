import React from 'react';
import { InputAdornment as MuiInputAdornment } from '@mui/material';
import { InputAdornmentProps as MuiInputAdornmentProps } from '@mui/material/InputAdornment';

export interface InputAdornmentProps extends MuiInputAdornmentProps {}

const InputAdornment: React.FC<InputAdornmentProps> = (props) => {
  return <MuiInputAdornment {...props} />;
};

export default InputAdornment;