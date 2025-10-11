import React from "react";
import Avatar, { AvatarProps } from "@mui/material/Avatar";

interface AvatarComponentProps extends AvatarProps {
  children?: React.ReactNode;
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({
  children,
  ...props
}) => {
  return <Avatar {...props}>{children}</Avatar>;
};

export default AvatarComponent;

