"use client";

import React from "react";
import { Property } from '@/services/propertyService';
import FullscreenImageViewer from "./FullscreenImageViewer";

interface FullscreenViewersProps {
  property: Property;
  fullscreenImageIndex: number | null;
  fullscreenVideoIndex: number | null;
  fullscreenCreativeIndex: number | null;
  fullscreenBrochureIndex: number | null;
  isFullscreen: boolean;
  onCloseFullscreen: () => void;
  onFullscreenToggle: () => void;
  onDownloadFile: (url: string, filename: string) => Promise<void>;
  formatImageUrl: (url: string) => string;
}

const FullscreenViewers: React.FC<FullscreenViewersProps> = ({
  property,
  fullscreenImageIndex,
  fullscreenVideoIndex,
  fullscreenCreativeIndex,
  fullscreenBrochureIndex,
  isFullscreen,
  onCloseFullscreen,
  onFullscreenToggle,
  onDownloadFile,
  formatImageUrl,
}) => {
  const currentFullscreenImage = fullscreenImageIndex !== null && property.images ? 
    property.images[fullscreenImageIndex] : null;
  
  const currentFullscreenVideo = fullscreenVideoIndex !== null && property.videos ? 
    property.videos[fullscreenVideoIndex] : null;
  
  const currentFullscreenCreative = fullscreenCreativeIndex !== null && property.creatives ? 
    property.creatives[fullscreenCreativeIndex] : null;
  
  const currentFullscreenBrochure = fullscreenBrochureIndex !== null && property.brochureUrls ? 
    property.brochureUrls[fullscreenBrochureIndex] : null;

  return (
    <>
      {/* Fullscreen Image Viewer */}
      {currentFullscreenImage && (
        <FullscreenImageViewer
          open={fullscreenImageIndex !== null}
          onClose={onCloseFullscreen}
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
          currentItem={currentFullscreenImage}
          itemType="image"
          onDownload={() => onDownloadFile(
            formatImageUrl(currentFullscreenImage.url), 
            currentFullscreenImage.title || `image-${fullscreenImageIndex! + 1}.jpg`
          )}
          currentIndex={fullscreenImageIndex || 0}
          totalItems={property.images?.length || 0}
          title={currentFullscreenImage.title || `Image ${fullscreenImageIndex! + 1}`}
        />
      )}

      {/* Fullscreen Video Viewer */}
      {currentFullscreenVideo && (
        <FullscreenImageViewer
          open={fullscreenVideoIndex !== null}
          onClose={onCloseFullscreen}
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
          currentItem={currentFullscreenVideo}
          itemType="video"
          onDownload={() => onDownloadFile(
            formatImageUrl(currentFullscreenVideo.url), 
            currentFullscreenVideo.title || `video-${fullscreenVideoIndex! + 1}.mp4`
          )}
          currentIndex={fullscreenVideoIndex || 0}
          totalItems={property.videos?.length || 0}
          title={currentFullscreenVideo.title || `Video ${fullscreenVideoIndex! + 1}`}
        />
      )}

      {/* Fullscreen Creative Viewer (Image Type) */}
      {currentFullscreenCreative && currentFullscreenCreative.type === 'image' && (
        <FullscreenImageViewer
          open={fullscreenCreativeIndex !== null && currentFullscreenCreative?.type === 'image'}
          onClose={onCloseFullscreen}
          isFullscreen={isFullscreen}
          onFullscreenToggle={onFullscreenToggle}
          currentItem={currentFullscreenCreative}
          itemType="image"
          onDownload={() => onDownloadFile(
            formatImageUrl(currentFullscreenCreative.url), 
            currentFullscreenCreative.title || `creative-${fullscreenCreativeIndex! + 1}.jpg`
          )}
          currentIndex={fullscreenCreativeIndex || 0}
          totalItems={property.creatives?.length || 0}
          title={currentFullscreenCreative.title || `Creative ${fullscreenCreativeIndex! + 1}`}
        />
      )}

      {/* Fullscreen Brochure Viewer */}
      {currentFullscreenBrochure && (
        <FullscreenImageViewer
          open={fullscreenBrochureIndex !== null}
          onClose={onCloseFullscreen}
          isFullscreen={false}
          onFullscreenToggle={() => {}}
          currentItem={currentFullscreenBrochure}
          itemType="brochure"
          onDownload={() => onDownloadFile(
            formatImageUrl(currentFullscreenBrochure.url), 
            currentFullscreenBrochure.title || `brochure-${fullscreenBrochureIndex! + 1}.pdf`
          )}
          currentIndex={fullscreenBrochureIndex || 0}
          totalItems={property.brochureUrls?.length || 0}
          title={currentFullscreenBrochure.title || `Brochure ${fullscreenBrochureIndex! + 1}`}
        />
      )}
    </>
  );
};

export default FullscreenViewers;