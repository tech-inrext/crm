import React from "react";
import Alert, { AlertProps } from "@mui/material/Alert";

const AlertComponent: React.FC<AlertProps> = (props) => {
  return <Alert {...props} />;
};

export default AlertComponent;