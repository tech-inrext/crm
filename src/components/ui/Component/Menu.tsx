import React from "react";
import Menu, { MenuProps } from "@mui/material/Menu";

interface MenuComponentProps extends MenuProps {
  children?: React.ReactNode;
}

const MenuComponent: React.FC<MenuComponentProps> = ({
  children,
  ...props
}) => {
  return <Menu {...props}>{children}</Menu>;
};

export default MenuComponent;
