import React from "react";
import { Box, Typography } from "@mui/material";
import { AccountTree as AccountTreeIcon } from "@mui/icons-material";

export const EmptyState: React.FC = () => (
  <Box sx={{ p: 4, textAlign: "center" }}>
    <AccountTreeIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
    <Typography variant="h6" sx={{ mb: 1 }}>
      No team hierarchy found
    </Typography>
    <Typography sx={{ color: "text.secondary" }}>
      Select a manager from the dropdown to view their team hierarchy.
    </Typography>
  </Box>
);
