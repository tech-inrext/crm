import React from "react";
import Drawer, { DrawerProps } from "@mui/material/Drawer";

interface DrawerComponentProps extends DrawerProps {
  children?: React.ReactNode;
}

const DrawerComponent: React.FC<DrawerComponentProps> = ({
  children,
  ...props
}) => {
  return <Drawer {...props}>{children}</Drawer>;
};

export default DrawerComponent;