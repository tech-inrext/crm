// app/dashboard/properties/components/sub-property/FullscreenImageViewer.tsx
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
} from "@mui/icons-material";

interface FullscreenImageViewerProps {
  open: boolean;
  onClose: () => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
  currentItem: any | null;
  itemType: 'image' | 'floorPlan';
  onDownload: () => void;
  onPrev: () => void;
  onNext: () => void;
  currentIndex: number | null;
  totalItems: number;
  extractData: (item: any, index: number) => { url: string; title: string };
}

const FullscreenImageViewer: React.FC<FullscreenImageViewerProps> = ({
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
  extractData,
}) => {
  if (!currentItem) return null;

  const { url, title } = extractData(currentItem, currentIndex || 0);

  return (
    <FullscreenDialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullScreen={isFullscreen}
      sx={{
        '& .MuiDialog-paper': {
          margin: 0,
          width: '100vw',
          height: '100vh',
          maxWidth: '100vw',
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderRadius: 0,
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
            top: 16,
            right: 16,
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

        <IconButton
          onClick={onFullscreenToggle}
          sx={{
            position: 'absolute',
            top: 16,
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

        <Tooltip title="Download">
          <IconButton
            onClick={onDownload}
            sx={{
              position: 'absolute',
              top: 16,
              right: 112,
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

        {totalItems > 1 && (
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
                right: 160,
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

        <Box
          component="img"
          src={url}
          alt={title}
          sx={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor: 'pointer'
          }}
          onClick={onFullscreenToggle}
        />

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
            {totalItems > 1 && (
              <Typography variant="body2" component="span" sx={{ ml: 2, opacity: 0.8 }}>
                ({currentIndex! + 1} of {totalItems})
              </Typography>
            )}
          </Typography>
        </Box>
      </Box>
    </FullscreenDialog>
  );
};

export default FullscreenImageViewer;