import React from "react";
import Table, { TableProps } from "@mui/material/Table";

interface TableComponentProps extends TableProps {
  children?: React.ReactNode;
}

const TableComponent: React.FC<TableComponentProps> = ({
  children,
  ...props
}) => {
  return <Table {...props}>{children}</Table>;
};

export default TableComponent;