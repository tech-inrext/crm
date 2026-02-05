// app/dashboard/properties/components/EmptyState.tsx
"use client";

import React from "react";
import { Paper, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";

interface EmptyStateProps {
  searchTerm: string;
  onAddProperty: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ searchTerm, onAddProperty }) => {
  return (
    <Paper sx={{ p: 4, textAlign: "center", borderRadius: "15px" }}>
      <Typography variant="h6" color="text.secondary">
        No properties found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {searchTerm
          ? `No results for "${searchTerm}"`
          : "Create your first property to get started"}
      </Typography>
      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onAddProperty}
        sx={{ mt: 2, borderRadius: "8px" }}
      >
        Add Your First Property
      </Button>
    </Paper>
  );
};

export default EmptyState;
