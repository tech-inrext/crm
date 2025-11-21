import React from "react";
import TableContainer, { TableContainerProps } from "@mui/material/TableContainer";

interface TableContainerComponentProps extends TableContainerProps {
  children?: React.ReactNode;
}

const TableContainerComponent: React.FC<TableContainerComponentProps> = ({
  children,
  ...props
}) => {
  return <TableContainer {...props}>{children}</TableContainer>;
};

export default TableContainerComponent;