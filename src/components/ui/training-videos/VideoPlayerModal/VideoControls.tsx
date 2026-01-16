import React from "react";
import {
  Box,
  IconButton,
  Typography,
  Slider,
  Tooltip,
  Menu,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Speed,
} from "@mui/icons-material";
import { formatTime, PLAYBACK_RATES } from "./constants";

interface VideoControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number;
  bufferProgress: number;
  currentTime: number;
  duration: number;
  playbackRate: number;
  isFullscreen: boolean;
  showControls: boolean;
  isYouTube: boolean;
  onPlayPause: () => void;
  onVolumeToggle: () => void;
  onVolumeChange: (event: Event, newValue: number | number[]) => void;
  onProgressChange: (event: Event, newValue: number | number[]) => void;
  onFullscreen: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  settingsAnchorEl: HTMLElement | null;
  onSettingsClick: (event: React.MouseEvent<HTMLElement>) => void;
  onSettingsClose: () => void;
}

export const VideoControls: React.FC<VideoControlsProps> = ({
  isPlaying,
  isMuted,
  volume,
  progress,
  bufferProgress,
  currentTime,
  duration,
  playbackRate,
  isFullscreen,
  showControls,
  isYouTube,
  onPlayPause,
  onVolumeToggle,
  onVolumeChange,
  onProgressChange,
  onFullscreen,
  onPlaybackRateChange,
  onMouseEnter,
  onMouseLeave,
  settingsAnchorEl,
  onSettingsClick,
  onSettingsClose,
}) => {
  const settingsOpen = Boolean(settingsAnchorEl);

  if (isYouTube) return null; // YouTube has its own controls

  return (
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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
          onChange={onProgressChange}
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
              onClick={onPlayPause} 
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
              onClick={onVolumeToggle} 
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
            onChange={onVolumeChange}
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
              onClick={onSettingsClick} 
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
              onClick={onFullscreen} 
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

      {/* Settings Menu for playback speed */}
      <Menu
        anchorEl={settingsAnchorEl}
        open={settingsOpen}
        onClose={onSettingsClose}
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
        {PLAYBACK_RATES.map((rate) => (
          <MenuItem
            key={rate}
            onClick={() => onPlaybackRateChange(rate)}
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
    </Box>
  );
};