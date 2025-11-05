import React from "react";
import { TableCell, TableRow, Chip } from "@mui/material";
import type { LeadDisplay as Lead } from "../../types/lead";
import StatusDropdown from "./StatusDropdown";

interface LeadsTableRowProps {
  row: Lead;
  header: Array<{
    label: string;
    dataKey?: string;
    component?: (
      row: Lead,
      handlers: {
        onEdit: (lead: Lead) => void;
        onDelete: (lead: Lead) => void;
        onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
      }
    ) => React.ReactNode;
  }>;
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onStatusChange: (leadId: string, newStatus: string) => Promise<void>;
}

const LeadsTableRow: React.FC<LeadsTableRowProps> = ({
  row,
  header,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "new":
        return "#2196F3";
      case "not interested":
        return "#F44336";
      case "not connected":
        return "#FF5722";
      case "follow-up":
        return "#FF9800";
      case "call back":
        return "#FFC107";
      case "details shared":
        return "#9C27B0";
      case "site visit done":
        return "#673AB7";
      case "closed":
        return "#4CAF50";
      default:
        return "#757575";
    }
  };

  const renderCellContent = (head: (typeof header)[0], row: Lead) => {
    if (head.component) {
      return head.component(row, { onEdit, onDelete, onStatusChange });
    }

    const value = row[head.dataKey as keyof Lead];

    // Special rendering for status with dropdown
    if (head.dataKey === "status") {
      return (
        <StatusDropdown
          leadId={row._id || row.id || row.leadId || ""}
          currentStatus={value as string}
          onStatusChange={onStatusChange}
          variant="chip"
          size="small"
        />
      );
    }

    // Special rendering for nextFollowUp date
    if (head.dataKey === "nextFollowUp") {
      if (!value) return <span style={{ color: "#9e9e9e" }}>Not set</span>;
      const date = new Date(value as string);
      if (isNaN(date.getTime()))
        return <span style={{ color: "#f44336" }}>Invalid date</span>;
      return (
        <span style={{ fontSize: "0.875rem", color: "#424242" }}>
          {date.toLocaleDateString()}{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
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
