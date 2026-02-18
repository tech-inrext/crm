// app/dashboard/properties/components/property-view/MediaTabs.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CloudUpload,
  PlayArrow,
  Description,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

interface PropertyMediaTabsProps {
  property: Property;
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  hasImages: boolean;
  hasVideos: boolean;
  hasBrochures: boolean;
  hasCreatives: boolean;
  children: React.ReactNode;
}

const PropertyMediaTabs: React.FC<PropertyMediaTabsProps> = ({
  property,
  tabValue,
  onTabChange,
  hasImages,
  hasVideos,
  hasBrochures,
  hasCreatives,
  children,
}) => {
  return (
    <Card sx={{ 
      mt: 4, 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={onTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem',
                minHeight: 48,
              }
            }}
          >
            {hasImages && (
              <Tab 
                icon={<CloudUpload />} 
                iconPosition="start"
                label={`Images (${property.images?.length || 0})`} 
                sx={{ color: tabValue === 0 ? 'primary.main' : 'text.secondary' }}
              />
            )}
            {hasVideos && (
              <Tab 
                icon={<PlayArrow />} 
                iconPosition="start"
                label={`Videos (${property.videos?.length || 0})`} 
                sx={{ color: tabValue === (hasImages ? 1 : 0) ? 'primary.main' : 'text.secondary' }}
              />
            )}
            {hasBrochures && (
              <Tab 
                icon={<Description />} 
                iconPosition="start"
                label={`Brochures (${property.brochureUrls?.length || 0})`} 
                sx={{ color: tabValue === (hasImages ? (hasVideos ? 2 : 1) : (hasVideos ? 1 : 0)) ? 'primary.main' : 'text.secondary' }}
              />
            )}
            {hasCreatives && (
              <Tab 
                icon={<CloudUpload />} 
                iconPosition="start"
                label={`Creatives (${property.creatives?.length || 0})`} 
                sx={{ color: tabValue === (hasImages ? (hasVideos ? (hasBrochures ? 3 : 2) : (hasBrochures ? 2 : 1)) : (hasVideos ? (hasBrochures ? 2 : 1) : (hasBrochures ? 1 : 0))) ? 'primary.main' : 'text.secondary' }}
              />
            )}
          </Tabs>
        </Box>
        
        {children}
      </CardContent>
    </Card>
  );
};

export default PropertyMediaTabs;
