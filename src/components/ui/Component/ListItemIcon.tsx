import React from "react";
import ListItemIcon, { ListItemIconProps } from "@mui/material/ListItemIcon";

interface ListItemIconComponentProps extends ListItemIconProps {
  children?: React.ReactNode;
}

const ListItemIconComponent: React.FC<ListItemIconComponentProps> = ({
  children,
  ...props
}) => {
  return <ListItemIcon {...props}>{children}</ListItemIcon>;
};

export default ListItemIconComponent;