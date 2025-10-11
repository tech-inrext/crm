import React from "react";
import List, { ListProps } from "@mui/material/List";

interface ListComponentProps extends ListProps {
  children?: React.ReactNode;
}

const ListComponent: React.FC<ListComponentProps> = ({
  children,
  ...props
}) => {
  return <List {...props}>{children}</List>;
};

export default ListComponent;