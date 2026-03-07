// app/dashboard/properties/components/property-view/MediaDownloadSection.tsx
"use client";

import React from "react";
import {
  Box,
  Button,
} from "@mui/material";
import { CloudDownload } from "@mui/icons-material";

interface PropertyMediaDownloadSectionProps {
  onDownloadImages?: () => void;
  showImages?: boolean;
  onDownloadVideos?: () => void;
  showVideos?: boolean;
  onDownloadBrochures?: () => void;
  showBrochures?: boolean;
  onDownloadCreatives?: () => void;
  showCreatives?: boolean;
}

const PropertyMediaDownloadSection: React.FC<PropertyMediaDownloadSectionProps> = ({
  onDownloadImages,
  showImages,
  onDownloadVideos,
  showVideos,
  onDownloadBrochures,
  showBrochures,
  onDownloadCreatives,
  showCreatives,
}) => {
  return (
    <>
      {showImages && onDownloadImages && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 3,
          px: 2
        }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={onDownloadImages}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Download All Images
          </Button>
        </Box>
      )}
      
      {showVideos && onDownloadVideos && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 3,
          px: 2
        }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={onDownloadVideos}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Download All Videos
          </Button>
        </Box>
      )}
      
      {showBrochures && onDownloadBrochures && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 3,
          px: 2
        }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={onDownloadBrochures}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Download All Brochures
          </Button>
        </Box>
      )}
      
      {showCreatives && onDownloadCreatives && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 3,
          px: 2
        }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={onDownloadCreatives}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Download All Creatives
          </Button>
        </Box>
      )}
    </>
  );
};

export default PropertyMediaDownloadSection;