import React, { useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
} from "@mui/material";

export interface TableActionHandlers<T> {
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export interface TableHeader<T> {
  label: string;
  dataKey?: keyof T;
  component?: (row: T, handlers: TableActionHandlers<T>) => React.ReactNode;
}

interface TableMapProps<T> extends TableActionHandlers<T> {
  data: T[];
  header: TableHeader<T>[];
}

function TableMap<T>({ data, header, onEdit, onDelete }: TableMapProps<T>) {
  const rows = useMemo(() => data, [data]);
  return (
    <Table stickyHeader size="medium" sx={{ minWidth: 750 }}>
      <TableHead>
        <TableRow
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "& .MuiTableCell-head": {
              borderBottom: "none",
            },
          }}
        >
          {header.map((head) => (
            <TableCell
              key={head.label}
              sx={{
                fontWeight: 800,
                color: "white",
                fontSize: { xs: 13, sm: 15, md: 16 },
                textAlign: head.label === "Actions" ? "center" : "left",
                px: { xs: 1.5, sm: 2.5 },
                py: { xs: 2, sm: 2.5 },
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                background: "transparent",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {head.label}
              </Box>
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row: T) => (
          <TableRow
            key={(row as { _id: string })._id}
            hover
            sx={{
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
              "&:nth-of-type(odd)": {
                backgroundColor: "rgba(0, 0, 0, 0.01)",
              },
            }}
          >
            {header.map((head) => (
              <TableCell
                key={head.label}
                sx={{
                  px: { xs: 1.5, sm: 2.5 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: 13, sm: 14, md: 15 },
                  textAlign: head.label === "Actions" ? "center" : "left",
                }}
              >
                {head.component
                  ? head.component(row, { onEdit, onDelete })
                  : String(row[head.dataKey as keyof T] ?? "")}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default TableMap as <T>(props: TableMapProps<T>) => React.ReactElement;
export type TableHeaderType<T> =
  | {
      label: string;
      dataKey: keyof T;
      component?: never;
    }
  | {
      label: string;
      dataKey?: never;
      component: (row: T, handlers: TableActionHandlers<T>) => React.ReactNode;
    };
