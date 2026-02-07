// app/dashboard/properties/components/sub-property/QuickActionsBar.tsx
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
  Layers,
  Star,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

interface QuickActionsBarProps {
  property: Property;
  propertyTypeColor: "primary" | "warning" | "info" | "default";
  hasFloorPlans: boolean;
  hasPropertyImages: boolean;
  onDownloadAllMedia: (property: Property) => Promise<void>;
}

const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  property,
  propertyTypeColor,
  hasFloorPlans,
  hasPropertyImages,
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
          {hasPropertyImages && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CloudUpload color={propertyTypeColor} />
              <Typography variant="body2" fontWeight={600}>
                {property.propertyImages?.length || 0} Images
              </Typography>
            </Box>
          )}
          
          {hasFloorPlans && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Layers color={propertyTypeColor} />
              <Typography variant="body2" fontWeight={600}>
                {property.floorPlans?.length || 0} Floor Plans
              </Typography>
            </Box>
          )}
          
          {(property.propertyType === 'residential' || property.propertyType === 'commercial') && 
           property.floors && property.floors > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Layers color={propertyTypeColor} />
              <Typography variant="body2" fontWeight={600}>
                {property.floors} Floor{property.floors > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
          
          {property?.amenities && property.amenities.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Star color={propertyTypeColor} />
              <Typography variant="body2" fontWeight={600}>
                {property.amenities.length} Amenities
              </Typography>
            </Box>
          )}
        </Box>
        
        {(hasPropertyImages || hasFloorPlans) && (
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={() => onDownloadAllMedia(property)}
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: `linear-gradient(135deg, #1976d2 0%, #1565c0 100%)`,
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

export default QuickActionsBar;
