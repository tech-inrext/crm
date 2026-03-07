"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Button,
  Grid,
} from "@mui/material";
import { Edit, Close } from "@mui/icons-material";
import { Property } from '@/services/propertyService';
import { useAuth } from "@/contexts/AuthContext";

// Import components
import PropertyHeader from "./components/PropertyHeader";
import PropertyQuickActions from "./components/PropertyQuickActions";
import PropertyContent from "./components/PropertyContent";
import PropertyMediaSection from "./components/PropertyMediaSection";

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

  if (!property) return null;

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
            onDownloadAllMedia={onDownloadAllMedia}
          />

          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4}>
              <PropertyContent 
                property={property}
                onViewSubProperty={onViewSubProperty}
              />
            </Grid>

            <PropertyMediaSection
              property={property}
              tabValue={tabValue}
              onTabChange={handleTabChange}
              onDownloadImages={onDownloadImages}
              onDownloadVideos={onDownloadVideos}
              onDownloadBrochures={onDownloadBrochures}
              onDownloadCreatives={onDownloadCreatives}
              onDownloadFile={onDownloadFile}
              onImageClick={handleImageClick}
              onVideoClick={handleVideoClick}
              onCreativeClick={handleCreativeClick}
              onBrochureClick={handleBrochureClick}
              loadingImages={loadingImages}
              imageErrors={imageErrors}
              formatImageUrl={formatImageUrl}
              handleImageLoad={handleImageLoad}
              handleImageError={handleImageError}
            />
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
    </>
  );
};

export default PropertyViewDialog;