"use client";

import React from "react";
import { Box } from "@mui/material";
import { Property } from '@/services/propertyService';
import PropertyMediaTabs from "../../property-view/MediaTabs";
import PropertyMediaDownloadSection from "../../property-view/MediaDownloadSection";
import ImagesGrid from "../../property-view/ImagesGrid";
import VideosGrid from "./VideosGrid";
import BrochuresList from "./BrochuresList";
import CreativesGrid from "./CreativesGrid";

interface PropertyMediaSectionProps {
  property: Property;
  tabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
  onDownloadImages: (images: any[]) => Promise<void>;
  onDownloadVideos: (videos: any[]) => Promise<void>;
  onDownloadBrochures: (brochures: any[]) => Promise<void>;
  onDownloadCreatives: (creatives: any[]) => Promise<void>;
  onDownloadFile: (url: string, filename: string) => Promise<void>;
  onImageClick: (index: number) => void;
  onVideoClick: (index: number) => void;
  onCreativeClick: (index: number) => void;
  onBrochureClick: (index: number) => void;
  loadingImages: Record<string, boolean>;
  imageErrors: Record<string, boolean>;
  formatImageUrl: (url: string) => string;
  handleImageLoad: (id: string) => void;
  handleImageError: (id: string) => void;
  // Add fullscreen props
  fullscreenImageIndex?: number | null;
  fullscreenVideoIndex?: number | null;
  fullscreenCreativeIndex?: number | null;
  fullscreenBrochureIndex?: number | null;
}

const PropertyMediaSection: React.FC<PropertyMediaSectionProps> = ({
  property,
  tabValue,
  onTabChange,
  onDownloadImages,
  onDownloadVideos,
  onDownloadBrochures,
  onDownloadCreatives,
  onDownloadFile,
  onImageClick,
  onVideoClick,
  onCreativeClick,
  onBrochureClick,
  loadingImages,
  imageErrors,
  formatImageUrl,
  handleImageLoad,
  handleImageError,
  // Destructure fullscreen props (optional)
  fullscreenImageIndex,
  fullscreenVideoIndex,
  fullscreenCreativeIndex,
  fullscreenBrochureIndex,
}) => {
  const hasImages = property.images && property.images.length > 0;
  const hasVideos = property.videos && property.videos.length > 0;
  const hasBrochures = property.brochureUrls && property.brochureUrls.length > 0;
  const hasCreatives = property.creatives && property.creatives.length > 0;

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

  if (!hasImages && !hasVideos && !hasBrochures && !hasCreatives) {
    return null;
  }

  return (
    <>
      <PropertyMediaTabs
        property={property}
        tabValue={tabValue}
        onTabChange={onTabChange}
        hasImages={hasImages}
        hasVideos={hasVideos}
        hasBrochures={hasBrochures}
        hasCreatives={hasCreatives}
      >
        {hasImages && (
          <div role="tabpanel" hidden={tabValue !== getTabIndex('images')}>
            {tabValue === getTabIndex('images') && (
              <Box sx={{ py: 3, px: 2 }}>
                <PropertyMediaDownloadSection
                  onDownloadImages={() => onDownloadImages(property.images)}
                  showImages={true}
                />
                <ImagesGrid
                  images={property.images}
                  onImageClick={onImageClick}
                  onDownloadImage={(url, filename, index) => onDownloadFile(url, filename)}
                  loadingImages={loadingImages}
                  imageErrors={imageErrors}
                  formatImageUrl={formatImageUrl}
                  handleImageLoad={handleImageLoad}
                  handleImageError={handleImageError}
                />
              </Box>
            )}
          </div>
        )}

        {hasVideos && (
          <div role="tabpanel" hidden={tabValue !== getTabIndex('videos')}>
            {tabValue === getTabIndex('videos') && (
              <Box sx={{ py: 3, px: 2 }}>
                <PropertyMediaDownloadSection
                  onDownloadVideos={() => onDownloadVideos(property.videos)}
                  showVideos={true}
                />
                <VideosGrid
                  videos={property.videos}
                  onVideoClick={onVideoClick}
                  onDownloadVideo={(url, filename, index) => onDownloadFile(url, filename)}
                />
              </Box>
            )}
          </div>
        )}

        {hasBrochures && (
          <div role="tabpanel" hidden={tabValue !== getTabIndex('brochures')}>
            {tabValue === getTabIndex('brochures') && (
              <Box sx={{ py: 3, px: 2 }}>
                <PropertyMediaDownloadSection
                  onDownloadBrochures={() => onDownloadBrochures(property.brochureUrls)}
                  showBrochures={true}
                />
                <BrochuresList
                  brochures={property.brochureUrls}
                  onBrochureClick={onBrochureClick}
                  onDownloadBrochure={(url, filename, index) => onDownloadFile(url, filename)}
                />
              </Box>
            )}
          </div>
        )}

        {hasCreatives && (
          <div role="tabpanel" hidden={tabValue !== getTabIndex('creatives')}>
            {tabValue === getTabIndex('creatives') && (
              <Box sx={{ py: 3, px: 2 }}>
                <PropertyMediaDownloadSection
                  onDownloadCreatives={() => onDownloadCreatives(property.creatives)}
                  showCreatives={true}
                />
                <CreativesGrid
                  creatives={property.creatives}
                  onCreativeClick={onCreativeClick}
                  onDownloadCreative={(url, filename, index) => onDownloadFile(url, filename)}
                  loadingImages={loadingImages}
                  imageErrors={imageErrors}
                  formatImageUrl={formatImageUrl}
                  handleImageLoad={handleImageLoad}
                  handleImageError={handleImageError}
                />
              </Box>
            )}
          </div>
        )}
      </PropertyMediaTabs>
    </>
  );
};

export default PropertyMediaSection;
