import React from "react";
import { TableHead, TableRow, TableCell } from "@mui/material";

interface LeadsTableHeaderProps {
  header: any[];
}

const LeadsTableHeader: React.FC<LeadsTableHeaderProps> = ({ header }) => (
  <TableHead>
    <TableRow sx={{ bgcolor: "#e3f2fd" }}>
      {header.map((head) => (
        <TableCell
          key={head.label}
          sx={{
            fontWeight: 700,
            color: "#1a237e",
            fontSize: { xs: 13, sm: 15 },
            borderBottom: "2px solid #90caf9",
            textAlign: head.label === "Actions" ? "center" : "left",
            px: { xs: 1, sm: 2 },
            py: { xs: 1, sm: 1.5 },
          }}
        >
          {head.label}
        </TableCell>
      ))}
    </TableRow>
  </TableHead>
);

export default LeadsTableHeader;
