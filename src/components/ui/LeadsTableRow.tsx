import React from "react";
import { TableCell, TableRow, IconButton } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { Lead } from "../../app/dashboard/Leads";
import PermissionGuard from "../PermissionGuard";

interface LeadsTableRowProps {
  row: Lead;
  header: any[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const LeadsTableRow: React.FC<LeadsTableRowProps> = ({
  row,
  header,
  onEdit,
  onDelete,
}) => (
  <TableRow
    key={row.id}
    hover
    sx={{
      bgcolor: "#fff",
      transition: "box-shadow 0.2s",
      boxShadow: 0,
      "&:hover": { boxShadow: 2, bgcolor: "#f0f4ff" },
    }}
  >
    {header.map((head) => (
      <TableCell
        key={head.label}
        sx={{
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1.5 },
          fontSize: { xs: 13, sm: 15 },
          textAlign: head.label === "Actions" ? "center" : "left",
          borderBottom: "1px solid #e3e3e3",
        }}
      >
        {head.component
          ? head.component(row, { onEdit, onDelete })
          : row[head.dataKey as keyof Lead]}
      </TableCell>
    ))}
  </TableRow>
);

export default LeadsTableRow;
