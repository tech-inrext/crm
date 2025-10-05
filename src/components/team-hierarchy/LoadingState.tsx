import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

export const LoadingState: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      p: 8,
    }}
  >
    <CircularProgress size={48} />
    <Typography sx={{ mt: 2, color: "text.secondary" }}>
      Loading team hierarchy...
    </Typography>
  </Box>
);
