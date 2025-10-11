import React, { ReactNode } from "react";
import DialogActions, { DialogActionsProps } from "@mui/material/DialogActions";

interface DialogActionsComponentProps extends DialogActionsProps {
  children?: ReactNode;
}

const DialogActionsComponent: React.FC<DialogActionsComponentProps> = ({
  children,
  ...props
}) => {
  return <DialogActions {...props}>{children}</DialogActions>;
};

export default DialogActionsComponent;