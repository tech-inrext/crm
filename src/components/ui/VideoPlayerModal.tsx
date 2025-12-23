// components/ui/VideoPlayerModal.tsx
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  LinearProgress,
  CircularProgress,
  Slider,
  Tooltip,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Close,
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Settings,
  Speed,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";
import { TrainingVideo } from "@/types/trainingVideo";

interface VideoPlayerModalProps {
  open: boolean;
  video: TrainingVideo | null;
  onClose: () => void;
}

// YouTube IFrame API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  open,
  video,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  
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
  const settingsOpen = Boolean(settingsAnchorEl);

  // Controls hide timeout
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // YouTube player initialization
  useEffect(() => {
    if (open && video) {
      console.log("Opening video player with video:", video);
      
      // Check if it's a YouTube video
      const youtubeRegex = /(youtube\.com|youtu\.be)/;
      const isYoutubeVideo = youtubeRegex.test(video.videoUrl);
      setIsYouTube(isYoutubeVideo);
      
      console.log("Is YouTube video?", isYoutubeVideo);
      
      if (isYoutubeVideo) {
        initializeYouTubePlayer();
      } else {
        initializeLocalPlayer();
      }
    } else {
      // Clean up when modal closes
      cleanupPlayers();
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      cleanupPlayers();
    };
  }, [open, video]);

  const cleanupPlayers = () => {
    // Clean up YouTube player
    if (youtubePlayerRef.current && youtubePlayerRef.current.destroy) {
      youtubePlayerRef.current.destroy();
      youtubePlayerRef.current = null;
    }
    
    // Clean up local video player
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = "";
    }
    
    setIsPlaying(false);
    setIsLoading(false);
  };

  const initializeYouTubePlayer = () => {
    if (!video) return;
    
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      }
      
      // Wait for API to load
      window.onYouTubeIframeAPIReady = () => {
        createYouTubePlayer();
      };
    } else {
      // API already loaded
      setTimeout(() => createYouTubePlayer(), 100);
    }
  };

  const createYouTubePlayer = () => {
    if (!video || !window.YT) return;
    
    try {
      setIsLoading(true);
      
      // Extract YouTube ID
      const youtubeId = extractYouTubeId(video.videoUrl);
      if (!youtubeId) {
        throw new Error("Could not extract YouTube video ID");
      }
      
      console.log("Creating YouTube player with ID:", youtubeId);
      
      // Create YouTube player
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          fs: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            console.log("YouTube player ready");
            setIsLoading(false);
            setIsPlaying(true);
          },
          onStateChange: (event: any) => {
            console.log("YouTube player state change:", event.data);
            switch (event.data) {
              case window.YT.PlayerState.PLAYING:
                setIsPlaying(true);
                setIsLoading(false);
                break;
              case window.YT.PlayerState.PAUSED:
                setIsPlaying(false);
                break;
              case window.YT.PlayerState.ENDED:
                setIsPlaying(false);
                setProgress(100);
                break;
              case window.YT.PlayerState.BUFFERING:
                setIsLoading(true);
                break;
            }
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event.data);
            setIsLoading(false);
            setHasError(true);
          }
        }
      });
    } catch (error) {
      console.error("Error creating YouTube player:", error);
      setIsLoading(false);
      setHasError(true);
    }
  };

  const initializeLocalPlayer = () => {
    if (!video || !videoRef.current) return;

    try {
      setIsLoading(true);
      setHasError(false);
      
      // Reset video element
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      
      // Set video source
      videoRef.current.src = video.videoUrl;
      
      // Reset states
      setCurrentTime(0);
      setProgress(0);
      setBufferProgress(0);
      setIsPlaying(false);
      
      console.log("Local video URL set:", video.videoUrl);
      
    } catch (error) {
      console.error("Error initializing local player:", error);
      setIsLoading(false);
      setHasError(true);
    }
  };

  const handleVideoLoaded = () => {
    console.log("Video loaded successfully");
    setIsLoading(false);
    setHasError(false);
    
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      
      // Try to play
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          console.log("Video started playing");
        })
        .catch((error) => {
          console.error("Auto-play failed:", error);
          setIsPlaying(false);
        });
    }
  };

  const handlePlayPause = () => {
    if (isYouTube) {
      // YouTube player controls
      if (youtubePlayerRef.current) {
        if (isPlaying) {
          youtubePlayerRef.current.pauseVideo();
        } else {
          youtubePlayerRef.current.playVideo();
        }
      }
    } else {
      // Local video player controls
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pause();
        } else {
          videoRef.current.play()
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

  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const handleTimeUpdate = () => {
    if (!isYouTube && videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      
      setCurrentTime(currentTime);
      setDuration(duration);
      
      if (duration > 0) {
        const progress = (currentTime / duration) * 100;
        setProgress(progress);
      }
    }
  };

  const handleProgress = () => {
    if (!isYouTube && videoRef.current) {
      const buffered = videoRef.current.buffered;
      if (buffered.length > 0 && videoRef.current.duration > 0) {
        const bufferEnd = buffered.end(buffered.length - 1);
        const bufferPercent = (bufferEnd / videoRef.current.duration) * 100;
        setBufferProgress(bufferPercent);
      }
    }
  };

  const handleVolumeChange = (event: Event, newValue: number | number[]) => {
    const newVolume = newValue as number;
    setVolume(newVolume);
    
    if (!isYouTube && videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      setIsMuted(newVolume === 0);
    }
  };

  const handleVolumeToggle = () => {
    if (!isYouTube && videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      
      if (newMuted) {
        setVolume(0);
      } else {
        setVolume(100);
        videoRef.current.volume = 1;
      }
    }
  };

  const handleProgressChange = (event: Event, newValue: number | number[]) => {
    const newProgress = newValue as number;
    setProgress(newProgress);
    
    if (!isYouTube && videoRef.current && duration > 0) {
      const newTime = (newProgress / 100) * duration;
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
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
    if (!isYouTube && videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
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

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds === Infinity) return "0:00";
    
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: { [key: string]: string } = {
      "basic-sales-training-fundamentals": "Basic Sales Training Fundamentals",
      "team-building": "Team Building",
      "growth-model": "Growth Model",
      "basic-fundamentals-of-real-estate": "Basic Fundamentals of Real Estate",
      "company-code-of-conduct-rules-compliances":
        "Company Code of Conduct, Rules & Compliances (RERA)",
    };
    return categoryLabels[category] || category;
  };

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
          {/* YouTube Player Container */}
          {isYouTube ? (
            <Box
              id="youtube-player"
              sx={{
                width: '100%',
                height: '100%',
              }}
            />
          ) : (
            /* Regular Video Player */
            <>
              <video
                ref={videoRef}
                controls={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: 'contain',
                  cursor: 'pointer',
                }}
                poster={video.thumbnailUrl}
                onTimeUpdate={handleTimeUpdate}
                onProgress={handleProgress}
                onEnded={handleVideoEnded}
                onLoadedData={handleVideoLoaded}
                onCanPlay={handleVideoLoaded}
                onWaiting={() => setIsLoading(true)}
                onPlaying={() => {
                  setIsLoading(false);
                  setIsPlaying(true);
                }}
                onPause={() => setIsPlaying(false)}
                onError={handleVideoError}
                onClick={handlePlayPause}
                playsInline
                preload="metadata"
              >
                <source src={video.videoUrl} type="video/mp4" />
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
                      onClick={initializeLocalPlayer}
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

              {/* Controls Overlay for local videos */}
              {!isYouTube && !isLoading && !hasError && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 2,
                    background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                    opacity: showControls ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    zIndex: 10,
                  }}
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
                >
                  {/* Progress Bar with Buffer */}
                  <Box sx={{ position: 'relative', mb: 2, mx: 1, height: 8 }}>
                    {/* Buffer Progress */}
                    <LinearProgress
                      variant="determinate"
                      value={bufferProgress}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translateY(-50%)',
                        width: '100%',
                        height: 4,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 'rgba(255,255,255,0.4)',
                        },
                      }}
                    />

                    {/* Playback Progress */}
                    <Slider
                      value={progress}
                      onChange={handleProgressChange}
                      min={0}
                      max={100}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        transform: 'translateY(-50%)',
                        width: '100%',
                        height: 4,
                        color: '#ff0000',
                        '& .MuiSlider-track': {
                          backgroundColor: '#ff0000',
                          border: 'none',
                        },
                        '& .MuiSlider-rail': {
                          backgroundColor: 'transparent',
                        },
                        '& .MuiSlider-thumb': {
                          width: 12,
                          height: 12,
                          backgroundColor: '#ff0000',
                          display: 'none',
                        },
                        '&:hover .MuiSlider-thumb': {
                          display: 'block',
                        },
                      }}
                    />
                  </Box>

                  {/* Control Buttons */}
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    color: 'white',
                    px: 1,
                  }}>
                    {/* Left Controls */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title={isPlaying ? "Pause (Space)" : "Play (Space)"}>
                        <IconButton 
                          onClick={handlePlayPause} 
                          sx={{ 
                            color: "white",
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                            }
                          }}
                        >
                          {isPlaying ? <Pause /> : <PlayArrow />}
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={isMuted ? "Unmute (m)" : "Mute (m)"}>
                        <IconButton 
                          onClick={handleVolumeToggle} 
                          sx={{ 
                            color: "white",
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                            }
                          }}
                        >
                          {isMuted ? <VolumeOff /> : <VolumeUp />}
                        </IconButton>
                      </Tooltip>

                      <Slider
                        value={volume}
                        onChange={handleVolumeChange}
                        min={0}
                        max={100}
                        sx={{
                          width: 100,
                          color: 'white',
                          '& .MuiSlider-track': {
                            backgroundColor: 'white',
                            border: 'none',
                          },
                          '& .MuiSlider-rail': {
                            backgroundColor: 'rgba(255,255,255,0.3)',
                          },
                          '& .MuiSlider-thumb': {
                            width: 12,
                            height: 12,
                            backgroundColor: 'white',
                            display: 'none',
                          },
                          '&:hover .MuiSlider-thumb': {
                            display: 'block',
                          },
                        }}
                      />

                      <Typography variant="body2" sx={{ ml: 1, minWidth: 120 }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </Typography>
                    </Box>

                    {/* Right Controls */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip title="Playback speed">
                        <IconButton 
                          onClick={handleSettingsClick} 
                          sx={{ 
                            color: "white",
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                            }
                          }}
                        >
                          <Speed />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={isFullscreen ? "Exit fullscreen (f)" : "Fullscreen (f)"}>
                        <IconButton 
                          onClick={handleFullscreen} 
                          sx={{ 
                            color: "white",
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.1)',
                            }
                          }}
                        >
                          {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              )}
            </>
          )}
        </Box>

        {/* Settings Menu for playback speed */}
        {!isYouTube && (
          <Menu
            anchorEl={settingsAnchorEl}
            open={settingsOpen}
            onClose={handleSettingsClose}
            PaperProps={{
              sx: {
                backgroundColor: 'rgba(0,0,0,0.9)',
                color: 'white',
              }
            }}
          >
            <MenuItem disabled sx={{ fontWeight: 'bold', color: 'white' }}>
              Playback Speed
            </MenuItem>
            {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
              <MenuItem
                key={rate}
                onClick={() => handlePlaybackRateChange(rate)}
                selected={playbackRate === rate}
                sx={{
                  color: playbackRate === rate ? '#ff0000' : 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  }
                }}
              >
                {rate === 1 ? 'Normal' : `${rate}x`}
              </MenuItem>
            ))}
          </Menu>
        )}

        {/* Video Info */}
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
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;

