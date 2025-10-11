import React from "react";
import { Box, Typography, AccountTree as AccountTreeIcon } from "@/components/ui/Component";

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
