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
    <Table
      stickyHeader
      size="medium"
      sx={{
        minWidth: 750,
        tableLayout: "fixed",
        borderCollapse: "separate",
        "& .MuiTableHead-root": {
          position: "sticky",
          top: 0,
          zIndex: 100,
          "& .MuiTableRow-root": {
            background:
              "linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important",
          },
        },
        "& .MuiTableBody-root": {
          "& .MuiTableRow-root:hover": {
            backgroundColor: "#f8fafc",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
            transform: "translateY(-1px)",
          },
        },
      }}
    >
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
                position: "sticky",
                top: 0,
                zIndex: 2,
                borderBottom: "none",
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
              backgroundColor: "#ffffff",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f8fafc",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                transform: "translateY(-1px)",
              },
              "& .MuiTableCell-root": {
                borderBottom: "1px solid #e0e7ff",
              },
            }}
          >
            {header.map((head) => (
              <TableCell
                key={head.label}
                sx={{
                  px: { xs: 1.5, sm: 2.5 },
                  py: { xs: 2, sm: 2.5 },
                  fontSize: { xs: 13, sm: 15 },
                  textAlign: head.label === "Actions" ? "center" : "left",
                  fontWeight: head.dataKey === "name" ? 600 : 400,
                  color:
                    head.dataKey === "name" ? "text.primary" : "text.secondary",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 180,
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
