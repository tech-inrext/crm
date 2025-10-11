import React, { ReactNode } from "react";
import Dialog, { DialogProps } from "@mui/material/Dialog";

interface DialogComponentProps extends DialogProps {
  children?: ReactNode;
}

const DialogComponent: React.FC<DialogComponentProps> = ({
  children,
  ...props
}) => {
  return <Dialog {...props}>{children}</Dialog>;
};

export default DialogComponent;