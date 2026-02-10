import React from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

interface ProgressBarProps {
  uploadingVideo: boolean;
  uploadingThumbnail: boolean;
  uploadProgress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  uploadingVideo,
  uploadingThumbnail,
  uploadProgress
}) => {
  if (!uploadingVideo && !uploadingThumbnail) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={styles.progressHeader}>
        <Typography variant="body2" color="primary">
          {uploadingVideo ? 'Uploading video...' : 'Uploading thumbnail...'}
        </Typography>
        <Typography variant="body2" color="primary">
          {Math.round(uploadProgress)}%
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={uploadProgress} 
        sx={styles.progressBar}
      />
    </Box>
  );
};

const styles = {
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1
  },
  progressBar: {
    height: 8,
    borderRadius: 4
  }
} as const;