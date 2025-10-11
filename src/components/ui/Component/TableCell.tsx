import React from "react";
import TableCell, { TableCellProps } from "@mui/material/TableCell";

interface TableCellComponentProps extends TableCellProps {
  children?: React.ReactNode;
}

const TableCellComponent: React.FC<TableCellComponentProps> = ({
  children,
  ...props
}) => {
  return <TableCell {...props}>{children}</TableCell>;
};

export default TableCellComponent;