// app/dashboard/properties/hooks/usePropertyManagement.ts
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { propertyService, type Property } from "@/services/propertyService";
import { uploadService } from "@/services/uploadService";

const PROPERTIES_PER_PAGE = 6;

export const usePropertyManagement = () => {
  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSubPropertyDialog, setOpenSubPropertyDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [selectedSubProperty, setSelectedSubProperty] = useState<Property | null>(null);
  
  const [filters, setFilters] = useState({
    propertyType: "",
    status: "",
    location: "",
    builderName: "",
    visibility: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: "",
    builderName: "",
    location: "",
    paymentPlan: "",
    propertyType: [] as string[],
    description: "",
    propertyName: "",
    propertyDescription: "",
    price: "",
    minSize: "",
    maxSize: "",
    sizeUnit: "",
    bedrooms: 0,
    bathrooms: 0,
    toilet: 0,
    balcony: 0,
    carpetArea: "",
    builtUpArea: "",
    ownershipType: "Freehold" as "Freehold" | "Leasehold" | "GPA" | "Power of Attorney",
    landType: "Residential Plot" as "Residential Plot" | "Commercial Plot" | "Farm Land" | "Industrial Plot" | "Mixed Use",
    approvedBy: "",
    boundaryWall: false,
    amenities: [] as string[],
    status: [] as string[],
    nearby: [] as string[],
    projectHighlights: [] as string[],
    images: [] as any[],
    propertyImages: [] as any[],
    floorPlans: [] as any[],
    creatives: [] as any[],
    videos: [] as any[],
    brochureUrls: [] as any[],
    mapLocation: { lat: 0, lng: 0 },
    isActive: true,
    isPublic: false,
    isFeatured: false,
    parentId: null as string | null,
    residentialProperties: [] as any[],
    commercialProperties: [] as any[],
    plotProperties: [] as any[],
  });

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.status) count++;
    if (filters.location) count++;
    if (filters.builderName) count++;
    if (filters.visibility) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Form validation
  useEffect(() => {
    const requiredFieldsValid =
      formData.projectName?.trim().length >= 2 &&
      formData.builderName?.trim().length >= 2 &&
      formData.location?.trim().length > 0 &&
      formData.paymentPlan?.trim().length > 0 &&
      formData.propertyType &&
      formData.propertyType.length > 0;
    
    let hasBase64 = false;
    const checkArray = (arr: any[]) => {
      if (!arr || !Array.isArray(arr)) return false;
      return arr.some(
        (item) => item && item.url && item.url.startsWith("data:")
      );
    };

    hasBase64 =
      checkArray(formData.images) ||
      checkArray(formData.propertyImages) ||
      checkArray(formData.floorPlans) ||
      checkArray(formData.creatives) ||
      checkArray(formData.videos) ||
      checkArray(formData.brochureUrls);

    setIsFormValid(requiredFieldsValid && !hasBase64);
  }, [formData]);

  // Load properties function
  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      const response = await propertyService.getAllProperties(
        searchTerm,
        currentPage,
        PROPERTIES_PER_PAGE,
        "true",
        undefined,
        filters.propertyType,
        filters.status,
        filters.location,
        filters.builderName,
        "false",
        undefined,
        undefined
      );

      if (response.success) {
        let filteredData = response.data as Property[];
        filteredData = filteredData.map(cleanPropertyBase64);
        
        if (filters.visibility) {
          filteredData = filteredData.filter((property) => {
            if (filters.visibility === "public") return property.isPublic === true;
            if (filters.visibility === "private") return property.isPublic === false;
            if (filters.visibility === "featured") return property.isFeatured === true;
            return true;
          });
        }

        setProperties(filteredData);
        setTotalItems(filteredData.length);

        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        } else {
          const total = Math.ceil(filteredData.length / PROPERTIES_PER_PAGE);
          setTotalPages(total || 1);
          setTotalItems(filteredData.length);
        }

        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
      } else {
        throw new Error(response.message || "Failed to load properties");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load properties");
      setProperties([]);
      setTotalItems(0);
      setTotalPages(1);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, currentPage, filters]);

  // Clean base64 from property data
  const cleanPropertyBase64 = (property: Property): Property => {
    const cleaned = JSON.parse(JSON.stringify(property));
    const cleanArray = (arr: any[] | undefined) => {
      if (!arr || !Array.isArray(arr)) return arr;
      return arr
        .map((item) => {
          if (item && item.url && item.url.startsWith("data:")) {
            return null;
          }
          return item;
        })
        .filter((item) => item !== null);
    };

    cleaned.images = cleanArray(cleaned.images);
    cleaned.propertyImages = cleanArray(cleaned.propertyImages);
    cleaned.floorPlans = cleanArray(cleaned.floorPlans);
    cleaned.creatives = cleanArray(cleaned.creatives);
    cleaned.videos = cleanArray(cleaned.videos);
    cleaned.brochureUrls = cleanArray(cleaned.brochureUrls);
    return cleaned;
  };

  // Get paginated properties
  const getPaginatedProperties = () => {
    if (properties.length <= PROPERTIES_PER_PAGE) {
      return properties;
    }
    const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
    const endIndex = startIndex + PROPERTIES_PER_PAGE;
    return properties.slice(startIndex, endIndex);
  };

  // File upload functions
  const handleFileUpload = async (files: FileList, field: string) => {
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
  };

  // Toggle public/private
  const handleTogglePublic = async (id: string, isPublic: boolean) => {
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
  };

  // Toggle featured status
  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
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
  };

  // Download utility functions
  const handleDownloadFile = async (url: string, filename: string) => {
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
  };

  const handleDownloadImages = async (images: any[]) => {
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
  };

  const handleDownloadVideos = async (videos: any[]) => {
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
  };

  const handleDownloadBrochures = async (brochures: any[]) => {
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
  };

  const handleDownloadCreatives = async (creatives: any[]) => {
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
  };

  const handleDownloadAllMedia = async (property: Property) => {
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
  };

  // Filter functions
  const handleFilterChange = (filterType: string, value: any) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      propertyType: "",
      status: "",
      location: "",
      builderName: "",
      visibility: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const removeFilter = (filterType: string) => {
    setFilters((prev) => ({ ...prev, [filterType]: "" }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Dialog functions
  const handleOpenDialog = (property: Property | null = null) => {
    if (property) {
      const cleanedProperty = cleanPropertyBase64(property);
      setEditingProperty(cleanedProperty);

      setFormData({
        projectName: cleanedProperty.projectName || "",
        builderName: cleanedProperty.builderName || "",
        location: cleanedProperty.location || "",
        paymentPlan: cleanedProperty.paymentPlan || "",
        propertyType: [cleanedProperty.propertyType],
        description: cleanedProperty.description || "",
        propertyName: cleanedProperty.propertyName || "",
        propertyDescription: cleanedProperty.propertyDescription || "",
        price: cleanedProperty.price || "",
        minSize: cleanedProperty.minSize || "",
        maxSize: cleanedProperty.maxSize || "",
        sizeUnit: cleanedProperty.sizeUnit || "",
        bedrooms: cleanedProperty.bedrooms || 0,
        bathrooms: cleanedProperty.bathrooms || 0,
        toilet: cleanedProperty.toilet || 0,
        balcony: cleanedProperty.balcony || 0,
        carpetArea: cleanedProperty.carpetArea || "",
        builtUpArea: cleanedProperty.builtUpArea || "",
        ownershipType: cleanedProperty.ownershipType || "Freehold",
        landType: cleanedProperty.landType || "Residential Plot",
        approvedBy: cleanedProperty.approvedBy || "",
        boundaryWall: cleanedProperty.boundaryWall || false,
        amenities: cleanedProperty.amenities || [],
        status: cleanedProperty.status || [],
        nearby: cleanedProperty.nearby || [],
        projectHighlights: cleanedProperty.projectHighlights || [],
        images: cleanedProperty.images || [],
        propertyImages: cleanedProperty.propertyImages || [],
        floorPlans: cleanedProperty.floorPlans || [],
        creatives: cleanedProperty.creatives || [],
        videos: cleanedProperty.videos || [],
        brochureUrls: cleanedProperty.brochureUrls || [],
        mapLocation: cleanedProperty.mapLocation || { lat: 0, lng: 0 },
        isActive:
          cleanedProperty.isActive !== undefined
            ? cleanedProperty.isActive
            : true,
        isPublic: cleanedProperty.isPublic || false,
        isFeatured: cleanedProperty.isFeatured || false,
        parentId: cleanedProperty.parentId || null,
        residentialProperties:
          cleanedProperty.propertyType === "residential"
            ? [
                {
                  propertyName: cleanedProperty.propertyName,
                  propertyDescription: cleanedProperty.propertyDescription,
                  price: cleanedProperty.price,
                  paymentPlan: cleanedProperty.paymentPlan,
                  bedrooms: cleanedProperty.bedrooms,
                  bathrooms: cleanedProperty.bathrooms,
                  toilet: cleanedProperty.toilet,
                  balcony: cleanedProperty.balcony,
                  carpetArea: cleanedProperty.carpetArea,
                  builtUpArea: cleanedProperty.builtUpArea,
                  minSize: cleanedProperty.minSize,
                  maxSize: cleanedProperty.maxSize,
                  sizeUnit: cleanedProperty.sizeUnit,
                  amenities: cleanedProperty.amenities,
                },
              ]
            : [],
        commercialProperties:
          cleanedProperty.propertyType === "commercial"
            ? [
                {
                  propertyName: cleanedProperty.propertyName,
                  propertyDescription: cleanedProperty.propertyDescription,
                  price: cleanedProperty.price,
                  paymentPlan: cleanedProperty.paymentPlan,
                  carpetArea: cleanedProperty.carpetArea,
                  builtUpArea: cleanedProperty.builtUpArea,
                  minSize: cleanedProperty.minSize,
                  maxSize: cleanedProperty.maxSize,
                  sizeUnit: cleanedProperty.sizeUnit,
                  amenities: cleanedProperty.amenities,
                },
              ]
            : [],
        plotProperties:
          cleanedProperty.propertyType === "plot"
            ? [
                {
                  propertyName: cleanedProperty.propertyName,
                  propertyDescription: cleanedProperty.propertyDescription,
                  price: cleanedProperty.price,
                  paymentPlan: cleanedProperty.paymentPlan,
                  ownershipType: cleanedProperty.ownershipType,
                  landType: cleanedProperty.landType,
                  approvedBy: cleanedProperty.approvedBy,
                  boundaryWall: cleanedProperty.boundaryWall,
                  minSize: cleanedProperty.minSize,
                  maxSize: cleanedProperty.maxSize,
                  sizeUnit: cleanedProperty.sizeUnit,
                  amenities: cleanedProperty.amenities,
                },
              ]
            : [],
      });
    } else {
      setEditingProperty(null);
      setFormData({
        projectName: "",
        builderName: "",
        location: "",
        paymentPlan: "",
        propertyType: [],
        description: "",
        propertyName: "",
        propertyDescription: "",
        price: "",
        minSize: "",
        maxSize: "",
        sizeUnit: "",
        bedrooms: 0,
        bathrooms: 0,
        toilet: 0,
        balcony: 0,
        carpetArea: "",
        builtUpArea: "",
        ownershipType: "Freehold",
        landType: "Residential Plot",
        approvedBy: "",
        boundaryWall: false,
        amenities: [],
        status: [],
        nearby: [],
        projectHighlights: [],
        images: [],
        propertyImages: [],
        floorPlans: [],
        creatives: [],
        videos: [],
        brochureUrls: [],
        mapLocation: { lat: 0, lng: 0 },
        isActive: true,
        isPublic: false,
        isFeatured: false,
        parentId: null,
        residentialProperties: [],
        commercialProperties: [],
        plotProperties: [],
      });
    }
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
    setValidationErrors({});
    setIsFormValid(false);
    setUploadProgress({});
  };

  const handleViewProperty = (property: Property) => {
    const cleanedProperty = cleanPropertyBase64(property);
    setViewingProperty(cleanedProperty);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setViewingProperty(null);
  };

  const handleViewSubProperty = (subProperty: Property) => {
    const cleanedSubProperty = cleanPropertyBase64(subProperty);
    setSelectedSubProperty(cleanedSubProperty);
    setOpenSubPropertyDialog(true);
  };

  // Delete property
  const handleDeleteProperty = async (id: string, propertyName?: string) => {
    const confirmed = window.confirm(
      `🚨 PERMANENT DELETE WARNING 🚨\n\n` +
        `You are about to permanently delete:\n` +
        `"${propertyName || "This property"}".\n\n` +
        `⚠️  This action cannot be undone!\n` +
        `⚠️  All associated data will be permanently removed!\n\n` +
        `Are you absolutely sure you want to proceed?`
    );

    if (!confirmed) return;

    try {
      const toastId = toast.loading("Permanently deleting property...");
      await propertyService.deleteProperty(id);
      toast.success("Property permanently deleted", { id: toastId });
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete property");
    }
  };

  // Data cleaning utility
  const cleanFormData = (data: any) => {
    const cleaned = JSON.parse(JSON.stringify(data));

    const cleanArray = (arr: any[]): any[] => {
      if (!arr || !Array.isArray(arr)) return [];
      return arr
        .map((item) => {
          if (item && item.url && item.url.startsWith("data:")) {
            return null;
          }
          return item;
        })
        .filter((item) => item !== null && item.url);
    };

    [
      "images",
      "propertyImages",
      "floorPlans",
      "creatives",
      "videos",
      "brochureUrls",
    ].forEach((key) => {
      cleaned[key] = cleanArray(cleaned[key] || []);
    });

    ["residentialProperties", "commercialProperties", "plotProperties"].forEach(
      (key) => {
        if (cleaned[key] && Array.isArray(cleaned[key])) {
          cleaned[key] = cleaned[key]
            .map((prop: any) => ({
              ...prop,
              propertyImages: cleanArray(prop.propertyImages || []),
              floorPlans: cleanArray(prop.floorPlans || []),
            }))
            .filter(
              (prop: any) =>
                prop.propertyName ||
                prop.propertyDescription ||
                prop.price ||
                prop.amenities?.length > 0
            );

          if (cleaned[key].length === 0) {
            delete cleaned[key];
          }
        }
      }
    );

    return cleaned;
  };

  // Validate data has no base64 before submission
  const validateNoBase64 = (
    data: any
  ): { valid: boolean; message?: string } => {
    const checkArray = (arr: any[], name: string): boolean => {
      if (!arr || !Array.isArray(arr)) return true;
      return !arr.some(
        (item) => item && item.url && item.url.startsWith("data:")
      );
    };

    const arrays = [
      { name: "images", data: data.images },
      { name: "propertyImages", data: data.propertyImages },
      { name: "floorPlans", data: data.floorPlans },
      { name: "creatives", data: data.creatives },
      { name: "videos", data: data.videos },
      { name: "brochureUrls", data: data.brochureUrls },
    ];

    for (const array of arrays) {
      if (!checkArray(array.data, array.name)) {
        return {
          valid: false,
          message: `Found base64 data in ${array.name}. Please re-upload files to S3.`,
        };
      }
    }

    return { valid: true };
  };

  // Submit form
  const handleSubmit = async (data: any) => {
    const validation = validateNoBase64(data);
    if (!validation.valid) {
      toast.error(validation.message || "Please remove base64 data before submitting");
      return;
    }

    const toastId = toast.loading(editingProperty ? "Updating property..." : "Creating properties...");

    try {
      if (editingProperty && editingProperty._id) {        
        const isSubProperty = editingProperty.parentId ? true : false;
        
        if (isSubProperty) {          
          let updateData: any = {};
          const propertyType = Array.isArray(data.propertyType) ? data.propertyType[0] : data.propertyType;
          
          if (propertyType === 'residential' && data.residentialProperties && data.residentialProperties.length > 0) {
            const residentialData = data.residentialProperties[0];
            updateData = {
              propertyName: residentialData.propertyName || data.propertyName,
              propertyDescription: residentialData.propertyDescription || data.propertyDescription,
              price: residentialData.price || data.price,
              paymentPlan: residentialData.paymentPlan || data.paymentPlan,
              bedrooms: residentialData.bedrooms,
              bathrooms: residentialData.bathrooms,
              toilet: residentialData.toilet,
              balcony: residentialData.balcony,
              carpetArea: residentialData.carpetArea,
              builtUpArea: residentialData.builtUpArea,
              floors: residentialData.floors,
              minSize: residentialData.minSize,
              maxSize: residentialData.maxSize,
              sizeUnit: residentialData.sizeUnit,
              amenities: residentialData.amenities || data.amenities || [],
              projectName: data.projectName,
              builderName: data.builderName,
              location: data.location,
              description: data.description,
              status: data.status || [],
              nearby: data.nearby || [],
              projectHighlights: data.projectHighlights || [],
              isPublic: data.isPublic || false,
              isFeatured: data.isFeatured || false,
              isActive: data.isActive !== false,
              propertyType: 'residential',
            };
          } else if (propertyType === 'commercial' && data.commercialProperties && data.commercialProperties.length > 0) {
            const commercialData = data.commercialProperties[0];
            updateData = {
              propertyName: commercialData.propertyName || data.propertyName,
              propertyDescription: commercialData.propertyDescription || data.propertyDescription,
              price: commercialData.price || data.price,
              paymentPlan: commercialData.paymentPlan || data.paymentPlan,
              carpetArea: commercialData.carpetArea,
              builtUpArea: commercialData.builtUpArea,
              floors: commercialData.floors,
              minSize: commercialData.minSize,
              maxSize: commercialData.maxSize,
              sizeUnit: commercialData.sizeUnit,
              amenities: commercialData.amenities || data.amenities || [],
              projectName: data.projectName,
              builderName: data.builderName,
              location: data.location,
              description: data.description,
              status: data.status || [],
              nearby: data.nearby || [],
              projectHighlights: data.projectHighlights || [],
              isPublic: data.isPublic || false,
              isFeatured: data.isFeatured || false,
              isActive: data.isActive !== false,
              propertyType: 'commercial',
            };
          } else if (propertyType === 'plot' && data.plotProperties && data.plotProperties.length > 0) {
            const plotData = data.plotProperties[0];
            updateData = {
              propertyName: plotData.propertyName || data.propertyName,
              propertyDescription: plotData.propertyDescription || data.propertyDescription,
              price: plotData.price || data.price,
              paymentPlan: plotData.paymentPlan || data.paymentPlan,
              ownershipType: plotData.ownershipType,
              landType: plotData.landType,
              approvedBy: plotData.approvedBy,
              boundaryWall: plotData.boundaryWall,
              minSize: plotData.minSize,
              maxSize: plotData.maxSize,
              sizeUnit: plotData.sizeUnit,
              amenities: plotData.amenities || data.amenities || [],
              projectName: data.projectName,
              builderName: data.builderName,
              location: data.location,
              description: data.description,
              status: data.status || [],
              nearby: data.nearby || [],
              projectHighlights: data.projectHighlights || [],
              isPublic: data.isPublic || false,
              isFeatured: data.isFeatured || false,
              isActive: data.isActive !== false,
              propertyType: 'plot',
            };
          } else {
            updateData = {
              projectName: data.projectName,
              builderName: data.builderName,
              location: data.location,
              description: data.description,
              paymentPlan: data.paymentPlan,
              status: data.status || [],
              nearby: data.nearby || [],
              projectHighlights: data.projectHighlights || [],
              amenities: data.amenities || [],
              isPublic: data.isPublic || false,
              isFeatured: data.isFeatured || false,
              isActive: data.isActive !== false,
              price: data.price || 'Contact for price',
              propertyType: Array.isArray(data.propertyType) ? data.propertyType[0] : data.propertyType,
              propertyName: data.propertyName || '',
              propertyDescription: data.propertyDescription || '',
              ...(data.propertyType?.includes('residential') && {
                bedrooms: data.bedrooms || 0,
                bathrooms: data.bathrooms || 0,
                toilet: data.toilet || 0,
                balcony: data.balcony || 0,
                carpetArea: data.carpetArea || '',
                builtUpArea: data.builtUpArea || '',
                floors: data.floors || undefined,
              }),
              ...(data.propertyType?.includes('commercial') && {
                carpetArea: data.carpetArea || '',
                builtUpArea: data.builtUpArea || '',
                floors: data.floors || undefined,
              }),
              ...(data.propertyType?.includes('plot') && {
                ownershipType: data.ownershipType || 'Freehold',
                landType: data.landType || 'Residential Plot',
                approvedBy: data.approvedBy || '',
                boundaryWall: data.boundaryWall || false,
              }),
              minSize: data.minSize || '',
              maxSize: data.maxSize || '',
              sizeUnit: data.sizeUnit || 'sq.ft.',
            };
          }
          
          if (data.propertyImages && data.propertyImages.length > 0) {
            updateData.propertyImages = data.propertyImages;
          }
          if (data.floorPlans && data.floorPlans.length > 0) {
            updateData.floorPlans = data.floorPlans;
          }
          delete updateData.parentId;
          const response = await propertyService.updateProperty(editingProperty._id, updateData);
          toast.success("Sub-property updated successfully", { id: toastId });
        } else {
          const updateData: any = {
            projectName: data.projectName,
            builderName: data.builderName,
            location: data.location,
            description: data.description,
            paymentPlan: data.paymentPlan,
            status: data.status || [],
            nearby: data.nearby || [],
            projectHighlights: data.projectHighlights || [],
            amenities: data.amenities || [],
            isPublic: data.isPublic || false,
            isFeatured: data.isFeatured || false,
            isActive: data.isActive !== false,
            price: data.price || 'Contact for price',
          };

          if (data.propertyType) {
            updateData.propertyType = Array.isArray(data.propertyType) 
              ? data.propertyType[0] 
              : data.propertyType;
          }

          if (data.mapLocation && data.mapLocation.lat && data.mapLocation.lng) {
            updateData.mapLocation = data.mapLocation;
          }

          if (data.propertyName) updateData.propertyName = data.propertyName;
          if (data.propertyDescription) updateData.propertyDescription = data.propertyDescription;
          
          if (updateData.propertyType === 'residential') {
            if (data.bedrooms !== undefined) updateData.bedrooms = data.bedrooms;
            if (data.bathrooms !== undefined) updateData.bathrooms = data.bathrooms;
            if (data.toilet !== undefined) updateData.toilet = data.toilet;
            if (data.balcony !== undefined) updateData.balcony = data.balcony;
            if (data.carpetArea) updateData.carpetArea = data.carpetArea;
            if (data.builtUpArea) updateData.builtUpArea = data.builtUpArea;
            if (data.floors) updateData.floors = data.floors;
          }
          
          if (updateData.propertyType === 'commercial') {
            if (data.carpetArea) updateData.carpetArea = data.carpetArea;
            if (data.builtUpArea) updateData.builtUpArea = data.builtUpArea;
            if (data.floors) updateData.floors = data.floors;
          }
          
          if (updateData.propertyType === 'plot') {
            if (data.ownershipType) updateData.ownershipType = data.ownershipType;
            if (data.landType) updateData.landType = data.landType;
            if (data.approvedBy) updateData.approvedBy = data.approvedBy;
            if (data.boundaryWall !== undefined) updateData.boundaryWall = data.boundaryWall;
          }

          if (data.minSize) updateData.minSize = data.minSize;
          if (data.maxSize) updateData.maxSize = data.maxSize;
          if (data.sizeUnit) updateData.sizeUnit = data.sizeUnit;

          if (data.images && data.images.length > 0) {
            updateData.images = data.images;
          }
          if (data.propertyImages && data.propertyImages.length > 0) {
            updateData.propertyImages = data.propertyImages;
          }
          if (data.floorPlans && data.floorPlans.length > 0) {
            updateData.floorPlans = data.floorPlans;
          }
          if (data.creatives && data.creatives.length > 0) {
            updateData.creatives = data.creatives;
          }
          if (data.videos && data.videos.length > 0) {
            updateData.videos = data.videos;
          }
          if (data.brochureUrls && data.brochureUrls.length > 0) {
            updateData.brochureUrls = data.brochureUrls;
          }

          const response = await propertyService.updateProperty(editingProperty._id, updateData);
          toast.success("Property updated successfully", { id: toastId });
        }
        
      } else {
        const createData = {
          ...data,
          propertyType: Array.isArray(data.propertyType) ? data.propertyType : [data.propertyType],
        };
        const response = await propertyService.createProperty(createData);
        if (response.success) {
          if ("mainProject" in response.data) {
            const { mainProject, subProperties } = response.data;
            const propertyTypes = subProperties.map((sp) => sp.propertyType).join(", ");
            toast.success(`Main project created with ${subProperties.length} sub-properties (${propertyTypes})`, { id: toastId });
          } else {
            toast.success("Property created successfully", { id: toastId });
          }
        }
      }

      handleCloseDialog();
      loadProperties();
    } catch (error: any) {
      console.error('❌ SUBMIT ERROR DETAILS:');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      const errorMessage = error.message || "Failed to save property";
      toast.error(errorMessage, { id: toastId });
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    properties,
    loading,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalItems,
    setTotalItems,
    openDialog,
    setOpenDialog,
    openViewDialog,
    setOpenViewDialog,
    openSubPropertyDialog,
    setOpenSubPropertyDialog,
    editingProperty,
    setEditingProperty,
    viewingProperty,
    setViewingProperty,
    selectedSubProperty,
    setSelectedSubProperty,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
    validationErrors,
    isFormValid,
    formData,
    setFormData,
    loadProperties,
    handleFileUpload,
    handleTogglePublic,
    handleToggleFeatured,
    handleDownloadAllMedia,
    handleDownloadImages,
    handleDownloadVideos,
    handleDownloadBrochures,
    handleDownloadCreatives,
    handleDownloadFile,
    handleFilterChange,
    clearAllFilters,
    removeFilter,
    handleSearchChange,
    handleOpenDialog,
    handleCloseDialog,
    handleViewProperty,
    handleCloseViewDialog,
    handleViewSubProperty,
    handleDeleteProperty,
    handleSubmit,
    getPaginatedProperties,
    handlePageChange,
  };
};

