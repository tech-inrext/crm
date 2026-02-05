// app/dashboard/properties/components/property-view/PropertyQuickActions.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
} from "@mui/material";
import {
  CloudDownload,
  CloudUpload,
  PlayArrow,
  Description,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

interface PropertyQuickActionsProps {
  property: Property;
  hasImages: boolean;
  hasVideos: boolean;
  hasBrochures: boolean;
  hasCreatives: boolean;
  onDownloadAllMedia: (property: Property) => Promise<void>;
}

const PropertyQuickActions: React.FC<PropertyQuickActionsProps> = ({
  property,
  hasImages,
  hasVideos,
  hasBrochures,
  hasCreatives,
  onDownloadAllMedia,
}) => {
  return (
    <Paper sx={{ 
      p: 3, 
      borderRadius: 0,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: {
            xs: 'center',  
            sm: 'space-between',
          },
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUpload color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {property.images?.length || 0} Images
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayArrow color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {property.videos?.length || 0} Videos
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {property.brochureUrls?.length || 0} Brochures
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUpload color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {property.creatives?.length || 0} Creatives
            </Typography>
          </Box>
        </Box>
        
        {(hasImages || hasVideos || hasBrochures || hasCreatives) && (
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={() => onDownloadAllMedia(property)}
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Download All Media
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default PropertyQuickActions;