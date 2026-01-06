// app/dashboard/properties/components/PropertyViewDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Tooltip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from "@mui/material";
import {
  CloudDownload,
  Edit,
  Close,
  Business,
  Description,
  PlayArrow,
  PictureAsPdf,
  Image,
  VideoFile,
  InsertDriveFile,
  Download,
  ZoomIn,
  BrokenImage,
  Fullscreen,
  FullscreenExit,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';
import { useAuth } from "@/contexts/AuthContext";

// Import components
import PropertyHeader from "./property-view/PropertyHeader";
import PropertyQuickActions from "./property-view/PropertyQuickActions";
import ProjectOverview from "./property-view/ProjectOverview";
import LocationCard from "./property-view/LocationCard";
import QuickInfoCard from "./property-view/QuickInfoCard";
import PropertyMediaTabs from "./property-view/MediaTabs";
import PropertyMediaDownloadSection from "./property-view/MediaDownloadSection";
import ImagesGrid from "./property-view/ImagesGrid";
import { FullscreenImageViewer, VideoViewer } from "./property-view/FullscreenViewers";

// Shared components
import SubPropertiesViewer from "./SubPropertiesViewer";

// TabPanel component
const TabPanel = (props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`property-tabpanel-${index}`}
      aria-labelledby={`property-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// Videos Grid Component
const VideosGrid: React.FC<{
  videos: any[];
  onVideoClick: (index: number) => void;
  onDownloadVideo: (url: string, filename: string, index: number) => void;
}> = ({ videos, onVideoClick, onDownloadVideo }) => {
  return (
    <Grid container spacing={3}>
      {videos.map((video, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              border: '2px solid transparent',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                borderColor: 'primary.main'
              },
              height: '100%'
            }}
            onClick={() => onVideoClick(index)}
          >
            <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
              <CardMedia
                component="div"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '8px 8px 0 0'
                }}
              >
                <PlayArrow sx={{ fontSize: 60, color: 'rgba(255,255,255,0.8)' }} />
                <Chip
                  label={`${video.duration || '00:00'}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontSize: '0.7rem'
                  }}
                />
              </CardMedia>
              
              <Tooltip title="Play video">
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'rgba(25, 118, 210, 0.9)',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      transform: 'translate(-50%, -50%) scale(1.1)'
                    },
                    transition: 'all 0.2s ease',
                    width: 60,
                    height: 60
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onVideoClick(index);
                  }}
                >
                  <PlayArrow sx={{ fontSize: 32 }} />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Download video">
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
                    onDownloadVideo(video.url, video.title || `video-${index + 1}.mp4`, index);
                  }}
                  size="small"
                >
                  <CloudDownload sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
            
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} noWrap>
                {video.title || `Video ${index + 1}`}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {video.format || 'MP4'} • {video.size || 'Unknown size'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

// Brochures List Component
const BrochuresList: React.FC<{
  brochures: any[];
  onBrochureClick: (index: number) => void;
  onDownloadBrochure: (url: string, filename: string, index: number) => void;
}> = ({ brochures, onBrochureClick, onDownloadBrochure }) => {
  const getFileIcon = (filename: string) => {
    if (filename.toLowerCase().endsWith('.pdf')) {
      return <PictureAsPdf color="error" />;
    } else if (filename.toLowerCase().endsWith('.doc') || filename.toLowerCase().endsWith('.docx')) {
      return <Description color="primary" />;
    }
    return <InsertDriveFile color="action" />;
  };

  const getFileType = (filename: string) => {
    if (filename.toLowerCase().endsWith('.pdf')) return 'PDF';
    if (filename.toLowerCase().endsWith('.doc')) return 'Word DOC';
    if (filename.toLowerCase().endsWith('.docx')) return 'Word DOCX';
    return 'Document';
  };

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {brochures.map((brochure, index) => (
        <React.Fragment key={index}>
          <ListItem 
            sx={{ 
              borderRadius: 2,
              mb: 1,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'primary.main'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon>
              {getFileIcon(brochure.title || brochure.url)}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="subtitle1" fontWeight={600}>
                  {brochure.title || `Brochure ${index + 1}`}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                  <Chip 
                    label={getFileType(brochure.title || brochure.url)} 
                    size="small" 
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {brochure.size || 'Unknown size'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {brochure.pages ? `${brochure.pages} pages` : ''}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
              <Tooltip title="Preview">
                <IconButton
                  edge="end"
                  onClick={() => onBrochureClick(index)}
                  sx={{ mr: 1 }}
                >
                  <ZoomIn />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download">
                <IconButton
                  edge="end"
                  onClick={() => onDownloadBrochure(
                    brochure.url, 
                    brochure.title || `brochure-${index + 1}.pdf`, 
                    index
                  )}
                >
                  <Download />
                </IconButton>
              </Tooltip>
            </ListItemSecondaryAction>
          </ListItem>
          {index < brochures.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

// Creatives Grid Component
const CreativesGrid: React.FC<{
  creatives: any[];
  onCreativeClick: (index: number) => void;
  onDownloadCreative: (url: string, filename: string, index: number) => void;
  loadingImages: Record<string, boolean>;
  imageErrors: Record<string, boolean>;
  formatImageUrl: (url: string) => string;
  handleImageLoad: (id: string) => void;
  handleImageError: (id: string) => void;
}> = ({
  creatives,
  onCreativeClick,
  onDownloadCreative,
  loadingImages,
  imageErrors,
  formatImageUrl,
  handleImageLoad,
  handleImageError,
}) => {
  return (
    <Grid container spacing={3}>
      {creatives.map((creative, index) => {
        const creativeId = creative._id || `creative-${index}`;
        const creativeUrl = formatImageUrl(creative.url);
        const isImage = creative.type === 'image';
        
        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card 
              sx={{ 
                cursor: isImage ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                border: '2px solid transparent',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                  borderColor: 'primary.main'
                },
                height: '100%'
              }}
              onClick={isImage ? () => onCreativeClick(index) : undefined}
            >
              <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                {isImage ? (
                  <>
                    {!imageErrors[creativeId] && creativeUrl ? (
                      <>
                        {loadingImages[creativeId] && (
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 0, 
                            left: 0, 
                            right: 0, 
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(0,0,0,0.05)',
                            borderRadius: '8px 8px 8px 8px'
                          }}>
                            <CircularProgress size={24} />
                          </Box>
                        )}
                        
                        <Box
                          component="img"
                          src={creativeUrl}
                          alt={creative.title || `Creative ${index + 1}`}
                          onLoad={() => handleImageLoad(creativeId)}
                          onError={() => handleImageError(creativeId)}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '8px 8px 8px 8px',
                            display: loadingImages[creativeId] ? 'none' : 'block'
                          }}
                        />
                      </>
                    ) : (
                      <Box sx={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        borderRadius: '8px 8px 0 0'
                      }}>
                        <BrokenImage sx={{ fontSize: 40, color: '#999', mb: 1 }} />
                        <Typography variant="caption" color="text.secondary">
                          Failed to load
                        </Typography>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box sx={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'primary.50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    borderRadius: '8px 8px 0 0'
                  }}>
                    {creative.type === 'video' ? (
                      <VideoFile sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    ) : creative.type === 'pdf' ? (
                      <PictureAsPdf sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
                    ) : (
                      <InsertDriveFile sx={{ fontSize: 48, color: 'action.main', mb: 1 }} />
                    )}
                    <Chip 
                      label={creative.type?.toUpperCase() || 'FILE'} 
                      size="small" 
                      sx={{ mt: 1 }}
                    />
                  </Box>
                )}
                
                {isImage && !imageErrors[creativeId] && creativeUrl && (
                  <>
                    <Tooltip title="View full screen">
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
                          onCreativeClick(index);
                        }}
                        size="small"
                      >
                        <ZoomIn sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Download">
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 48,
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
                          onDownloadCreative(creativeUrl, creative.title || `creative-${index + 1}.jpg`, index);
                        }}
                        size="small"
                      >
                        <CloudDownload sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                )}
                
                {!isImage && (
                  <Tooltip title="Download">
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
                        onDownloadCreative(creativeUrl, creative.title || `creative-${index + 1}`, index);
                      }}
                      size="small"
                    >
                      <CloudDownload sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {creative.title || `Creative ${index + 1}`}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <Chip 
                    label={creative.category || 'General'} 
                    size="small" 
                    color="primary"
                    variant="outlined"
                  />
                  {/* <Typography variant="caption" color="text.secondary">
                    {creative.size || ''}
                  </Typography> */}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

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
  
  // State
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);
  const [primaryImageLoading, setPrimaryImageLoading] = useState(true);
  const [primaryImageError, setPrimaryImageError] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);
  const [fullscreenVideoIndex, setFullscreenVideoIndex] = useState<number | null>(null);
  const [fullscreenCreativeIndex, setFullscreenCreativeIndex] = useState<number | null>(null);
  const [fullscreenBrochureIndex, setFullscreenBrochureIndex] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Check if user has write permission for property module
  const canEditProperty = getPermissions("property").hasWriteAccess;

  // Format image URL
  const formatImageUrl = (url: string): string => {
    if (!url) return '';
    
    url = url.trim().replace(/^["']|["']$/g, '');
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    if (url.startsWith('data:image')) {
      return url;
    }
    
    if (url.startsWith('/')) {
      return url;
    }
    
    return url;
  };

  // Get primary image URL
  useEffect(() => {
    if (property?.images && property.images.length > 0) {
      const primaryImage = property.images.find(img => img.isPrimary) || property.images[0];
      if (primaryImage && primaryImage.url) {
        const formattedUrl = formatImageUrl(primaryImage.url);
        setPrimaryImageUrl(formattedUrl);
        setPrimaryImageLoading(true);
        setPrimaryImageError(false);
      }
    }
  }, [property]);

  // Handle primary image load
  const handlePrimaryImageLoad = () => {
    setPrimaryImageLoading(false);
    setPrimaryImageError(false);
  };

  // Handle primary image error
  const handlePrimaryImageError = () => {
    console.error("Failed to load primary image:", primaryImageUrl);
    setPrimaryImageLoading(false);
    setPrimaryImageError(true);
  };

  // Handle image load
  const handleImageLoad = (id: string) => {
    setLoadingImages(prev => ({ ...prev, [id]: false }));
    setImageErrors(prev => ({ ...prev, [id]: false }));
  };

  // Handle image error
  const handleImageError = (id: string) => {
    console.error(`Failed to load image: ${id}`);
    setLoadingImages(prev => ({ ...prev, [id]: false }));
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle fullscreen view functions
  const handleImageClick = (index: number) => {
    setFullscreenImageIndex(index);
  };

  const handleVideoClick = (index: number) => {
    setFullscreenVideoIndex(index);
  };

  const handleCreativeClick = (index: number) => {
    setFullscreenCreativeIndex(index);
  };

  const handleBrochureClick = (index: number) => {
    setFullscreenBrochureIndex(index);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImageIndex(null);
    setFullscreenVideoIndex(null);
    setFullscreenCreativeIndex(null);
    setFullscreenBrochureIndex(null);
    setIsFullscreen(false);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Navigation functions for fullscreen view
  const handleNextImage = () => {
    if (fullscreenImageIndex !== null && property?.images) {
      setFullscreenImageIndex((fullscreenImageIndex + 1) % property.images.length);
    }
  };

  const handlePrevImage = () => {
    if (fullscreenImageIndex !== null && property?.images) {
      setFullscreenImageIndex((fullscreenImageIndex - 1 + property.images.length) % property.images.length);
    }
  };

  const handleNextVideo = () => {
    if (fullscreenVideoIndex !== null && property?.videos) {
      setFullscreenVideoIndex((fullscreenVideoIndex + 1) % property.videos.length);
    }
  };

  const handlePrevVideo = () => {
    if (fullscreenVideoIndex !== null && property?.videos) {
      setFullscreenVideoIndex((fullscreenVideoIndex - 1 + property.videos.length) % property.videos.length);
    }
  };

  const handleNextCreative = () => {
    if (fullscreenCreativeIndex !== null && property?.creatives) {
      setFullscreenCreativeIndex((fullscreenCreativeIndex + 1) % property.creatives.length);
    }
  };

  const handlePrevCreative = () => {
    if (fullscreenCreativeIndex !== null && property?.creatives) {
      setFullscreenCreativeIndex((fullscreenCreativeIndex - 1 + property.creatives.length) % property.creatives.length);
    }
  };

  const handleNextBrochure = () => {
    if (fullscreenBrochureIndex !== null && property?.brochureUrls) {
      setFullscreenBrochureIndex((fullscreenBrochureIndex + 1) % property.brochureUrls.length);
    }
  };

  const handlePrevBrochure = () => {
    if (fullscreenBrochureIndex !== null && property?.brochureUrls) {
      setFullscreenBrochureIndex((fullscreenBrochureIndex - 1 + property.brochureUrls.length) % property.brochureUrls.length);
    }
  };

  // Handle keyboard navigation in fullscreen view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenImageIndex !== null || fullscreenVideoIndex !== null || 
          fullscreenCreativeIndex !== null || fullscreenBrochureIndex !== null) {
        if (e.key === 'ArrowRight') {
          if (fullscreenImageIndex !== null) handleNextImage();
          else if (fullscreenVideoIndex !== null) handleNextVideo();
          else if (fullscreenCreativeIndex !== null) handleNextCreative();
          else if (fullscreenBrochureIndex !== null) handleNextBrochure();
        } else if (e.key === 'ArrowLeft') {
          if (fullscreenImageIndex !== null) handlePrevImage();
          else if (fullscreenVideoIndex !== null) handlePrevVideo();
          else if (fullscreenCreativeIndex !== null) handlePrevCreative();
          else if (fullscreenBrochureIndex !== null) handlePrevBrochure();
        } else if (e.key === 'Escape') {
          handleCloseFullscreen();
        }
      }
    };

    if (fullscreenImageIndex !== null || fullscreenVideoIndex !== null || 
        fullscreenCreativeIndex !== null || fullscreenBrochureIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [fullscreenImageIndex, fullscreenVideoIndex, fullscreenCreativeIndex, fullscreenBrochureIndex]);

  if (!property) return null;

  // Check for media existence
  const hasImages = property.images && property.images.length > 0;
  const hasVideos = property.videos && property.videos.length > 0;
  const hasBrochures = property.brochureUrls && property.brochureUrls.length > 0;
  const hasCreatives = property.creatives && property.creatives.length > 0;

  // Get current fullscreen item
  const currentFullscreenImage = fullscreenImageIndex !== null && property.images ? 
    property.images[fullscreenImageIndex] : null;
  
  const currentFullscreenVideo = fullscreenVideoIndex !== null && property.videos ? 
    property.videos[fullscreenVideoIndex] : null;
  
  const currentFullscreenCreative = fullscreenCreativeIndex !== null && property.creatives ? 
    property.creatives[fullscreenCreativeIndex] : null;
  
  const currentFullscreenBrochure = fullscreenBrochureIndex !== null && property.brochureUrls ? 
    property.brochureUrls[fullscreenBrochureIndex] : null;

  // Calculate tab indices
  const getTabIndex = (mediaType: 'images' | 'videos' | 'brochures' | 'creatives') => {
    let index = 0;
    
    if (mediaType === 'images') return 0;
    if (hasImages) index++;
    if (mediaType === 'videos') return index;
    if (hasVideos) index++;
    if (mediaType === 'brochures') return index;
    if (hasBrochures) index++;
    if (mediaType === 'creatives') return index;
    return 0;
  };

  return (
    <>
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
        <PropertyHeader
          property={property}
          onClose={onClose}
          primaryImageUrl={primaryImageUrl}
          primaryImageLoading={primaryImageLoading}
          primaryImageError={primaryImageError}
          handlePrimaryImageLoad={handlePrimaryImageLoad}
          handlePrimaryImageError={handlePrimaryImageError}
        />

        <DialogContent sx={{ p: 0 }}>
          <PropertyQuickActions
            property={property}
            hasImages={hasImages}
            hasVideos={hasVideos}
            hasBrochures={hasBrochures}
            hasCreatives={hasCreatives}
            onDownloadAllMedia={onDownloadAllMedia}
          />

          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <ProjectOverview property={property} />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <LocationCard property={property} />
                <QuickInfoCard property={property} />
              </Grid>
            </Grid>

            {property.parentId === null && (
              <Box sx={{ mt: 4 }}>
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
                    Property Types ({property.subPropertyCount || 0})
                  </Typography>
                </Box>
                <SubPropertiesViewer 
                  parentId={property._id!} 
                  onViewSubProperty={onViewSubProperty}
                />
              </Box>
            )}

            {(hasImages || hasVideos || hasBrochures || hasCreatives) && (
              <PropertyMediaTabs
                property={property}
                tabValue={tabValue}
                onTabChange={handleTabChange}
                hasImages={hasImages}
                hasVideos={hasVideos}
                hasBrochures={hasBrochures}
                hasCreatives={hasCreatives}
              >
                {hasImages && (
                  <TabPanel value={tabValue} index={getTabIndex('images')}>
                    <Box sx={{ px: 2 }}>
                      <PropertyMediaDownloadSection
                        onDownloadImages={() => onDownloadImages(property.images)}
                        showImages={true}
                      />
                      <ImagesGrid
                        images={property.images}
                        onImageClick={handleImageClick}
                        onDownloadImage={(url, filename, index) => onDownloadFile(url, filename)}
                        loadingImages={loadingImages}
                        imageErrors={imageErrors}
                        formatImageUrl={formatImageUrl}
                        handleImageLoad={handleImageLoad}
                        handleImageError={handleImageError}
                      />
                    </Box>
                  </TabPanel>
                )}

                {hasVideos && (
                  <TabPanel value={tabValue} index={getTabIndex('videos')}>
                    <Box sx={{ px: 2 }}>
                      <PropertyMediaDownloadSection
                        onDownloadVideos={() => onDownloadVideos(property.videos)}
                        showVideos={true}
                      />
                      <VideosGrid
                        videos={property.videos}
                        onVideoClick={handleVideoClick}
                        onDownloadVideo={(url, filename, index) => onDownloadFile(url, filename)}
                      />
                    </Box>
                  </TabPanel>
                )}

                {hasBrochures && (
                  <TabPanel value={tabValue} index={getTabIndex('brochures')}>
                    <Box sx={{ px: 2 }}>
                      <PropertyMediaDownloadSection
                        onDownloadBrochures={() => onDownloadBrochures(property.brochureUrls)}
                        showBrochures={true}
                      />
                      <BrochuresList
                        brochures={property.brochureUrls}
                        onBrochureClick={handleBrochureClick}
                        onDownloadBrochure={(url, filename, index) => onDownloadFile(url, filename)}
                      />
                    </Box>
                  </TabPanel>
                )}

                {hasCreatives && (
                  <TabPanel value={tabValue} index={getTabIndex('creatives')}>
                    <Box sx={{ px: 2 }}>
                      <PropertyMediaDownloadSection
                        onDownloadCreatives={() => onDownloadCreatives(property.creatives)}
                        showCreatives={true}
                      />
                      <CreativesGrid
                        creatives={property.creatives}
                        onCreativeClick={handleCreativeClick}
                        onDownloadCreative={(url, filename, index) => onDownloadFile(url, filename)}
                        loadingImages={loadingImages}
                        imageErrors={imageErrors}
                        formatImageUrl={formatImageUrl}
                        handleImageLoad={handleImageLoad}
                        handleImageError={handleImageError}
                      />
                    </Box>
                  </TabPanel>
                )}
              </PropertyMediaTabs>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ 
          py: 2,
          px: {xs: 2, md: 3}, 
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

      {/* Fullscreen Image Viewer */}
      <FullscreenImageViewer
        open={fullscreenImageIndex !== null}
        onClose={handleCloseFullscreen}
        isFullscreen={isFullscreen}
        onFullscreenToggle={handleFullscreenToggle}
        currentItem={currentFullscreenImage}
        itemType="image"
        onDownload={() => onDownloadFile(
          formatImageUrl(currentFullscreenImage!.url), 
          currentFullscreenImage!.title || `image-${fullscreenImageIndex! + 1}.jpg`
        )}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        currentIndex={fullscreenImageIndex || 0}
        totalItems={property.images?.length || 0}
        title={currentFullscreenImage?.title || `Image ${fullscreenImageIndex! + 1}`}
        showNavigation={true}
      />

      {/* Fullscreen Video Viewer */}
      <FullscreenImageViewer
        open={fullscreenVideoIndex !== null}
        onClose={handleCloseFullscreen}
        isFullscreen={isFullscreen}
        onFullscreenToggle={handleFullscreenToggle}
        currentItem={currentFullscreenVideo}
        itemType="video"
        onDownload={() => onDownloadFile(
          formatImageUrl(currentFullscreenVideo!.url), 
          currentFullscreenVideo!.title || `video-${fullscreenVideoIndex! + 1}.mp4`
        )}
        onPrev={handlePrevVideo}
        onNext={handleNextVideo}
        currentIndex={fullscreenVideoIndex || 0}
        totalItems={property.videos?.length || 0}
        title={currentFullscreenVideo?.title || `Video ${fullscreenVideoIndex! + 1}`}
        showNavigation={true}
      />

      {/* Fullscreen Creative Viewer (Image Type) */}
      {currentFullscreenCreative && currentFullscreenCreative.type === 'image' && (
        <FullscreenImageViewer
          open={fullscreenCreativeIndex !== null && currentFullscreenCreative?.type === 'image'}
          onClose={handleCloseFullscreen}
          isFullscreen={isFullscreen}
          onFullscreenToggle={handleFullscreenToggle}
          currentItem={currentFullscreenCreative}
          itemType="image"
          onDownload={() => onDownloadFile(
            formatImageUrl(currentFullscreenCreative.url), 
            currentFullscreenCreative.title || `creative-${fullscreenCreativeIndex! + 1}.jpg`
          )}
          onPrev={handlePrevCreative}
          onNext={handleNextCreative}
          currentIndex={fullscreenCreativeIndex || 0}
          totalItems={property.creatives?.length || 0}
          title={currentFullscreenCreative?.title || `Creative ${fullscreenCreativeIndex! + 1}`}
          showNavigation={true}
        />
      )}

      {/* Fullscreen Brochure Viewer */}
      {currentFullscreenBrochure && (
        <FullscreenImageViewer
          open={fullscreenBrochureIndex !== null}
          onClose={handleCloseFullscreen}
          isFullscreen={false}
          onFullscreenToggle={() => {}}
          currentItem={currentFullscreenBrochure}
          itemType="brochure"
          onDownload={() => onDownloadFile(
            formatImageUrl(currentFullscreenBrochure.url), 
            currentFullscreenBrochure.title || `brochure-${fullscreenBrochureIndex! + 1}.pdf`
          )}
          onPrev={handlePrevBrochure}
          onNext={handleNextBrochure}
          currentIndex={fullscreenBrochureIndex || 0}
          totalItems={property.brochureUrls?.length || 0}
          title={currentFullscreenBrochure?.title || `Brochure ${fullscreenBrochureIndex! + 1}`}
          showNavigation={property.brochureUrls?.length > 1}
        />
      )}
    </>
  );
};

export default PropertyViewDialog;
