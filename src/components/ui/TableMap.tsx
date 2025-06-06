import React, { useMemo } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";

export interface TableActionHandlers<T> {
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
}

export interface Employee {
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  // add more fields if necessary
}
interface TableHeader<T> {
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
    <Table size="small">
      <TableHead>
        <TableRow>
          {header.map((head) => (
            <TableCell key={head.label}>{head.label}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row: T) => (
          <TableRow key={(row as { _id: string })._id} hover>
            {header.map((head) => (
              <TableCell key={head.label}>
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

export default React.memo(TableMap);
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