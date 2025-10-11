import React from "react";
import MenuItem, { MenuItemProps } from "@mui/material/MenuItem";

const MenuItemComponent: React.FC<MenuItemProps> = (props) => {
  return <MenuItem {...props} />;
};

export default MenuItemComponent;
