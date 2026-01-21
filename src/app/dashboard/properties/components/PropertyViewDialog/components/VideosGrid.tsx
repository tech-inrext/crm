"use client";

import React from "react";
import {
  Grid,
  Card,
  Box,
  Typography,
  IconButton,
  Tooltip,
  CardContent,
  Chip,
} from "@mui/material";
import { CloudDownload, PlayArrow } from "@mui/icons-material";

interface VideosGridProps {
  videos: any[];
  onVideoClick: (index: number) => void;
  onDownloadVideo: (url: string, filename: string, index: number) => void;
}

const VideosGrid: React.FC<VideosGridProps> = ({ videos, onVideoClick, onDownloadVideo }) => {
  return (
    <Grid container spacing={3}>
      {videos.map((video, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                borderColor: 'primary.main'
              },
              height: '100%'
            }}
            onClick={() => onVideoClick(index)}
          >
            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px 8px 0 0'
                }}
              >
                <PlayArrow sx={{ fontSize: 60, color: 'rgba(255,255,255,0.8)' }} />
                <Chip
                  label={`${video.duration || '00:00'}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              </Box>
              
              <Tooltip title="Play video">
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(25, 118, 210, 0.9)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      transform: 'translate(-50%, -50%) scale(1.1)'
                    },
                    transition: 'all 0.2s ease',
                    width: 60,
                    height: 60
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoClick(index);
                  }}
                >
                  <PlayArrow sx={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Download video">
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    '&:hover': {
                      backgroundColor: 'white',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadVideo(video.url, video.title || `video-${index + 1}.mp4`, index);
                  }}
                  size="small"
                >
                  <CloudDownload sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {video.title || `Video ${index + 1}`}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {video.format || 'MP4'} • {video.size || 'Unknown size'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default VideosGrid;