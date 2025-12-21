// app/dashboard/properties/components/PropertyViewDialog.tsx
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
  CardMedia,
} from "@mui/material";
import {
  CloudDownload,
  Edit,
  Close,
  Business,
  Description,
  LocationOn,
  CloudUpload,
  PlayArrow,
  Public,
  Star,
  CheckCircle,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';
import LeafletMap from "../LeafletMap";
import SubPropertiesViewer from "./SubPropertiesViewer";
import { useAuth } from "@/contexts/AuthContext";

interface PropertyViewDialogProps {
  open: boolean;
  onClose: () => void;
  property: Property | null;
  onEdit: (property: Property) => void;
  onDownloadAllMedia: (property: Property) => Promise<void>;
  onDownloadImages: (images: any[]) => Promise<void>;
  onDownloadVideos: (videos: any[]) => Promise<void>;
  onDownloadBrochures: (brochures: any[]) => Promise<void>;
  onDownloadCreatives: (creatives: any[]) => Promise<void>;
  onDownloadFile: (url: string, filename: string) => Promise<void>;
  onViewSubProperty: (subProperty: Property) => void;
}

const PropertyViewDialog: React.FC<PropertyViewDialogProps> = ({
  open,
  onClose,
  property,
  onEdit,
  onDownloadAllMedia,
  onDownloadImages,
  onDownloadVideos,
  onDownloadBrochures,
  onDownloadCreatives,
  onDownloadFile,
  onViewSubProperty,
}) => {
  const { getPermissions } = useAuth();
  
  // Check if user has write permission for property module
  const canEditProperty = getPermissions("property").hasWriteAccess;

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
        background: property?.images?.length > 0 
          ? `linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%), url(${property.images.find(img => img.isPrimary)?.url || property.images[0]?.url})`
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
              {property?.projectName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Business sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>
                  {property?.builderName}
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
              {property?.price || 'Contact for Price'}
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
                  {property?.images?.length || 0} Images
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PlayArrow color="primary" />
                <Typography variant="body2" fontWeight={600}>
                  {property?.videos?.length || 0} Videos
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Description color="primary" />
                <Typography variant="body2" fontWeight={600}>
                  {property?.brochureUrls?.length || 0} Brochures
                </Typography>
              </Box>
            </Box>
            
            {/* Download All Button */}
            {(property?.brochureUrls?.length > 0 || property?.images?.length > 0) && (
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
                      Project Overview
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary', 
                    lineHeight: 1.8,
                    fontSize: '1.1rem',
                    mb: 4
                  }}>
                    {property?.description}
                  </Typography>

                  {/* Highlights Grid */}
                  <Grid container spacing={3}>
                    {property?.status && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50', height: '100%' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
                            🏗️ Project Status
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {(Array.isArray(property.status) ? property.status : property.status.split(',')).map((item, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {item.trim()}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {property?.nearby && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'success.50', height: '100%' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', mb: 2 }}>
                            📍 Nearby Locations
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {(Array.isArray(property.nearby) ? property.nearby : property.nearby.split(',')).map((item, index) => (
                              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                  {item.trim()}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {property?.projectHighlights && (
                      <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                            ⭐ Project Highlights
                          </Typography>
                          <Grid container spacing={2}>
                            {(Array.isArray(property.projectHighlights) ? property.projectHighlights : property.projectHighlights.split(',')).map((point, index) => (
                              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {point.trim()}
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
              {/* Location & Map Card */}
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
                      {property?.location}
                    </Typography>
                  </Box>

                  {property?.mapLocation ? (
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

              {/* Quick Info Card */}
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
                        label={property?.parentId === null ? "Main" : "Sub"} 
                        size="small" 
                        color={property?.parentId === null ? "primary" : "secondary"}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Payment Plan</Typography>
                      {property?.paymentPlan}
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Total Media</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {(property?.images?.length || 0) + (property?.videos?.length || 0) + (property?.brochureUrls?.length || 0)}
                      </Typography>
                    </Box>
                    
                    {property?.parentId === null && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Sub Properties</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {property?.subPropertyCount || 0}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Sub Properties Section */}
          {property?.parentId === null && (
            <Card sx={{ 
              mt: 4, 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
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
                  <Business sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
                    Property Types ({property?.subPropertyCount || 0})
                  </Typography>
                </Box>
                <SubPropertiesViewer 
                  parentId={property._id!} 
                  onViewSubProperty={onViewSubProperty}
                />
              </CardContent>
            </Card>
          )}

          {/* Media Sections */}
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {/* Images Section */}
            {property?.images && property.images.length > 0 && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ 
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
                        Project Images ({property.images.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownload />}
                        onClick={() => onDownloadImages(property.images)}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Download All
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {property.images.map((image, index) => (
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
                                  backgroundImage: `url(${image.url})`,
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
                                    onDownloadFile(image.url, image.title || `image-${index + 1}.jpg`);
                                  }}
                                  size="small"
                                >
                                  <CloudDownload sx={{ fontSize: 16 }} />
                                </IconButton>
                                
                                {image.isPrimary && (
                                  <Chip 
                                    label="Primary" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ 
                                      position: 'absolute',
                                      top: 8,
                                      left: 8,
                                      height: 20, 
                                      fontSize: '0.65rem',
                                      fontWeight: 600
                                    }} 
                                  />
                                )}
                              </Box>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Videos Section */}
            {property?.videos && property.videos.length > 0 && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ 
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
                        <PlayArrow sx={{ mr: 1.5 }} />
                        Videos ({property.videos.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownload />}
                        onClick={() => onDownloadVideos(property.videos)}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Download All
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {property.videos.map((video, index) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={index}>
                          <Card sx={{ 
                            transition: 'all 0.3s ease', 
                            border: '2px solid transparent',
                            '&:hover': { 
                              transform: 'translateY(-4px)', 
                              boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                              borderColor: 'primary.main'
                            } 
                          }}>
                            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  bottom: 0,
                                  backgroundColor: 'grey.100',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: '8px 8px 0 0',
                                  cursor: 'pointer',
                                  backgroundImage: video.thumbnail ? `url(${video.thumbnail})` : 'none',
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                                onClick={() => window.open(video.url, '_blank')}
                              >
                                {!video.thumbnail && (
                                  <PlayArrow sx={{ fontSize: 48, color: 'primary.main' }} />
                                )}
                                
                                <Box sx={{ 
                                  position: 'absolute', 
                                  inset: 0, 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  background: video.thumbnail ? 'rgba(0,0,0,0.3)' : 'transparent'
                                }}>
                                  <PlayArrow sx={{ fontSize: 48, color: 'white', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
                                </Box>
                                
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
                                    onDownloadFile(video.url, video.title || `video-${index + 1}.mp4`);
                                  }}
                                >
                                  <CloudDownload />
                                </IconButton>
                              </Box>
                            </Box>
                            
                            <Box sx={{ p: 2 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {video.title || `Video ${index + 1}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {video.type || 'MP4 Video'}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Brochures Section */}
            {property?.brochureUrls && property.brochureUrls.length > 0 && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ 
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
                        <Description sx={{ mr: 1.5 }} />
                        Brochures ({property.brochureUrls.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownload />}
                        onClick={() => onDownloadBrochures(property.brochureUrls)}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Download All
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {property.brochureUrls.map((brochure, index) => (
                        <Grid size={{ xs: 12 }} key={index}>
                          <Paper
                            variant="outlined"
                            sx={{ 
                              p: 2, 
                              borderRadius: 3,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.2s ease',
                              border: '2px solid',
                              borderColor: 'grey.200',
                              '&:hover': {
                                backgroundColor: 'primary.50',
                                borderColor: 'primary.main',
                                transform: 'translateX(4px)'
                              }
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                              <Description sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="body1" fontWeight={600} noWrap>
                                  {brochure.title || `Brochure ${index + 1}`}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {brochure.type || 'PDF Document'}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton 
                              onClick={() => onDownloadFile(brochure.url, brochure.title || `brochure-${index + 1}.pdf`)}
                              color="primary"
                              sx={{
                                backgroundColor: 'primary.50',
                                '&:hover': {
                                  backgroundColor: 'primary.100',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <CloudDownload />
                            </IconButton>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Creatives Section */}
            {property?.creatives && property.creatives.length > 0 && (
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card sx={{ 
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
                        Creatives ({property.creatives.length})
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<CloudDownload />}
                        onClick={() => onDownloadCreatives(property.creatives)}
                        size="small"
                        sx={{ borderRadius: 2 }}
                      >
                        Download All
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      {property.creatives.map((creative, index) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={index}>
                          <Card 
                            sx={{ 
                              transition: 'all 0.3s ease',
                              border: '2px solid transparent',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                                borderColor: creative.type === 'image' ? 'primary.main' : 'secondary.main'
                              }
                            }}
                          >
                            {creative.type === 'image' ? (
                              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundImage: `url(${creative.url})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '8px 8px 0 0'
                                  }}
                                >
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
                                      onDownloadFile(creative.url, creative.title || `creative-${index + 1}.jpg`);
                                    }}
                                    size="small"
                                  >
                                    <CloudDownload sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            ) : (
                              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: 'grey.100',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '8px 8px 0 0'
                                  }}
                                >
                                  <PlayArrow sx={{ fontSize: 48, color: 'secondary.main' }} />
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
                                      onDownloadFile(creative.url, creative.title || `creative-${index + 1}.mp4`);
                                    }}
                                    size="small"
                                  >
                                    <CloudDownload sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                            )}
                            
                            <Box sx={{ p: 2 }}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {creative.title || `Creative ${index + 1}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                                {creative.type} • {creative.size || 'N/A'}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
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
        {/* Only show Edit button if user has write permission */}
        {canEditProperty && (
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
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PropertyViewDialog;