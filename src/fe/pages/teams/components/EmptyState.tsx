import React from "react";
import { Box, Typography, AccountTree as AccountTreeIcon } from "@/components/ui/Component";

interface EmptyStateProps {
  isSearchEmpty?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ isSearchEmpty }) => (
  <Box sx={{ p: 4, textAlign: "center" }}>
    <AccountTreeIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
    <Typography variant="h6" sx={{ mb: 1 }}>
      {isSearchEmpty ? "No team member found" : "No team hierarchy found"}
    </Typography>
    <Typography sx={{ color: "text.secondary" }}>
      {isSearchEmpty 
        ? "We couldn't find anyone matching your search in this hierarchy." 
        : "Select a manager from the dropdown to view their team hierarchy."}
    </Typography>
  </Box>
);
