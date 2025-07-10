import React from "react";
import { TableHead, TableRow, TableCell, Box } from "@mui/material";

interface LeadsTableHeaderProps {
  header: Array<{
    label: string;
    dataKey?: string;
    component?: (row: unknown, handlers: unknown) => React.ReactNode;
  }>;
}

const LeadsTableHeader: React.FC<LeadsTableHeaderProps> = ({ header }) => (
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
            // background: "transparent",
            background: "linear-gradient(to right, #667eea, #764ba2)", // ✅ match your screenshot
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
);

export default LeadsTableHeader;
