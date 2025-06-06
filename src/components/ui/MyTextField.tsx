import React from 'react';
import TextField, { TextFieldProps } from '@mui/material/TextField';

// Custom TextField wrapper for easy migration
const MyTextField: React.FC<TextFieldProps> = (props) => {
  return <TextField {...props} />;
};

export default MyTextField;
