import React from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { SvgIconProps } from "@mui/material/SvgIcon";

interface MenuIconComponentProps extends SvgIconProps {}

const MenuIconComponent: React.FC<MenuIconComponentProps> = (props) => {
  return <MenuIcon {...props} />;
};

export default MenuIconComponent;
