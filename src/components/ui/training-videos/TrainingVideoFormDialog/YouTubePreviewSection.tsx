/* eslint-disable react/no-unescaped-entities */
import React from "react";
import { Card, CardMedia, Typography, Box } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";
import { extractYouTubeId, getYouTubeThumbnail } from "./utils";

interface YouTubePreviewSectionProps {
  videoUrl: string;
}

export const YouTubePreviewSection: React.FC<YouTubePreviewSectionProps> = ({
  videoUrl
}) => {
  const youtubeId = extractYouTubeId(videoUrl);
  
  if (!youtubeId) return null;

  const thumbnailUrl = getYouTubeThumbnail(youtubeId);

  return (
    <Card sx={styles.previewCard}>
      <Box sx={{ display: 'flex', p: 2 }}>
        <CardMedia
          component="img"
          sx={styles.thumbnailImage}
          image={thumbnailUrl}
          alt="YouTube preview"
        />
        <Box sx={{ flex: 1 }}>
          <Box sx={styles.successRow}>
            <CheckCircle sx={styles.successIcon} />
            <Typography variant="subtitle2" color="success.main">
              YouTube video detected
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Video ID: {youtubeId}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Using YouTube's default thumbnail. You can upload a custom thumbnail below.
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

const styles = {
  previewCard: {
    mt: 2,
    border: '1px solid #e0e0e0'
  },
  thumbnailImage: {
    width: 120,
    height: 68,
    borderRadius: 1,
    mr: 2
  },
  successRow: {
    display: 'flex',
    alignItems: 'center',
    mb: 1
  },
  successIcon: {
    color: 'success.main',
    mr: 1,
    fontSize: 16
  }
} as const;