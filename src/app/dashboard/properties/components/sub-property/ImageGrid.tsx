// app/dashboard/properties/components/sub-property/ImageGrid.tsx
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

interface ImageGridProps {
  items: any[];
  type: 'images' | 'floorPlans';
  onItemClick: (index: number) => void;
  onDownloadItem: (url: string, title: string, index: number) => void;
  loadingImages: Record<string, boolean>;
  imageErrors: Record<string, boolean>;
  extractItemData: (item: any, index: number) => { url: string; title: string; id: string };
  formatImageUrl: (url: string) => string;
  handleImageLoad: (id: string) => void;
  handleImageError: (id: string) => void;
  propertyTypeColor: "primary" | "warning" | "info" | "default";
}

const ImageGrid: React.FC<ImageGridProps> = ({
  items,
  type,
  onItemClick,
  onDownloadItem,
  loadingImages,
  imageErrors,
  extractItemData,
  formatImageUrl,
  handleImageLoad,
  handleImageError,
  propertyTypeColor,
}) => {
  return (
    <Grid container spacing={2}>
      {items.map((item, index) => {
        const { url, title, id } = extractItemData(item, index);
        
        if (!url) return null;

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
                  borderColor: `${propertyTypeColor}.main`
                },
                height: '100%'
              }}
              onClick={() => onItemClick(index)}
            >
              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                {!imageErrors[id] && url ? (
                  <>
                    {loadingImages[id] && (
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
                        borderRadius: '8px 8px 0 0'
                      }}>
                        <CircularProgress size={24} />
                      </Box>
                    )}
                    
                    <Box
                      component="img"
                      src={url}
                      alt={title}
                      onLoad={() => handleImageLoad(id)}
                      onError={() => handleImageError(id)}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: type === 'images' ? 'cover' : 'contain',
                        borderRadius: '8px 8px 8px 8px',
                        display: loadingImages[id] ? 'none' : 'block'
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
                    borderRadius: '8px 8px 8px 8px'
                  }}>
                    <BrokenImage sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Failed to load
                    </Typography>
                  </Box>
                )}
                
                {!imageErrors[id] && url && (
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
                          onItemClick(index);
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
                          onDownloadItem(url, title, index);
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

export default ImageGrid;