"use client";

import React from "react";
import { Box, Typography } from "@mui/material";
import { UploadProgressProps } from "./types";

const UploadProgress: React.FC<UploadProgressProps> = ({
  uploadProgress,
  color = 'primary'
}) => {
  const entries = Object.entries(uploadProgress);
  if (entries.length === 0) return null;

  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: `${color}.main`, borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Upload Progress:
      </Typography>
      {entries.map(([fileId, progress]) => (
        <Box key={fileId} sx={{ mb: 1 }}>
          <Typography variant="caption" display="block">
            {fileId.split('-')[1]} - {progress}%
          </Typography>
          <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden' }}>
            <Box
              sx={{
                height: '100%',
                bgcolor: `${color}.main`,
                width: `${progress}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default UploadProgress;