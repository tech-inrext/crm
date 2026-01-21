// app/dashboard/properties/components/property-view/FullscreenViewers.tsx
"use client";

import React from "react";
import {
  Dialog as FullscreenDialog,
  Box,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Close,
  Fullscreen,
  FullscreenExit,
  CloudDownload,
  ArrowBack,
  ArrowForward,
  PlayArrow,
} from "@mui/icons-material";

interface FullscreenImageViewerProps {
  open: boolean;
  onClose: () => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  currentItem: any;
  itemType: 'image' | 'video' | 'creative' | 'brochure';
  onDownload: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number | null;
  totalItems?: number;
  title?: string;
  showNavigation?: boolean;
}

export const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
  open,
  onClose,
  isFullscreen,
  onFullscreenToggle,
  currentItem,
  itemType,
  onDownload,
  onPrev,
  onNext,
  currentIndex,
  totalItems,
  title,
  showNavigation = true,
}) => {
  if (!currentItem) return null;

  const renderContent = () => {
    if (itemType === 'video') {
      return (
        <Box sx={{ position: 'relative', paddingTop: '56.25%', width: '100%' }}>
          <Box
            component="video"
            src={currentItem.url}
            controls
            autoPlay
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </Box>
      );
    } else if (itemType === 'brochure') {
      return (
        <iframe
          src={currentItem.url}
          title={currentItem.title || `Document`}
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      );
    } else {
      return (
        <Box
          component="img"
          src={currentItem.url}
          alt={currentItem.title || `Item`}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor: 'pointer'
          }}
          onClick={onFullscreenToggle}
        />
      );
    }
  };

  return (
    <FullscreenDialog
      open={open}
      onClose={onClose}
      maxWidth={itemType === 'brochure' ? 'lg' : false}
      fullWidth={itemType === 'brochure'}
      fullScreen={isFullscreen && itemType !== 'brochure'}
      sx={{
        '& .MuiDialog-paper': {
          margin: 0,
          width: itemType === 'brochure' ? '90vw' : '100vw',
          height: itemType === 'brochure' ? '90vh' : '100vh',
          maxWidth: itemType === 'brochure' ? '90vw' : '100vw',
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderRadius: itemType === 'brochure' ? 2 : 0,
          overflow: 'hidden',
        }
      }}
    >
      <Box sx={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.5)',
            color: 'white',
            zIndex: 10,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)'
            }
          }}
        >
          <Close />
        </IconButton>

        {itemType !== 'brochure' && (
          <IconButton
            onClick={onFullscreenToggle}
            sx={{
              position: 'absolute',
              top: 8,
              right: 64,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 10,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        )}

        <Tooltip title="Download">
          <IconButton
            onClick={onDownload}
            sx={{
              position: 'absolute',
              top: 8,
              right: itemType === 'brochure' ? 64 : 112,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 10,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <CloudDownload />
          </IconButton>
        </Tooltip>

        {showNavigation && onPrev && onNext && totalItems && totalItems > 1 && (
          <>
            <IconButton
              onClick={onPrev}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>

            <IconButton
              onClick={onNext}
              sx={{
                position: 'absolute',
                right: itemType === 'brochure' ? 112 : 160,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                zIndex: 10,
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              <ArrowForward />
            </IconButton>
          </>
        )}

        {renderContent()}

        {title && (
          <Box sx={{ 
            position: 'absolute', 
            bottom: 16, 
            left: 0, 
            right: 0, 
            textAlign: 'center',
            zIndex: 10 
          }}>
            <Typography variant="h6" sx={{ 
              backgroundColor: 'rgba(0,0,0,0.7)', 
              color: 'white', 
              display: 'inline-block',
              px: 3,
              py: 1,
              borderRadius: 2
            }}>
              {title}
              {currentIndex !== undefined && totalItems && totalItems > 1 && (
                <Typography variant="body2" component="span" sx={{ ml: 2, opacity: 0.8 }}>
                  ({currentIndex + 1} of {totalItems})
                </Typography>
              )}
            </Typography>
          </Box>
        )}
      </Box>
    </FullscreenDialog>
  );
};

export const VideoViewer: React.FC<{
  open: boolean;
  onClose: () => void;
  currentVideo: any;
}> = ({ open, onClose, currentVideo }) => {
  return (
    <FullscreenDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderRadius: 2,
          overflow: 'hidden',
        }
      }}
    >
      {currentVideo && (
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 10,
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <Close />
          </IconButton>

          <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
            <Box
              component="video"
              src={currentVideo.url}
              controls
              autoPlay
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </Box>

          <Box sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.7)', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              {currentVideo.title || `Video`}
            </Typography>
          </Box>
        </Box>
      )}
    </FullscreenDialog>
  );
};