import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { TrainingVideo } from "@/types/trainingVideo";
import TrainingVideoCard from "@/components/ui/TrainingVideoCard";

interface VideoGridProps {
  videos: TrainingVideo[];
  category: string;
  getCategoryLabel: (category: string) => string;
  onPlay: (video: TrainingVideo) => void;
  onEdit: (video: TrainingVideo) => void;
  onDelete: (video: TrainingVideo) => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  category,
  getCategoryLabel,
  onPlay,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      {/* Category Header for specific category */}
      <Paper
        elevation={1}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            color: "text.primary",
            fontSize: { xs: "1.25rem", md: "1.5rem" },
          }}
        >
          {getCategoryLabel(category)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {videos.length} video{videos.length !== 1 ? 's' : ''} found
        </Typography>
      </Paper>

      {/* Videos Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: { xs: 2, md: 3 },
          mb: 3,
        }}
      >
        {videos.map((video) => (
          <TrainingVideoCard
            key={video._id}
            video={video}
            onPlay={onPlay}
            onEdit={onEdit}
            onDelete={onDelete}
            variant="grid"
          />
        ))}
      </Box>
    </>
  );
};