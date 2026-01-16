import { useState, useCallback } from "react";
import { toast } from "sonner";
import { propertyService, type Property } from "@/services/propertyService";
import { uploadService } from "@/services/uploadService";

interface UsePropertyMediaProps {
  loadProperties: () => Promise<void>;
  formData: any;
  setFormData: (data: any) => void;
}

export const usePropertyMedia = ({ loadProperties, formData, setFormData }: UsePropertyMediaProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  // File upload functions
  const handleFileUpload = useCallback(async (files: FileList, field: string) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    setUploading(true);
    
    try {
      const uploadPromises = fileArray.map(async (file) => {
        const fileId = `${field}-${Date.now()}-${Math.random()}`;

        try {
          uploadService.validateFileSize(file, 200);
          setUploadProgress((prev) => ({ ...prev, [fileId]: 10 }));
          
          const uploadResponse = await uploadService.uploadFile(file);
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

          if (uploadResponse.success && uploadResponse.data) {
            const newFile = {
              url: uploadResponse.data.url,
              title: file.name.replace(/\.[^/.]+$/, ""),
              description: "",
              isPrimary: formData[field].length === 0,
              uploadedAt: new Date().toISOString(),
              fileSize: uploadResponse.data.fileSize,
              fileType: uploadResponse.data.fileType,
              originalName: uploadResponse.data.originalName,
            };

            return { success: true, file: newFile, fileName: file.name };
          } else {
            return {
              success: false,
              error: uploadResponse.message,
              fileName: file.name,
            };
          }
        } catch (error: any) {
          return { success: false, error: error.message, fileName: file.name };
        } finally {
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result) => result.success);
      const failedUploads = results.filter((result) => !result.success);

      if (successfulUploads.length > 0) {
        const newFiles = successfulUploads.map((result) => result.file);
        setFormData((prev: any) => ({
          ...prev,
          [field]: [...prev[field], ...newFiles],
        }));
      }

      if (successfulUploads.length > 0) {
        toast.success(
          `Successfully uploaded ${successfulUploads.length} file(s) to S3`
        );
      }

      if (failedUploads.length > 0) {
        failedUploads.forEach((result) => {
          toast.error(`Failed to upload ${result.fileName}: ${result.error}`);
        });
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [formData, setFormData]);

  // Toggle public/private
  const handleTogglePublic = useCallback(async (id: string, isPublic: boolean) => {
    try {
      const toastId = toast.loading(
        `Making property ${isPublic ? "public" : "private"}...`
      );
      await propertyService.togglePublicVisibility(id, isPublic);
      toast.success(`Property is now ${isPublic ? "public" : "private"}`, {
        id: toastId,
      });
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to update property visibility");
    }
  }, [loadProperties]);

  // Toggle featured status
  const handleToggleFeatured = useCallback(async (id: string, isFeatured: boolean) => {
    try {
      const toastId = toast.loading(
        `${isFeatured ? "Adding to" : "Removing from"} featured properties...`
      );
      await propertyService.toggleFeaturedStatus(id, isFeatured);
      toast.success(
        `Property ${isFeatured ? "added to" : "removed from"} featured list`,
        { id: toastId }
      );
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to update featured status");
    }
  }, [loadProperties]);

  // Download utility functions
  const handleDownloadFile = useCallback(async (url: string, filename: string) => {
    try {
      if (url.startsWith("data:")) {
        toast.error(
          "Cannot download base64 files. File needs to be re-uploaded to S3."
        );
        return;
      }

      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`Downloading ${filename}`);
    } catch (error: any) {
      console.error("Download error:", error);
      toast.error(`Failed to download ${filename}: ${error.message}`);
    }
  }, []);

  const handleDownloadImages = useCallback(async (images: any[]) => {
    const validImages = images.filter((img) => {
      const url = typeof img === "string" ? img : img.url;
      return !url.startsWith("data:");
    });

    if (validImages.length === 0) {
      toast.error(
        "No downloadable images found (base64 images cannot be downloaded)"
      );
      return;
    }

    const toastId = toast.loading(
      `Downloading ${validImages.length} images...`
    );
    try {
      for (const image of validImages) {
        const imageUrl = typeof image === "string" ? image : image.url;
        const imageName =
          typeof image === "string"
            ? `image-${validImages.indexOf(image) + 1}.jpg`
            : image.title || `image-${validImages.indexOf(image) + 1}.jpg`;

        await handleDownloadFile(imageUrl, imageName);
      }
      toast.success(`Downloaded ${validImages.length} images`, { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to download images: ${error.message}`, {
        id: toastId,
      });
    }
  }, [handleDownloadFile]);

  const handleDownloadVideos = useCallback(async (videos: any[]) => {
    const validVideos = videos.filter(
      (video) => !video.url.startsWith("data:")
    );

    if (validVideos.length === 0) {
      toast.error("No downloadable videos found");
      return;
    }

    const toastId = toast.loading(
      `Downloading ${validVideos.length} videos...`
    );
    try {
      for (const video of validVideos) {
        const videoUrl = video.url;
        const videoName =
          video.title || `video-${validVideos.indexOf(video) + 1}.mp4`;

        await handleDownloadFile(videoUrl, videoName);
      }
      toast.success(`Downloaded ${validVideos.length} videos`, { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to download videos: ${error.message}`, {
        id: toastId,
      });
    }
  }, [handleDownloadFile]);

  const handleDownloadBrochures = useCallback(async (brochures: any[]) => {
    const validBrochures = brochures.filter(
      (brochure) => !brochure.url.startsWith("data:")
    );

    if (validBrochures.length === 0) {
      toast.error("No downloadable brochures found");
      return;
    }

    const toastId = toast.loading(
      `Downloading ${validBrochures.length} brochures...`
    );
    try {
      for (const brochure of validBrochures) {
        const brochureUrl = brochure.url;
        const brochureName =
          brochure.title ||
          `brochure-${validBrochures.indexOf(brochure) + 1}.pdf`;

        await handleDownloadFile(brochureUrl, brochureName);
      }
      toast.success(`Downloaded ${validBrochures.length} brochures`, {
        id: toastId,
      });
    } catch (error: any) {
      toast.error(`Failed to download brochures: ${error.message}`, {
        id: toastId,
      });
    }
  }, [handleDownloadFile]);

  const handleDownloadCreatives = useCallback(async (creatives: any[]) => {
    const validCreatives = creatives.filter(
      (creative) => !creative.url.startsWith("data:")
    );

    if (validCreatives.length === 0) {
      toast.error("No downloadable creatives found");
      return;
    }

    const toastId = toast.loading(
      `Downloading ${validCreatives.length} creatives...`
    );
    try {
      for (const creative of validCreatives) {
        const creativeUrl = creative.url;
        const extension = creative.type === "video" ? "mp4" : "jpg";
        const creativeName =
          creative.title ||
          `creative-${validCreatives.indexOf(creative) + 1}.${extension}`;

        await handleDownloadFile(creativeUrl, creativeName);
      }
      toast.success(`Downloaded ${validCreatives.length} creatives`, {
        id: toastId,
      });
    } catch (error: any) {
      toast.error(`Failed to download creatives: ${error.message}`, {
        id: toastId,
      });
    }
  }, [handleDownloadFile]);

  const handleDownloadAllMedia = useCallback(async (property: Property) => {
    const toastId = toast.loading("Preparing all media for download...");
    try {
      const allMedia: Array<{ url: string; name: string }> = [];

      const addIfValid = (items: any[], folder: string) => {
        if (!items || !Array.isArray(items)) return;

        items.forEach((item, index) => {
          const itemUrl = typeof item === "string" ? item : item.url;
          if (itemUrl && !itemUrl.startsWith("data:")) {
            const itemName =
              typeof item === "string"
                ? `${folder}/file-${index + 1}`
                : `${folder}/${item.title || `file-${index + 1}`}`;
            allMedia.push({ url: itemUrl, name: itemName });
          }
        });
      };

      addIfValid(property.images, "images");
      addIfValid(property.videos, "videos");
      addIfValid(property.brochureUrls, "brochures");
      addIfValid(property.creatives, "creatives");
      addIfValid(property.propertyImages, "property-images");
      addIfValid(property.floorPlans, "floor-plans");

      if (allMedia.length === 0) {
        toast.info("No downloadable media files found", { id: toastId });
        return;
      }

      toast.success(`Downloading ${allMedia.length} files from S3...`, {
        id: toastId,
      });

      for (const media of allMedia) {
        await handleDownloadFile(media.url, media.name);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      toast.success(`Downloaded ${allMedia.length} files from S3`, {
        id: toastId,
      });
    } catch (error: any) {
      toast.error(`Failed to download media: ${error.message}`, {
        id: toastId,
      });
    }
  }, [handleDownloadFile]);

  return {
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
    handleFileUpload,
    handleTogglePublic,
    handleToggleFeatured,
    handleDownloadAllMedia,
    handleDownloadImages,
    handleDownloadVideos,
    handleDownloadBrochures,
    handleDownloadCreatives,
    handleDownloadFile
  };
};