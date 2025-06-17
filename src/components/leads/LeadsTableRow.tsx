import React from "react";
import { TableCell, TableRow, Chip } from "@mui/material";
import type { LeadDisplay as Lead } from "../../types/lead";

interface LeadsTableRowProps {
  row: Lead;
  header: Array<{
    label: string;
    dataKey?: string;
    component?: (
      row: Lead,
      handlers: { onEdit: (lead: Lead) => void; onDelete: (lead: Lead) => void }
    ) => React.ReactNode;
  }>;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
}

const LeadsTableRow: React.FC<LeadsTableRowProps> = ({
  row,
  header,
  onEdit,
  onDelete,
}) => {
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "#2196F3";
      case "contacted":
        return "#FF9800";
      case "site visit":
        return "#9C27B0";
      case "closed":
        return "#4CAF50";
      case "dropped":
        return "#F44336";
      default:
        return "#757575";
    }
  };

  const renderCellContent = (head: (typeof header)[0], row: Lead) => {
    if (head.component) {
      return head.component(row, { onEdit, onDelete });
    }

    const value = row[head.dataKey as keyof Lead];

    // Special rendering for status
    if (head.dataKey === "status") {
      return (
        <Chip
          label={value}
          size="small"
          sx={{
            backgroundColor: getStatusColor(value as string),
            color: "white",
            fontWeight: 600,
            fontSize: "0.75rem",
            minWidth: "80px",
          }}
        />
      );
    }

    // Special rendering for value/budget
    if (head.dataKey === "value") {
      return <span style={{ fontWeight: 600, color: "#2e7d32" }}>{value}</span>;
    }

    return value;
  };

  return (
    <TableRow
      key={row.id}
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
            color: head.dataKey === "name" ? "text.primary" : "text.secondary",
          }}
        >
          {renderCellContent(head, row)}
        </TableCell>
      ))}
    </TableRow>
  );
};

export default LeadsTableRow;
