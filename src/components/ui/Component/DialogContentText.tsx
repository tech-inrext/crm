import React from 'react';
import { DialogContentText as MuiDialogContentText } from '@mui/material';
import { DialogContentTextProps as MuiDialogContentTextProps } from '@mui/material/DialogContentText';

export interface DialogContentTextProps extends MuiDialogContentTextProps {}

const DialogContentText: React.FC<DialogContentTextProps> = (props) => {
  return <MuiDialogContentText {...props} />;
};

export default DialogContentText;