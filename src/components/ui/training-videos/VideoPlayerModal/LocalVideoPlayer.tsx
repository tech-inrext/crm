"use client";

import React, { useRef } from "react";
import { Box, CircularProgress, Typography, IconButton } from "@mui/material";
import { PlayArrow, Close } from "@mui/icons-material";

interface LocalVideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  bufferProgress: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  showControls: boolean;
  onTimeUpdate: () => void;
  onProgress: () => void;
  onEnded: () => void;
  onLoaded: () => void;
  onWaiting: () => void;
  onPlaying: () => void;
  onPause: () => void;
  onError: (event: React.SyntheticEvent<HTMLVideoElement, Event>) => void;
  onPlayPause: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const LocalVideoPlayer: React.FC<LocalVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  isPlaying,
  isLoading,
  hasError,
  currentTime,
  duration,
  progress,
  bufferProgress,
  volume,
  isMuted,
  playbackRate,
  showControls,
  onTimeUpdate,
  onProgress,
  onEnded,
  onLoaded,
  onWaiting,
  onPlaying,
  onPause,
  onError,
  onPlayPause,
  onRetry,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          onPlaying();
        })
        .catch((error) => {
          console.error("Auto-play failed:", error);
          onPause();
        });
    }
    onLoaded();
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      backgroundColor: 'black',
    }}>
      {/* Video Element */}
      <video
        ref={videoRef}
        controls={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: 'contain',
          cursor: 'pointer',
        }}
        poster={thumbnailUrl}
        onTimeUpdate={onTimeUpdate}
        onProgress={onProgress}
        onEnded={onEnded}
        onLoadedData={handleVideoLoaded}
        onCanPlay={onLoaded}
        onWaiting={onWaiting}
        onPlaying={onPlaying}
        onPause={onPause}
        onError={onError}
        onClick={onPlayPause}
        playsInline
        preload="metadata"
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 10,
          }}
        >
          <CircularProgress sx={{ color: "white" }} />
          <Typography sx={{ color: 'white', ml: 2 }}>
            Loading video...
          </Typography>
        </Box>
      )}

      {/* Error Overlay */}
      {hasError && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: 'column',
            backgroundColor: "rgba(0,0,0,0.9)",
            zIndex: 10,
            p: 3,
          }}
        >
          <Typography variant="h6" sx={{ color: 'error.main', mb: 2 }}>
            Error loading video
          </Typography>
          <Typography sx={{ color: 'white', mb: 3, textAlign: 'center' }}>
            Could not load the video. Please check the video URL or try again.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <IconButton
              onClick={onRetry}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              <PlayArrow />
            </IconButton>
            <IconButton
              onClick={onClose}
              sx={{
                backgroundColor: 'error.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'error.dark',
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isLoading && !hasError && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: 'pointer',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 5,
          }}
          onClick={onPlayPause}
        >
          <IconButton
            sx={{
              backgroundColor: "rgba(0,0,0,0.7)",
              color: "white",
              width: 80,
              height: 80,
              "&:hover": {
                backgroundColor: "rgba(0,0,0,0.9)",
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            <PlayArrow sx={{ fontSize: 40 }} />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};