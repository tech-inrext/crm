// app/dashboard/properties/components/property-view/LocationCard.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import { LocationOn } from "@mui/icons-material";
import { Property } from '@/services/propertyService';
import LeafletMap from "../../LeafletMap";

interface LocationCardProps {
  property: Property;
}

const LocationCard: React.FC<LocationCardProps> = ({ property }) => {
  return (
    <Card sx={{ 
      mb: 3, 
      borderRadius: 3, 
      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <CardContent sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: 'primary.main'
          }}>
            <LocationOn sx={{ mr: 1.5 }} />
            Location
          </Typography>
        </Box>

        <Box sx={{ p: 0, pb: 2 }}>
          <Typography sx={{ p: 2 }}>
            {property.location}
          </Typography>
        </Box>

        {property.mapLocation ? (
          <>
            <Box sx={{ height: 200, position: 'relative' }}>
              <LeafletMap 
                location={property.mapLocation}
                propertyName={property.projectName}
              />
            </Box>
            
            <Box sx={{ p: 3, pt: 2 }}>
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100' }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
                  📍 Coordinates
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Latitude
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {property.mapLocation.lat?.toFixed(6) || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Longitude
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {property.mapLocation.lng?.toFixed(6) || 'N/A'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </>
        ) : (
          <Paper 
            sx={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexDirection: 'column',
              bgcolor: 'grey.50',
              borderRadius: 0
            }}
          >
            <LocationOn sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Location not specified
            </Typography>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationCard;