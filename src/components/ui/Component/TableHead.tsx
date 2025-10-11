import React from "react";
import TableHead, { TableHeadProps } from "@mui/material/TableHead";

interface TableHeadComponentProps extends TableHeadProps {
  children?: React.ReactNode;
}

const TableHeadComponent: React.FC<TableHeadComponentProps> = ({
  children,
  ...props
}) => {
  return <TableHead {...props}>{children}</TableHead>;
};

export default TableHeadComponent;