import React from "react";
import { Box, Typography } from "@mui/material";
import { TrainingVideo } from "@/types/trainingVideo";
import { getCategoryLabel } from "../constants";

interface VideoInfoProps {
  video: TrainingVideo;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({ video }) => {
  return (
    <Box sx={{ 
      p: 3, 
      color: "white",
      bgcolor: 'rgba(0,0,0,0.9)',
      maxHeight: '40%',
      overflow: 'auto',
    }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        {video.title}
      </Typography>

      {video.description && (
        <Typography
          variant="body1"
          sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}
        >
          {video.description}
        </Typography>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          pt: 1,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            Uploaded by: {video.createdBy?.name || "Unknown"}
          </Typography>
          {video.createdBy?.email && (
            <Typography variant="caption" sx={{ opacity: 0.5, display: 'block' }}>
              {video.createdBy.email}
            </Typography>
          )}
        </Box>

        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          {new Date(video.uploadDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </Typography>
      </Box>
    </Box>
  );
};