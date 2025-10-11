import React from "react";
import TableBody, { TableBodyProps } from "@mui/material/TableBody";

interface TableBodyComponentProps extends TableBodyProps {
  children?: React.ReactNode;
}

const TableBodyComponent: React.FC<TableBodyComponentProps> = ({
  children,
  ...props
}) => {
  return <TableBody {...props}>{children}</TableBody>;
};

export default TableBodyComponent;