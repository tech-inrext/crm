"use client";

import React, { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Typography, IconButton } from "@mui/material";
import { PlayArrow, Close } from "@mui/icons-material";
import { PLAYER_STATES, extractYouTubeId } from "./constants";

interface YouTubePlayerProps {
  videoUrl: string;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  onStateChange: (state: number) => void;
  onError: () => void;
  onPlayPause: () => void;
  onRetry: () => void;
  onClose: () => void;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoUrl,
  isPlaying,
  isLoading,
  hasError,
  onStateChange,
  onError,
  onPlayPause,
  onRetry,
  onClose,
}) => {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playerReady, setPlayerReady] = useState(false);

  // Extract YouTube ID
  const youtubeId = extractYouTubeId(videoUrl);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!youtubeId) return;

    const loadYouTubeAPI = () => {
      if (window.YT) {
        createPlayer();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        createPlayer();
      };
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy();
      }
    };
  }, [youtubeId]);

  const createPlayer = () => {
    if (!youtubeId || !window.YT) return;

    try {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0, // We'll use our own controls
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            setPlayerReady(true);
            onStateChange(PLAYER_STATES.PLAYING);
          },
          onStateChange: (event: any) => {
            onStateChange(event.data);
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event.data);
            onError();
          }
        }
      });
    } catch (error) {
      console.error("Error creating YouTube player:", error);
      onError();
    }
  };

  const handlePlayPause = () => {
    if (!playerRef.current) return;

    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  if (!youtubeId) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'black',
      }}>
        <Typography color="error">
          Invalid YouTube URL
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      ref={containerRef}
      sx={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        backgroundColor: 'black',
      }}
    >
      {/* YouTube Player Container */}
      <Box
        id="youtube-player"
        sx={{
          width: '100%',
          height: '100%',
        }}
      />

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
            Could not load the YouTube video. Please check the video URL or try again.
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

      {/* Play/Pause Overlay for YouTube */}
      {!isPlaying && !isLoading && !hasError && playerReady && (
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
          onClick={handlePlayPause}
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