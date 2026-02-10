import React from "react";
import TableRow, { TableRowProps } from "@mui/material/TableRow";

interface TableRowComponentProps extends TableRowProps {
  children?: React.ReactNode;
}

const TableRowComponent: React.FC<TableRowComponentProps> = ({
  children,
  ...props
}) => {
  return <TableRow {...props}>{children}</TableRow>;
};

export default TableRowComponent;