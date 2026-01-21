"use client";

import React from "react";
import {
  Grid,
  Card,
  Box,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  CardContent,
  Chip,
} from "@mui/material";
import {
  CloudDownload,
  ZoomIn,
  BrokenImage,
  VideoFile,
  PictureAsPdf,
  InsertDriveFile,
} from "@mui/icons-material";

interface CreativesGridProps {
  creatives: any[];
  onCreativeClick: (index: number) => void;
  onDownloadCreative: (url: string, filename: string, index: number) => void;
  loadingImages: Record<string, boolean>;
  imageErrors: Record<string, boolean>;
  formatImageUrl: (url: string) => string;
  handleImageLoad: (id: string) => void;
  handleImageError: (id: string) => void;
}

const CreativesGrid: React.FC<CreativesGridProps> = ({
  creatives,
  onCreativeClick,
  onDownloadCreative,
  loadingImages,
  imageErrors,
  formatImageUrl,
  handleImageLoad,
  handleImageError,
}) => {
  return (
    <Grid container spacing={3}>
      {creatives.map((creative, index) => {
        const creativeId = creative._id || `creative-${index}`;
        const creativeUrl = formatImageUrl(creative.url);
        const isImage = creative.type === 'image';
        
        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                cursor: isImage ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                  borderColor: 'primary.main'
                },
                height: '100%'
              }}
              onClick={isImage ? () => onCreativeClick(index) : undefined}
            >
              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                {isImage ? (
                  <>
                    {!imageErrors[creativeId] && creativeUrl ? (
                      <>
                        {loadingImages[creativeId] && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.05)',
                            borderRadius: '8px 8px 8px 8px'
                          }}>
                            <CircularProgress size={24} />
                          </Box>
                        )}
                        
                        <Box
                          component="img"
                          src={creativeUrl}
                          alt={creative.title || `Creative ${index + 1}`}
                          onLoad={() => handleImageLoad(creativeId)}
                          onError={() => handleImageError(creativeId)}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px 8px 8px 8px',
                            display: loadingImages[creativeId] ? 'none' : 'block'
                          }}
                        />
                      </>
                    ) : (
                      <Box sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        borderRadius: '8px 8px 0 0'
                      }}>
                        <BrokenImage sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Failed to load
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'primary.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    borderRadius: '8px 8px 0 0'
                  }}>
                    {creative.type === 'video' ? (
                      <VideoFile sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    ) : creative.type === 'pdf' ? (
                      <PictureAsPdf sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                    ) : (
                      <InsertDriveFile sx={{ fontSize: 48, color: 'action.main', mb: 1 }} />
                    )}
                    <Chip 
                      label={creative.type?.toUpperCase() || 'FILE'} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}
                
                {isImage && !imageErrors[creativeId] && creativeUrl && (
                  <>
                    <Tooltip title="View full screen">
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
                          onCreativeClick(index);
                        }}
                        size="small"
                      >
                        <ZoomIn sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Download">
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 48,
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
                          onDownloadCreative(creativeUrl, creative.title || `creative-${index + 1}.jpg`, index);
                        }}
                        size="small"
                      >
                        <CloudDownload sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                
                {!isImage && (
                  <Tooltip title="Download">
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
                        onDownloadCreative(creativeUrl, creative.title || `creative-${index + 1}`, index);
                      }}
                      size="small"
                    >
                      <CloudDownload sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {creative.title || `Creative ${index + 1}`}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    label={creative.category || 'General'} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default CreativesGrid;