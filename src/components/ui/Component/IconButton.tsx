import React from "react";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";

interface IconButtonComponentProps extends IconButtonProps {
  children?: React.ReactNode;
}

const IconButtonComponent: React.FC<IconButtonComponentProps> = ({
  children,
  ...props
}) => {
  return <IconButton {...props}>{children}</IconButton>;
};

export default IconButtonComponent;
