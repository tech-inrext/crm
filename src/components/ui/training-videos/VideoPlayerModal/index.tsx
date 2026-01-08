"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Close, YouTube as YouTubeIcon } from "@mui/icons-material";
import { TrainingVideo } from "@/types/trainingVideo";
import { YouTubePlayer } from "./YouTubePlayer";
import { LocalVideoPlayer } from "./LocalVideoPlayer";
import { VideoControls } from "./VideoControls";
import { VideoInfo } from "./VideoInfo";
import { 
  isYouTubeUrl, 
  PLAYER_STATES,
  formatTime 
} from "./constants";

interface VideoPlayerModalProps {
  open: boolean;
  video: TrainingVideo | null;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  open,
  video,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isYouTube, setIsYouTube] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(100);
  const [progress, setProgress] = useState<number>(0);
  const [bufferProgress, setBufferProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [hasError, setHasError] = useState<boolean>(false);
  
  // Settings menu
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);

  // Controls hide timeout
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Check if video is YouTube
  useEffect(() => {
    if (open && video) {
      setIsYouTube(isYouTubeUrl(video.videoUrl));
      setHasError(false);
      setIsLoading(true);
    }
  }, [open, video]);

  // Handle mouse movement for controls visibility
  const handleMouseMove = () => {
    setShowControls(true);
    
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // YouTube player state handler
  const handleYouTubeStateChange = (state: number) => {
    switch (state) {
      case PLAYER_STATES.PLAYING:
        setIsPlaying(true);
        setIsLoading(false);
        break;
      case PLAYER_STATES.PAUSED:
        setIsPlaying(false);
        break;
      case PLAYER_STATES.ENDED:
        setIsPlaying(false);
        setProgress(100);
        break;
      case PLAYER_STATES.BUFFERING:
        setIsLoading(true);
        break;
    }
  };

  // Local video handlers
  const handleTimeUpdate = () => {
    if (!isYouTube && containerRef.current) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        const currentTime = videoElement.currentTime;
        const duration = videoElement.duration;
        
        setCurrentTime(currentTime);
        setDuration(duration);
        
        if (duration > 0) {
          const progress = (currentTime / duration) * 100;
          setProgress(progress);
        }
      }
    }
  };

  const handleProgress = () => {
    if (!isYouTube && containerRef.current) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        const buffered = videoElement.buffered;
        if (buffered.length > 0 && videoElement.duration > 0) {
          const bufferEnd = buffered.end(buffered.length - 1);
          const bufferPercent = (bufferEnd / videoElement.duration) * 100;
          setBufferProgress(bufferPercent);
        }
      }
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    
    if (!isYouTube && containerRef.current) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        videoElement.volume = newVolume / 100;
        setIsMuted(newVolume === 0);
      }
    }
  };

  const handleVolumeToggle = () => {
    if (!isYouTube && containerRef.current) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        const newMuted = !isMuted;
        videoElement.muted = newMuted;
        setIsMuted(newMuted);
        
        if (newMuted) {
          setVolume(0);
        } else {
          setVolume(100);
          videoElement.volume = 1;
        }
      }
    }
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const newProgress = newValue as number;
    setProgress(newProgress);
    
    if (!isYouTube && containerRef.current && duration > 0) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        const newTime = (newProgress / 100) * duration;
        videoElement.currentTime = newTime;
        setCurrentTime(newTime);
      }
    }
  };

  const handleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    if (!isYouTube && containerRef.current) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        videoElement.playbackRate = rate;
        setPlaybackRate(rate);
      }
    }
    setSettingsAnchorEl(null);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setProgress(100);
  };

  const handleVideoError = (event: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error("Video error:", event);
    setIsLoading(false);
    setHasError(true);
  };

  const handlePlayPause = () => {
    if (isYouTube) {
      // YouTube controls are handled in YouTubePlayer
    } else if (containerRef.current) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        if (isPlaying) {
          videoElement.pause();
        } else {
          videoElement.play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((error) => {
              console.error("Play error:", error);
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    if (containerRef.current) {
      const videoElement = containerRef.current.querySelector('video');
      if (videoElement) {
        videoElement.load();
      }
    }
  };

  if (!video) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isFullscreen}
      onMouseMove={handleMouseMove}
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: isFullscreen ? 0 : 2,
          bgcolor: "black",
          maxHeight: isFullscreen ? '100vh' : '90vh',
          height: isFullscreen ? '100vh' : 'auto',
          overflow: 'hidden',
        },
      }}
    >
      <DialogContent 
        ref={containerRef}
        sx={{ 
          p: 0, 
          position: "relative", 
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 100,
            color: "white",
            bgcolor: "rgba(0,0,0,0.5)",
            "&:hover": {
              bgcolor: "rgba(0,0,0,0.7)",
            },
            opacity: showControls ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          <Close />
        </IconButton>

        {/* YouTube Badge */}
        {isYouTube && (
          <Box
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              bgcolor: "rgba(255, 0, 0, 0.8)",
              borderRadius: "4px",
              padding: "4px 8px",
            }}
          >
            <YouTubeIcon sx={{ fontSize: 20, color: "white", mr: 0.5 }} />
            <Typography variant="caption" sx={{ color: "white", fontWeight: 600 }}>
              YouTube
            </Typography>
          </Box>
        )}

        {/* Video Container */}
        <Box 
          sx={{ 
            flex: 1,
            position: "relative",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: 'black',
          }}
        >
          {isYouTube ? (
            <YouTubePlayer
              videoUrl={video.videoUrl}
              isPlaying={isPlaying}
              isLoading={isLoading}
              hasError={hasError}
              onStateChange={handleYouTubeStateChange}
              onError={() => setHasError(true)}
              onPlayPause={handlePlayPause}
              onRetry={handleRetry}
              onClose={onClose}
            />
          ) : (
            <LocalVideoPlayer
              videoUrl={video.videoUrl}
              thumbnailUrl={video.thumbnailUrl}
              isPlaying={isPlaying}
              isLoading={isLoading}
              hasError={hasError}
              currentTime={currentTime}
              duration={duration}
              progress={progress}
              bufferProgress={bufferProgress}
              volume={volume}
              isMuted={isMuted}
              playbackRate={playbackRate}
              showControls={showControls}
              onTimeUpdate={handleTimeUpdate}
              onProgress={handleProgress}
              onEnded={handleVideoEnded}
              onLoaded={() => setIsLoading(false)}
              onWaiting={() => setIsLoading(true)}
              onPlaying={() => {
                setIsLoading(false);
                setIsPlaying(true);
              }}
              onPause={() => setIsPlaying(false)}
              onError={handleVideoError}
              onPlayPause={handlePlayPause}
              onRetry={handleRetry}
              onClose={onClose}
            />
          )}

          {/* Video Controls (for local videos only) */}
          {!isYouTube && !isLoading && !hasError && (
            <VideoControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              volume={volume}
              progress={progress}
              bufferProgress={bufferProgress}
              currentTime={currentTime}
              duration={duration}
              playbackRate={playbackRate}
              isFullscreen={isFullscreen}
              showControls={showControls}
              isYouTube={isYouTube}
              onPlayPause={handlePlayPause}
              onVolumeToggle={handleVolumeToggle}
              onVolumeChange={handleVolumeChange}
              onProgressChange={handleProgressChange}
              onFullscreen={handleFullscreen}
              onPlaybackRateChange={handlePlaybackRateChange}
              onMouseEnter={() => setShowControls(true)}
              onMouseLeave={() => {
                if (controlsTimeoutRef.current) {
                  clearTimeout(controlsTimeoutRef.current);
                }
                if (isPlaying) {
                  controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false);
                  }, 2000);
                }
              }}
              settingsAnchorEl={settingsAnchorEl}
              onSettingsClick={handleSettingsClick}
              onSettingsClose={handleSettingsClose}
            />
          )}
        </Box>

        {/* Video Info */}
        {video && <VideoInfo video={video} />}
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;