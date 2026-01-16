// app/dashboard/properties/components/property-view/QuickInfoCard.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { Property } from '@/services/propertyService';

interface QuickInfoCardProps {
  property: Property;
}

const QuickInfoCard: React.FC<QuickInfoCardProps> = ({ property }) => {
  return (
    <Card sx={{ 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
          ℹ️ Quick Info
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" color="text.secondary">Property Type</Typography>
            <Chip 
              label={property.parentId === null ? "Main" : "Sub"} 
              size="small" 
              color={property.parentId === null ? "primary" : "secondary"}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" color="text.secondary">Payment Plan</Typography>
            <Typography variant="body2" fontWeight={600}>
              {property.paymentPlan || 'N/A'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
            <Typography variant="body2" color="text.secondary">Total Media</Typography>
            <Typography variant="body2" fontWeight={600}>
              {(property.images?.length || 0) + (property.videos?.length || 0) + (property.brochureUrls?.length || 0) + (property.creatives?.length || 0)}
            </Typography>
          </Box>
          
          {property.parentId === null && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Typography variant="body2" color="text.secondary">Sub Properties</Typography>
              <Typography variant="body2" fontWeight={600}>
                {property.subPropertyCount || 0}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickInfoCard;