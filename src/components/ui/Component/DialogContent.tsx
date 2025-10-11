import React, { ReactNode } from "react";
import DialogContent, { DialogContentProps } from "@mui/material/DialogContent";

interface DialogContentComponentProps extends DialogContentProps {
  children?: ReactNode;
}

const DialogContentComponent: React.FC<DialogContentComponentProps> = ({
  children,
  ...props
}) => {
  return <DialogContent {...props}>{children}</DialogContent>;
};

export default DialogContentComponent;