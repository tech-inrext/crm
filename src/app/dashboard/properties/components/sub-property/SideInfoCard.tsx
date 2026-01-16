// app/dashboard/properties/components/sub-property/SideInfoCard.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  Home,
  BusinessCenter,
  Landscape,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

interface SideInfoCardProps {
  property: Property;
  propertyTypeColor: "primary" | "warning" | "info" | "default";
  hasFloorPlans: boolean;
}

const SideInfoCard: React.FC<SideInfoCardProps> = ({
  property,
  propertyTypeColor,
  hasFloorPlans,
}) => {
  const getPropertyTypeIcon = (type: string) => {
    switch(type) {
      case 'residential': return <Home sx={{ fontSize: 16 }} />;
      case 'commercial': return <BusinessCenter sx={{ fontSize: 16 }} />;
      case 'plot': return <Landscape sx={{ fontSize: 16 }} />;
      default: return <Home sx={{ fontSize: 16 }} />;
    }
  };

  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: `${propertyTypeColor}.main` }}>
          ℹ️ Quick Info
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" color="text.secondary">Property Type</Typography>
            <Chip 
              icon={getPropertyTypeIcon(property.propertyType)}
              label={property.propertyType}
              size="small" 
              color={propertyTypeColor}
              sx={{ textTransform: 'capitalize' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Images</Typography>
            <Typography variant="body2" fontWeight={600}>
              {property?.propertyImages?.length || 0}
            </Typography>
          </Box>
          
          {hasFloorPlans && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">Floor Plans</Typography>
              <Typography variant="body2" fontWeight={600}>
                {property.floorPlans?.length || 0}
              </Typography>
            </Box>
          )}
          
          {(property.propertyType === 'residential' || property.propertyType === 'commercial') && 
           property.floors && property.floors > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">Floor</Typography>
              <Typography variant="body2" fontWeight={600}>
                {property.floors}
              </Typography>
            </Box>
          )}
          
          {property?.paymentPlan && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">Payment Plan</Typography>
              <Typography variant="body2" fontWeight={600}>
                {property.paymentPlan}
              </Typography>
            </Box>
          )}

          {property?.amenities && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">Amenities</Typography>
              <Typography variant="body2" fontWeight={600}>
                {property.amenities.length}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default SideInfoCard;
