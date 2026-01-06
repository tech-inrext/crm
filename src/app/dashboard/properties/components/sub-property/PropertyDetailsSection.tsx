// app/dashboard/properties/components/sub-property/PropertyDetailsSection.tsx
"use client";

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
} from "@mui/material";
import {
  Description,
  Home,
  BusinessCenter,
  Landscape,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

interface PropertyDetailsSectionProps {
  property: Property;
  propertyTypeColor: "primary" | "warning" | "info" | "default";
}

const PropertyDetailsSection: React.FC<PropertyDetailsSectionProps> = ({
  property,
  propertyTypeColor,
}) => {
  return (
    <Grid container spacing={4}>
      <Grid size={{ xs: 12, md: 12 }}>
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          overflow: 'visible'
        }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: `${propertyTypeColor}.100`
            }}>
              <Description sx={{ mr: 2, color: `${propertyTypeColor}.main`, fontSize: 28 }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: `${propertyTypeColor}.main` }}>
                Property Overview
              </Typography>
            </Box>
            
            <Typography variant="body1" sx={{ 
              color: 'text.secondary', 
              lineHeight: 1.8,
              fontSize: '1.1rem',
              mb: 4
            }}>
              {property?.propertyDescription || 'No description available.'}
            </Typography>

            <Grid container spacing={3}>
              {(property?.minSize || property?.maxSize) && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'success.50', height: '100%' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', mb: 2 }}>
                      📐 Size Details
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {property?.minSize && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Min: {property.minSize} {property?.sizeUnit || ''}
                          </Typography>
                        </Box>
                      )}
                      {property?.maxSize && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Max: {property.maxSize} {property?.sizeUnit || ''}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )}

              {property?.propertyType === 'residential' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
                      🏡 Residential Specifications
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {property?.bedrooms && property.bedrooms > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {property.bedrooms} Bedroom{property.bedrooms > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                      )}
                      {property?.bathrooms && property.bathrooms > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                      )}
                      {property?.toilet && property.toilet > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {property.toilet} Toilet{property.toilet > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                      )}
                      {property?.balcony && property.balcony > 0 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {property.balcony} Balcony{property.balcony > 1 ? 's' : ''}
                            </Typography>
                        </Box>
                      )}
                      {property?.carpetArea && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Carpet: {property.carpetArea} {property?.sizeUnit || ''}
                            </Typography>
                        </Box>
                      )}
                      {property?.builtUpArea && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Built-up: {property.builtUpArea} {property?.sizeUnit || ''}
                            </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )}

              {property?.propertyType === 'commercial' && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                      🏢 Commercial Specifications
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {property?.carpetArea && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Carpet: {property.carpetArea} {property?.sizeUnit || ''}
                            </Typography>
                        </Box>
                      )}
                      {property?.builtUpArea && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Built-up: {property.builtUpArea} {property?.sizeUnit || ''}
                            </Typography>
                        </Box>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              )}

              {property?.propertyType === 'plot' && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'info.50' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'info.main', mb: 2 }}>
                      📊 Plot Information
                    </Typography>
                    <Grid container spacing={2}>
                      {property?.ownershipType && (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {property.ownershipType}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {property?.landType && (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {property.landType}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Boundary: {property?.boundaryWall ? 'Yes' : 'No'}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}

              {property?.amenities && property.amenities.length > 0 && (
                <Grid size={{ xs: 12 }}>
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'secondary.50' }}>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'secondary.main', mb: 2 }}>
                      ⭐ Amenities & Features
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {property.amenities.map((amenity, index) => (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} key={index}>
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {amenity.trim()}
                            </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default PropertyDetailsSection;