import React from "react";
import { Box, CircularProgress, Typography } from "@/components/ui/Component";
import { loadingStateSx } from "./styles";

export const LoadingState: React.FC = () => (
  <Box
    sx={loadingStateSx}
  >
    <CircularProgress size={48} />
    <Typography sx={{ mt: 2, color: "text.secondary" }}>
      Loading team hierarchy...
    </Typography>
  </Box>
);
