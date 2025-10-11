import React, { ReactNode } from "react";
import DialogTitle, { DialogTitleProps } from "@mui/material/DialogTitle";

interface DialogTitleComponentProps extends DialogTitleProps {
  children?: ReactNode;
}

const DialogTitleComponent: React.FC<DialogTitleComponentProps> = ({
  children,
  ...props
}) => {
  return <DialogTitle {...props}>{children}</DialogTitle>;
};

export default DialogTitleComponent;