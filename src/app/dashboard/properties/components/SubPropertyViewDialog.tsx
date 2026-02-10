// app/dashboard/properties/components/SubPropertyViewDialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  CloudDownload,
  Edit,
  Close,
} from "@mui/icons-material";
import { Property } from '@/services/propertyService';
import { useAuth } from "@/contexts/AuthContext";

// Import components
import SubPropertyHeader from "./sub-property/SubPropertyHeader";
import QuickActionsBar from "./sub-property/QuickActionsBar";
import PropertyDetailsSection from "./sub-property/PropertyDetailsSection";
import SideInfoCard from "./sub-property/SideInfoCard";
import MediaTabs from "./sub-property/MediaTabs";
import MediaDownloadSection from "./sub-property/MediaDownloadSection";
import ImageGrid from "./sub-property/ImageGrid";
import FullscreenImageViewer from "./sub-property/FullscreenImageViewer";

// Types
import { TabPanel } from "./shared/TabPanel";
import { Grid } from "@mui/system";

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
  const { getPermissions } = useAuth();
  
  // State
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [primaryImageUrl, setPrimaryImageUrl] = useState<string | null>(null);
  const [primaryImageLoading, setPrimaryImageLoading] = useState(true);
  const [primaryImageError, setPrimaryImageError] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState<number | null>(null);
  const [fullscreenFloorPlanIndex, setFullscreenFloorPlanIndex] = useState<number | null>(null);
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
    if (property?.propertyImages && property.propertyImages.length > 0) {
      let primaryImageUrl = null;
      
      if (typeof property.propertyImages[0] === 'string') {
        primaryImageUrl = formatImageUrl(property.propertyImages[0]);
      } else if (property.propertyImages[0] && typeof property.propertyImages[0] === 'object') {
        const imagesArray = property.propertyImages as Array<{url: string; isPrimary?: boolean}>;
        const primaryImage = imagesArray.find(img => img.isPrimary) || imagesArray[0];
        primaryImageUrl = formatImageUrl(primaryImage.url);
      }
      
      if (primaryImageUrl) {
        setPrimaryImageUrl(primaryImageUrl);
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

  // Get property type color
  const getPropertyTypeColor = (type: string) => {
    switch(type) {
      case 'residential': return 'primary';
      case 'commercial': return 'warning';
      case 'plot': return 'info';
      default: return 'default';
    }
  };

  // Extract image data
  const extractImageData = (image: any, index: number) => {
    let url = '';
    let title = '';
    let id = '';
    
    if (typeof image === 'string') {
      url = formatImageUrl(image);
      title = `Image ${index + 1}`;
      id = `image-${index}`;
    } else if (image && typeof image === 'object') {
      url = formatImageUrl(image.url);
      title = image.title || `Image ${index + 1}`;
      id = image._id || `image-${index}`;
    }
    
    return { url, title, id };
  };

  // Extract floor plan data
  const extractFloorPlanData = (floorPlan: any, index: number) => {
    let url = '';
    let title = '';
    let id = '';
    
    if (typeof floorPlan === 'string') {
      url = formatImageUrl(floorPlan);
      title = `Floor Plan ${index + 1}`;
      id = `floorplan-${index}`;
    } else if (floorPlan && typeof floorPlan === 'object') {
      url = formatImageUrl(floorPlan.url || floorPlan.imageUrl);
      title = floorPlan.title || floorPlan.name || `Floor Plan ${index + 1}`;
      id = floorPlan._id || `floorplan-${index}`;
    }
    
    return { url, title, id };
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle fullscreen view functions
  const handleImageClick = (index: number) => {
    setFullscreenImageIndex(index);
  };

  const handleFloorPlanClick = (index: number) => {
    setFullscreenFloorPlanIndex(index);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImageIndex(null);
    setFullscreenFloorPlanIndex(null);
    setIsFullscreen(false);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Navigation functions for fullscreen view
  const handleNextImage = () => {
    if (fullscreenImageIndex !== null && property?.propertyImages) {
      setFullscreenImageIndex((fullscreenImageIndex + 1) % property.propertyImages.length);
    }
  };

  const handlePrevImage = () => {
    if (fullscreenImageIndex !== null && property?.propertyImages) {
      setFullscreenImageIndex((fullscreenImageIndex - 1 + property.propertyImages.length) % property.propertyImages.length);
    }
  };

  const handleNextFloorPlan = () => {
    if (fullscreenFloorPlanIndex !== null && property?.floorPlans) {
      setFullscreenFloorPlanIndex((fullscreenFloorPlanIndex + 1) % property.floorPlans.length);
    }
  };

  const handlePrevFloorPlan = () => {
    if (fullscreenFloorPlanIndex !== null && property?.floorPlans) {
      setFullscreenFloorPlanIndex((fullscreenFloorPlanIndex - 1 + property.floorPlans.length) % property.floorPlans.length);
    }
  };

  // Handle keyboard navigation in fullscreen view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenImageIndex !== null || fullscreenFloorPlanIndex !== null) {
        if (e.key === 'ArrowRight') {
          fullscreenImageIndex !== null ? handleNextImage() : handleNextFloorPlan();
        } else if (e.key === 'ArrowLeft') {
          fullscreenImageIndex !== null ? handlePrevImage() : handlePrevFloorPlan();
        } else if (e.key === 'Escape') {
          handleCloseFullscreen();
        }
      }
    };

    if (fullscreenImageIndex !== null || fullscreenFloorPlanIndex !== null) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [fullscreenImageIndex, fullscreenFloorPlanIndex]);

  if (!property) return null;

  // Check for media existence
  const hasFloorPlans = property.floorPlans && property.floorPlans.length > 0;
  const hasPropertyImages = property.propertyImages && property.propertyImages.length > 0;
  const propertyTypeColor = getPropertyTypeColor(property.propertyType);

  // Get current fullscreen item
  const currentFullscreenImage = fullscreenImageIndex !== null && property.propertyImages ? 
    property.propertyImages[fullscreenImageIndex] : null;
  
  const currentFullscreenFloorPlan = fullscreenFloorPlanIndex !== null && property.floorPlans ? 
    property.floorPlans[fullscreenFloorPlanIndex] : null;

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
        <SubPropertyHeader
          property={property}
          onClose={onClose}
          primaryImageUrl={primaryImageUrl}
          primaryImageLoading={primaryImageLoading}
          primaryImageError={primaryImageError}
          propertyTypeColor={propertyTypeColor}
          formatImageUrl={formatImageUrl}
          handlePrimaryImageLoad={handlePrimaryImageLoad}
          handlePrimaryImageError={handlePrimaryImageError}
        />

        <DialogContent sx={{ p: 0 }}>
          <QuickActionsBar
            property={property}
            propertyTypeColor={propertyTypeColor}
            hasFloorPlans={hasFloorPlans}
            hasPropertyImages={hasPropertyImages}
            onDownloadAllMedia={onDownloadAllMedia}
          />

          <Box sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
              <PropertyDetailsSection
                property={property}
                propertyTypeColor={propertyTypeColor}
              />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <SideInfoCard
                  property={property}
                  propertyTypeColor={propertyTypeColor}
                  hasFloorPlans={hasFloorPlans}
                />
              </Grid>
            </Grid>

            {(hasPropertyImages || hasFloorPlans) && (
              <MediaTabs
                property={property}
                propertyTypeColor={propertyTypeColor}
                tabValue={tabValue}
                onTabChange={handleTabChange}
                hasPropertyImages={hasPropertyImages}
                hasFloorPlans={hasFloorPlans}
              >
                {hasPropertyImages && (
                  <TabPanel value={tabValue} index={0}>
                    <Box sx={{ px: 2 }}>
                      <MediaDownloadSection
                        onDownloadImages={() => onDownloadImages(property.propertyImages)}
                        showImages={true}
                        onDownloadFloorPlans={() => onDownloadImages(property.floorPlans)}
                        showFloorPlans={false}
                      />
                      <ImageGrid
                        items={property.propertyImages}
                        type="images"
                        onItemClick={handleImageClick}
                        onDownloadItem={(url, title, index) => onDownloadFile(url, `${title}.jpg`)}
                        loadingImages={loadingImages}
                        imageErrors={imageErrors}
                        extractItemData={extractImageData}
                        formatImageUrl={formatImageUrl}
                        handleImageLoad={handleImageLoad}
                        handleImageError={handleImageError}
                        propertyTypeColor={propertyTypeColor}
                      />
                    </Box>
                  </TabPanel>
                )}

                {hasFloorPlans && (
                  <TabPanel value={tabValue} index={hasPropertyImages ? 1 : 0}>
                    <Box sx={{ px: 2 }}>
                      <MediaDownloadSection
                        onDownloadImages={() => onDownloadImages(property.propertyImages)}
                        showImages={false}
                        onDownloadFloorPlans={() => onDownloadImages(property.floorPlans)}
                        showFloorPlans={true}
                      />
                      <ImageGrid
                        items={property.floorPlans}
                        type="floorPlans"
                        onItemClick={handleFloorPlanClick}
                        onDownloadItem={(url, title, index) => onDownloadFile(url, `${title}.jpg`)}
                        loadingImages={loadingImages}
                        imageErrors={imageErrors}
                        extractItemData={extractFloorPlanData}
                        formatImageUrl={formatImageUrl}
                        handleImageLoad={handleImageLoad}
                        handleImageError={handleImageError}
                        propertyTypeColor={propertyTypeColor}
                      />
                    </Box>
                  </TabPanel>
                )}
              </MediaTabs>
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

      <FullscreenImageViewer
        open={fullscreenImageIndex !== null}
        onClose={handleCloseFullscreen}
        isFullscreen={isFullscreen}
        onFullscreenToggle={handleFullscreenToggle}
        currentItem={currentFullscreenImage}
        itemType="image"
        onDownload={() => {
          const { url, title } = extractImageData(currentFullscreenImage!, fullscreenImageIndex!);
          onDownloadFile(url, `${title}.jpg`);
        }}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        currentIndex={fullscreenImageIndex}
        totalItems={property.propertyImages?.length || 0}
        extractData={extractImageData}
      />

      <FullscreenImageViewer
        open={fullscreenFloorPlanIndex !== null}
        onClose={handleCloseFullscreen}
        isFullscreen={isFullscreen}
        onFullscreenToggle={handleFullscreenToggle}
        currentItem={currentFullscreenFloorPlan}
        itemType="floorPlan"
        onDownload={() => {
          const { url, title } = extractFloorPlanData(currentFullscreenFloorPlan!, fullscreenFloorPlanIndex!);
          onDownloadFile(url, `${title}.jpg`);
        }}
        onPrev={handlePrevFloorPlan}
        onNext={handleNextFloorPlan}
        currentIndex={fullscreenFloorPlanIndex}
        totalItems={property.floorPlans?.length || 0}
        extractData={extractFloorPlanData}
      />
    </>
  );
};

export default SubPropertyViewDialog;
