import React, { useRef, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  LinearProgress,
} from "@mui/material";
import { Close, PlayArrow, Pause, VolumeUp, VolumeOff, Fullscreen } from "@mui/icons-material";
import { TrainingVideo } from "@/types/trainingVideo";

interface VideoPlayerModalProps {
  open: boolean;
  video: TrainingVideo | null;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ open, video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  }, [open]);

  const handlePlayPause = (): void => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeToggle = (): void => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = (): void => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
    }
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>): void => {
    if (videoRef.current) {
      const rect = event.currentTarget.getBoundingClientRect();
      const percent = (event.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * videoRef.current.duration;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: { [key: string]: string } = {
      "basic-sales-training-fundamentals": "Basic Sales Training Fundamentals",
      "team-building": "Team Building",
      "growth-model": "Growth Model",
      "basic-fundamentals-of-real-estate": "Basic Fundamentals of Real Estate",
      "company-code-of-conduct-rules-compliances": "Company Code of Conduct, Rules & Compliances (RERA)"
    };
    return categoryLabels[category] || category;
  };

  if (!video) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
          bgcolor: 'black',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            color: 'white',
            bgcolor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.7)',
            }
          }}
        >
          <Close />
        </IconButton>
        
        {/* Video Player */}
        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
          <video
            ref={videoRef}
            controls={false}
            autoPlay
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'black',
            }}
            poster={video.thumbnailUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={video.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Custom Controls */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
            p: 2,
            opacity: 0,
            transition: 'opacity 0.3s ease',
            '&:hover': {
              opacity: 1,
            }
          }}>
            {/* Progress Bar */}
            <Box 
              sx={{ 
                width: '100%', 
                height: 4, 
                bgcolor: 'rgba(255,255,255,0.3)', 
                borderRadius: 2,
                mb: 2,
                cursor: 'pointer'
              }}
              onClick={handleProgressClick}
            >
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: '100%',
                  borderRadius: 2,
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#FF0000'
                  }
                }}
              />
            </Box>

            {/* Control Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handlePlayPause} sx={{ color: 'white' }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              
              <IconButton onClick={handleVolumeToggle} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>

              <Typography variant="body2" sx={{ color: 'white', flexGrow: 1 }}>
                {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(videoRef.current?.duration || 0)}
              </Typography>

              <IconButton sx={{ color: 'white' }}>
                <Fullscreen />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        {/* Video Info */}
        <Box sx={{ p: 3, color: 'white' }}>
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            {video.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              label={getCategoryLabel(video.category)} 
              color="primary" 
              size="small" 
            />
          </Box>
          
          <Typography variant="body1" sx={{ mb: 2, opacity: 0.9, lineHeight: 1.6 }}>
            {video.description}
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Uploaded by: {video.createdBy?.name || 'Unknown'}
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              Uploaded: {new Date(video.uploadDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;