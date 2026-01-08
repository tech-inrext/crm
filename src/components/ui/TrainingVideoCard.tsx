// components/ui/TrainingVideoCard.tsx
import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  Menu,
  MenuItem,
} from "@mui/material";
import { PlayArrow, Edit, Delete, MoreVert, YouTube } from "@mui/icons-material";
import { TrainingVideo } from "@/types/trainingVideo";
import PermissionGuard from "@/components/PermissionGuard";

interface TrainingVideoCardProps {
  video: TrainingVideo;
  onPlay: (video: TrainingVideo) => void;
  onEdit: (video: TrainingVideo) => void;
  onDelete: (video: TrainingVideo) => void;
  variant?: "list" | "grid";
}

const TrainingVideoCard: React.FC<TrainingVideoCardProps> = ({
  video,
  onPlay,
  onEdit,
  onDelete,
  variant = "grid",
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePlay = () => {
    onPlay(video);
  };

  const handleEdit = () => {
    onEdit(video);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(video);
    handleMenuClose();
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: { [key: string]: string } = {
      "basic-sales-training-fundamentals": "Sales Fundamentals",
      "team-building": "Team Building",
      "growth-model": "Growth Model",
      "basic-fundamentals-of-real-estate": "Real Estate Basics",
      "company-code-of-conduct-rules-compliances": "Company Code & RERA",
    };
    return categoryLabels[category] || category;
  };

  const formatDate = (dateString: string) => {
    if (typeof window === "undefined") {
      return "Recently";
    }
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {/* Thumbnail with Play Button */}
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={video.thumbnailUrl || "/default-thumbnail.jpg"}
          alt={video.title}
          sx={{
            objectFit: "cover",
          }}
          onClick={handlePlay}
        />

        {/* YouTube Badge */}
        {video.isYouTube && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(255, 0, 0, 0.85)",
              borderRadius: "4px",
              padding: "2px 6px",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              zIndex: 2,
            }}
          >
            <YouTube sx={{ fontSize: 14, color: "white" }} />
            <Typography variant="caption" sx={{ color: "white", fontWeight: 500 }}>
              YouTube
            </Typography>
          </Box>
        )}

        {/* Play Button Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.3s ease",
            "&:hover": {
              opacity: 1,
            },
          }}
          onClick={handlePlay}
        >
          <IconButton
            sx={{
              backgroundColor: "rgba(255,255,255,0.9)",
              "&:hover": {
                backgroundColor: "white",
                transform: "scale(1.1)",
              },
              transition: "all 0.3s ease",
            }}
            size="large"
          >
            <PlayArrow sx={{ color: "primary.main", fontSize: 40 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Card Content */}
      <CardContent sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}>
        {/* Title and Menu */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: "1rem",
              lineHeight: 1.3,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
              mr: 1,
            }}
          >
            {video.title}
          </Typography>

          {/* Action Menu */}
          <PermissionGuard
            module="training-videos"
            action="write"
            fallback={null}
          >
            <IconButton
              size="small"
              onClick={handleMenuClick}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  backgroundColor: "action.hover",
                  color: "text.primary",
                },
              }}
            >
              <MoreVert />
            </IconButton>
          </PermissionGuard>
        </Box>

        {/* Description */}
        {video.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
            }}
          >
            {video.description}
          </Typography>
        )}

        {/* Footer */}
        <Box sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          mt: "auto"
        }}>
          <Typography variant="caption" color="text.secondary">
            {formatDate(video.uploadDate)}
          </Typography>
        </Box>
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem onClick={handlePlay}>
          <PlayArrow sx={{ mr: 1 }} fontSize="small" />
          Play Video
        </MenuItem>
        <PermissionGuard
          module="training-videos"
          action="write"
          fallback={null}
        >
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} fontSize="small" />
            Edit Video
          </MenuItem>
        </PermissionGuard>
        <PermissionGuard
          module="training-videos"
          action="delete"
          fallback={null}
        >
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete Video
          </MenuItem>
        </PermissionGuard>
      </Menu>
    </Card>
  );
};

export default TrainingVideoCard;

