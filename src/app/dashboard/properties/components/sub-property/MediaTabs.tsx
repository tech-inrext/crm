// app/dashboard/properties/components/sub-property/MediaTabs.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
} from "@mui/material";
import {
  CloudUpload,
  Layers,
  CloudDownload,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

interface MediaTabsProps {
  property: Property;
  propertyTypeColor: "primary" | "warning" | "info" | "default";
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  hasPropertyImages: boolean;
  hasFloorPlans: boolean;
  children: React.ReactNode;
}

const MediaTabs: React.FC<MediaTabsProps> = ({
  property,
  propertyTypeColor,
  tabValue,
  onTabChange,
  hasPropertyImages,
  hasFloorPlans,
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
            {hasPropertyImages && (
              <Tab 
                icon={<CloudUpload />} 
                iconPosition="start"
                label={`Images (${property.propertyImages?.length || 0})`} 
                sx={{ color: tabValue === 0 ? `${propertyTypeColor}.main` : 'text.secondary' }}
              />
            )}
            {hasFloorPlans && (
              <Tab 
                icon={<Layers />} 
                iconPosition="start"
                label={`Floor Plans (${property.floorPlans?.length || 0})`} 
                sx={{ color: tabValue === (hasPropertyImages ? 1 : 0) ? `${propertyTypeColor}.main` : 'text.secondary' }}
              />
            )}
          </Tabs>
        </Box>
        
        {children}
      </CardContent>
    </Card>
  );
};

export default MediaTabs;