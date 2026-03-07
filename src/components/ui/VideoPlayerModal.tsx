// components/ui/VideoPlayerModal.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import { Close, YouTube as YouTubeIcon } from "@mui/icons-material";
import { TrainingVideo } from "@/types/trainingVideo";
import { YouTubePlayer } from "./YouTubePlayer";
import { LocalVideoPlayer } from "./LocalVideoPlayer";
import { VideoControls } from "./VideoControls";
import { VideoInfo } from "./VideoInfo";
import { 
  isYouTubeUrl, 
  PLAYER_STATES
} from "./constants";

interface VideoPlayerModalProps {
  open: boolean;
  video: TrainingVideo | null;
  onClose: () => void;
}

interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number;
  bufferProgress: number;
  isLoading: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  hasError: boolean;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  open,
  video,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isYouTube, setIsYouTube] = useState<boolean>(false);
  const [playerState, setPlayerState] = useState<PlayerState>({
    isPlaying: false,
    isMuted: false,
    volume: 100,
    progress: 0,
    bufferProgress: 0,
    isLoading: false,
    isFullscreen: false,
    showControls: true,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    hasError: false,
  });
  
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (open && video) {
      setIsYouTube(isYouTubeUrl(video.videoUrl));
      setPlayerState(prev => ({
        ...prev,
        hasError: false,
        isLoading: true,
      }));
    }
  }, [open, video]);

  const handleMouseMove = () => {
    setPlayerState(prev => ({ ...prev, showControls: true }));
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (playerState.isPlaying) {
        setPlayerState(prev => ({ ...prev, showControls: false }));
      }
    }, 3000);
  };

  const handleYouTubeStateChange = (state: number) => {
    switch (state) {
      case PLAYER_STATES.PLAYING:
        setPlayerState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
        break;
      case PLAYER_STATES.PAUSED:
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        break;
      case PLAYER_STATES.ENDED:
        setPlayerState(prev => ({ ...prev, isPlaying: false, progress: 100 }));
        break;
      case PLAYER_STATES.BUFFERING:
        setPlayerState(prev => ({ ...prev, isLoading: true }));
        break;
    }
  };

  const handleLocalPlayerEvent = (event: string) => {
    switch (event) {
      case 'loaded':
        setPlayerState(prev => ({ ...prev, isLoading: false }));
        break;
      case 'waiting':
        setPlayerState(prev => ({ ...prev, isLoading: true }));
        break;
      case 'playing':
        setPlayerState(prev => ({ ...prev, isLoading: false, isPlaying: true }));
        break;
      case 'pause':
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
        break;
      case 'ended':
        setPlayerState(prev => ({ ...prev, isPlaying: false, progress: 100 }));
        break;
    }
  };

  const updatePlayerState = (updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    updatePlayerState({ volume: newVolume, isMuted: newVolume === 0 });
  };

  const handleVolumeToggle = () => {
    updatePlayerState(prev => ({ 
      ...prev, 
      isMuted: !prev.isMuted,
      volume: prev.isMuted ? 100 : 0 
    }));
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const newProgress = newValue as number;
    updatePlayerState({ progress: newProgress });
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        updatePlayerState({ isFullscreen: true });
      } else {
        await document.exitFullscreen();
        updatePlayerState({ isFullscreen: false });
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    updatePlayerState({ playbackRate: rate });
    setSettingsAnchorEl(null);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleVideoError = () => {
    updatePlayerState({ isLoading: false, hasError: true });
  };

  const handleRetry = () => {
    updatePlayerState({ hasError: false, isLoading: true });
  };

  if (!video) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={playerState.isFullscreen}
      onMouseMove={handleMouseMove}
      sx={styles.dialog}
    >
      <DialogContent 
        ref={containerRef}
        sx={styles.dialogContent}
      >
        <IconButton
          onClick={onClose}
          sx={styles.closeButton(playerState.showControls)}
        >
          <Close />
        </IconButton>

        {isYouTube && (
          <Box sx={styles.youtubeBadge}>
            <YouTubeIcon sx={{ fontSize: 20, color: "white", mr: 0.5 }} />
            <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
              YouTube
            </Typography>
          </Box>
        )}

        <Box sx={styles.videoContainer}>
          {isYouTube ? (
            <YouTubePlayer
              videoUrl={video.videoUrl}
              isPlaying={playerState.isPlaying}
              isLoading={playerState.isLoading}
              hasError={playerState.hasError}
              onStateChange={handleYouTubeStateChange}
              onError={handleVideoError}
              onPlayPause={() => updatePlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
              onRetry={handleRetry}
              onClose={onClose}
            />
          ) : (
            <LocalVideoPlayer
              videoUrl={video.videoUrl}
              thumbnailUrl={video.thumbnailUrl}
              isPlaying={playerState.isPlaying}
              isLoading={playerState.isLoading}
              hasError={playerState.hasError}
              currentTime={playerState.currentTime}
              duration={playerState.duration}
              progress={playerState.progress}
              bufferProgress={playerState.bufferProgress}
              volume={playerState.volume}
              isMuted={playerState.isMuted}
              playbackRate={playerState.playbackRate}
              showControls={playerState.showControls}
              onTimeUpdate={() => {}}
              onProgress={() => {}}
              onEnded={() => handleLocalPlayerEvent('ended')}
              onLoaded={() => handleLocalPlayerEvent('loaded')}
              onWaiting={() => handleLocalPlayerEvent('waiting')}
              onPlaying={() => handleLocalPlayerEvent('playing')}
              onPause={() => handleLocalPlayerEvent('pause')}
              onError={handleVideoError}
              onPlayPause={() => updatePlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
              onRetry={handleRetry}
              onClose={onClose}
            />
          )}

          {!isYouTube && !playerState.isLoading && !playerState.hasError && (
            <VideoControls
              {...playerState}
              isYouTube={isYouTube}
              onPlayPause={() => updatePlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
              onVolumeToggle={handleVolumeToggle}
              onVolumeChange={handleVolumeChange}
              onProgressChange={handleProgressChange}
              onFullscreen={handleFullscreen}
              onPlaybackRateChange={handlePlaybackRateChange}
              onMouseEnter={() => updatePlayerState({ showControls: true })}
              onMouseLeave={() => {
                if (controlsTimeoutRef.current) {
                  clearTimeout(controlsTimeoutRef.current);
                }
                if (playerState.isPlaying) {
                  controlsTimeoutRef.current = setTimeout(() => {
                    updatePlayerState({ showControls: false });
                  }, 2000);
                }
              }}
              settingsAnchorEl={settingsAnchorEl}
              onSettingsClick={handleSettingsClick}
              onSettingsClose={handleSettingsClose}
            />
          )}
        </Box>

        <VideoInfo video={video} />
      </DialogContent>
    </Dialog>
  );
};

const styles = {
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: (isFullscreen: boolean) => isFullscreen ? 0 : 2,
      bgcolor: "black",
      maxHeight: (isFullscreen: boolean) => isFullscreen ? '100vh' : '90vh',
      height: (isFullscreen: boolean) => isFullscreen ? '100vh' : 'auto',
      overflow: 'hidden',
    },
  },
  dialogContent: { 
    p: 0, 
    position: "relative" as const, 
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden',
  },
  closeButton: (showControls: boolean) => ({
    position: "absolute" as const,
    top: 16,
    right: 16,
    zIndex: 100,
    color: "white",
    bgcolor: "rgba(0,0,0,0.5)",
    "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
    opacity: showControls ? 1 : 0,
    transition: 'opacity 0.3s ease',
  }),
  youtubeBadge: {
    position: "absolute" as const,
    top: 16,
    left: 16,
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    bgcolor: "rgba(255, 0, 0, 0.8)",
    borderRadius: "4px",
    padding: "4px 8px",
  },
  videoContainer: { 
    flex: 1,
    position: "relative" as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'black',
  },
};

export default VideoPlayerModal;
