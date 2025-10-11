import React from "react";
import ListItemButton, { ListItemButtonProps } from "@mui/material/ListItemButton";

interface ListItemButtonComponentProps extends ListItemButtonProps {
  children?: React.ReactNode;
}

const ListItemButtonComponent: React.FC<ListItemButtonComponentProps> = ({
  children,
  ...props
}) => {
  return <ListItemButton {...props}>{children}</ListItemButton>;
};

export default ListItemButtonComponent;