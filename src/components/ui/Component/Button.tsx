import React, { ReactNode } from "react";
import Button, { ButtonProps } from "@mui/material/Button";

interface ButtonComponentProps extends ButtonProps {
  children?: ReactNode;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  children,
  ...props
}) => {
  return <Button {...props}>{children}</Button>;
};

export default ButtonComponent;
