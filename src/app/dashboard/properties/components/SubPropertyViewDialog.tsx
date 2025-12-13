// app/dashboard/properties/components/SubPropertyViewDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
} from "@mui/material";
import {
  CloudDownload,
  Edit,
  Close,
  Business,
  Description,
  CloudUpload,
  Star,
  CheckCircle,
  Home,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';

interface SubPropertyViewDialogProps {
  open: boolean;
  onClose: () => void;
  property: Property | null;
  onEdit: (property: Property) => void;
  onDownloadAllMedia: (property: Property) => Promise<void>;
  onDownloadImages: (images: any[]) => Promise<void>;
  onDownloadFile: (url: string, filename: string) => Promise<void>;
}

const SubPropertyViewDialog: React.FC<SubPropertyViewDialogProps> = ({
  open,
  onClose,
  property,
  onEdit,
  onDownloadAllMedia,
  onDownloadImages,
  onDownloadFile,
}) => {
  if (!property) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      scroll="paper"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        }
      }}
    >
      {/* Enhanced Header with Gradient Overlay */}
      <Box sx={{ 
        position: 'relative',
        height: { xs: 200, md: 200 },
        background: property?.propertyImages?.length > 0 
          ? `linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%), url(${typeof property.propertyImages[0] === 'string' ? property.propertyImages[0] : property.propertyImages[0]?.url})`
          : 'linear-gradient(135deg, #1976d2 0%, #0f5293 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: { xs: 3, md: 4 }
      }}>
        {/* Top Action Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'end', 
          alignItems: 'flex-end',
        }}>
          <IconButton 
            onClick={onClose}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Close />
          </IconButton>
        </Box>

        {/* Header Content */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          mt: 'auto'
        }}>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
            <Typography variant="h2" fontWeight={800} sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              lineHeight: 1.1,
            }}>
              {property?.propertyName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600, textTransform: 'capitalize' }}>
                  {property?.propertyType} Property
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ 
            textAlign: { xs: 'left', md: 'right' },
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            p: { xs: 1, md: 2 },
            minWidth: { xs: '100%', md: 280 }
          }}>
            <Typography variant="h3" fontWeight={800} sx={{ 
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              fontSize: { xs: '1.5rem', md: '2.5rem' }
            }}>
              {property?.price ? `${property.price.toLocaleString()}` : 'Contact for Price'}
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Quick Actions Bar */}
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Quick Stats */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUpload color="primary" />
                <Typography variant="body2" fontWeight={600}>
                  {property?.propertyImages?.length || 0} Images
                </Typography>
              </Box>
              
              {property?.amenities && property.amenities.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    {property.amenities.length} Amenities
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Download All Button */}
            {property?.propertyImages?.length > 0 && (
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

        {/* Main Content */}
        <Box sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={4}>
            {/* Left Column - Property Details */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Description Card */}
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
                    borderColor: 'primary.100'
                  }}>
                    <Description sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
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

                  {/* Highlights Grid */}
                  <Grid container spacing={3}>
                    {/* Property Type */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
                          🏠 Property Type
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                              {property?.propertyType}
                            </Typography>
                          </Box>
                          {property?.paymentPlan && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {property.paymentPlan}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Size Information */}
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

                    {/* Residential Details */}
                    {property?.propertyType === 'residential' && (
                      <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                            🏡 Residential Specifications
                          </Typography>
                          <Grid container spacing={2}>
                            {property?.bedrooms && (
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {property.bedrooms} Bedrooms
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {property?.bathrooms && (
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {property.bathrooms} Bathrooms
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {property?.carpetArea && (
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Carpet: {property.carpetArea}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                            {property?.builtUpArea && (
                              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Built-up: {property.builtUpArea}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Plot Details */}
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

                    {/* Amenities */}
                    {property?.amenities && property.amenities.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'secondary.50' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'secondary.main', mb: 2 }}>
                            ⭐ Amenities & Features
                          </Typography>
                          <Grid container spacing={2}>
                            {property.amenities.map((amenity, index) => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {amenity.trim()}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Side Information */}
            <Grid size={{ xs: 12, lg: 4 }}>
              {/* Quick Info Card */}
              <Card sx={{ 
                mb: 3, 
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
                        label={property?.propertyType} 
                        size="small" 
                        color="primary"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Total Images</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {property?.propertyImages?.length || 0}
                      </Typography>
                    </Box>
                    
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
            </Grid>
          </Grid>

          {/* Images Section */}
          {property?.propertyImages && property.propertyImages.length > 0 && (
            <Card sx={{ 
              mt: 4, 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <CloudUpload sx={{ mr: 1.5 }} />
                    Property Images ({property.propertyImages.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={() => onDownloadImages(property.propertyImages)}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Download All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {property.propertyImages.map((image, index) => {
                    const imageUrl = typeof image === 'string' ? image : image.url;
                    const imageTitle = typeof image === 'string' 
                      ? `Image ${index + 1}` 
                      : image.title || `Image ${index + 1}`;

                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '2px solid transparent',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '8px 8px 0 0',
                              }}
                            >
                              {/* Download Button */}
                              <IconButton
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  '&:hover': {
                                    backgroundColor: 'white',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDownloadFile(imageUrl, imageTitle);
                                }}
                                size="small"
                              >
                                <CloudDownload sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Box sx={{ p: 1 }}>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {imageTitle}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        py: 2,
        px: {sx: 2, md: 3}, 
        borderTop: '1px solid #e2e8f0', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        gap: 2
      }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 3, 
            fontWeight: 600,
            px: {xs: 1, md: 4}, 
            py: 1,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Close
        </Button>
        <Button 
          onClick={() => { 
            onClose(); 
            onEdit(property); 
          }} 
          variant="contained" 
          startIcon={<Edit />}
          sx={{ 
            borderRadius: 3, 
            fontWeight: 600,
            px: {xs: 1, md: 4},        
            py: 1,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Edit Property
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubPropertyViewDialog;