// app/dashboard/properties/components/sub-property/MediaDownloadSection.tsx
"use client";

import React from "react";
import {
  Box,
  Button,
} from "@mui/material";
import { CloudDownload } from "@mui/icons-material";

interface MediaDownloadSectionProps {
  onDownloadImages: () => void;
  showImages: boolean;
  onDownloadFloorPlans: () => void;
  showFloorPlans: boolean;
}

const MediaDownloadSection: React.FC<MediaDownloadSectionProps> = ({
  onDownloadImages,
  showImages,
  onDownloadFloorPlans,
  showFloorPlans,
}) => {
  return (
    <>
      {showImages && (
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
      
      {showFloorPlans && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mb: 3,
          px: 2
        }}>
          <Button
            variant="outlined"
            startIcon={<CloudDownload />}
            onClick={onDownloadFloorPlans}
            size="small"
            sx={{ borderRadius: 2 }}
          >
            Download All Floor Plans
          </Button>
        </Box>
      )}
    </>
  );
};

export default MediaDownloadSection;
