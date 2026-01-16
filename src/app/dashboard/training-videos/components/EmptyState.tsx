import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";

interface EmptyStateProps {
  hasSearch: boolean;
  hasCategory: boolean;
  onAdd: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  hasSearch,
  hasCategory,
  onAdd,
}) => {
  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h6" color="text.secondary">
        No videos found.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {hasSearch || hasCategory ? "Try adjusting your search criteria" : "Add your first training video to get started"}
      </Typography>
      <PermissionGuard module="training-videos" action="write" fallback={null}>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={onAdd}
          sx={{ mt: 2 }}
        >
          Add First Video
        </Button>
      </PermissionGuard>
    </Box>
  );
};

