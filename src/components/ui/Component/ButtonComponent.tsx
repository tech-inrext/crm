import React from "react";
import Button, { ButtonProps } from "@mui/material/Button";

const ButtonComponent: React.FC<ButtonProps> = (props) => {
  return <Button {...props} />;
};

export default ButtonComponent;
