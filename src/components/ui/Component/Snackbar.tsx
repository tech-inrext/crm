import React, { ReactElement } from "react";
import Snackbar, { SnackbarProps } from "@mui/material/Snackbar";

interface SnackbarComponentProps extends Omit<SnackbarProps, 'children'> {
  children?: ReactElement<unknown, any>;
}

const SnackbarComponent: React.FC<SnackbarComponentProps> = ({
  children,
  ...props
}) => {
  return <Snackbar {...props}>{children}</Snackbar>;
};

export default SnackbarComponent;