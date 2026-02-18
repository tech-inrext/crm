// app/dashboard/properties/components/property-view/ImagesGrid.tsx
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
} from "@mui/material";
import {
  CloudDownload,
  ZoomIn,
  BrokenImage,
} from "@mui/icons-material";

interface ImagesGridProps {
  images: any[];
  onImageClick: (index: number) => void;
  onDownloadImage: (url: string, filename: string, index: number) => void;
  loadingImages: Record<string, boolean>;
  imageErrors: Record<string, boolean>;
  formatImageUrl: (url: string) => string;
  handleImageLoad: (id: string) => void;
  handleImageError: (id: string) => void;
}

const ImagesGrid: React.FC<ImagesGridProps> = ({
  images,
  onImageClick,
  onDownloadImage,
  loadingImages,
  imageErrors,
  formatImageUrl,
  handleImageLoad,
  handleImageError,
}) => {
  return (
    <Grid container spacing={2}>
      {images.map((image, index) => {
        const imageId = image._id || `image-${index}`;
        const imageUrl = formatImageUrl(image.url);
        
        return (
          <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
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
              onClick={() => onImageClick(index)}
            >
              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                {!imageErrors[imageId] && imageUrl ? (
                  <>
                    {loadingImages[imageId] && (
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
                      src={imageUrl}
                      alt={image.title || `Image ${index + 1}`}
                      onLoad={() => handleImageLoad(imageId)}
                      onError={() => handleImageError(imageId)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px 8px 8px 8px',
                        display: loadingImages[imageId] ? 'none' : 'block'
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
                
                {!imageErrors[imageId] && imageUrl && (
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
                          onImageClick(index);
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
                          onDownloadImage(imageUrl, image.title || `image-${index + 1}.jpg`, index);
                        }}
                        size="small"
                      >
                        <CloudDownload sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
              </Box>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default ImagesGrid;
