import React from "react";
import { Box, Typography, Button } from "@/components/ui/Component";
import { RefreshIcon as RefreshIcon } from "@/components/ui/Component";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => (
  <Box sx={{ p: 4, textAlign: "center" }}>
    <Typography color="error" variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
      {error}
    </Typography>
    <Typography sx={{ color: "text.secondary", mb: 3 }}>
      Try selecting a different manager or refreshing the page.
    </Typography>
    <Button variant="contained" startIcon={<RefreshIcon />} onClick={onRetry}>
      Try Again
    </Button>
  </Box>
);
