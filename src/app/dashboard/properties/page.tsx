// app/dashboard/properties/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  MenuItem,
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Tooltip,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add,
  FilterList,
  Clear,
  CloudDownload,
} from "@mui/icons-material";
import { Toaster, toast } from 'sonner';
import { propertyService, type Property } from '@/services/propertyService';
import { uploadService } from '@/services/uploadService';

// Components
import {
  PropertyCard,
  SubPropertiesViewer,
  PaginationControls,
  PropertyTypeSelector,
  AdditionalDetailsSection,
  PropertyFormDialog,
  PropertyViewDialog,
  SubPropertyViewDialog,
} from './components';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  // Pagination state
  const PROPERTIES_PER_PAGE = 6;
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
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  
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

  // Initial load
  useEffect(() => { 
    loadProperties(); 
  }, []);

  // Load properties when search or filters change
  useEffect(() => { 
    setCurrentPage(1);
    loadProperties(); 
  }, [debouncedSearchTerm, filters]);

  // Calculate pagination when properties change
  useEffect(() => {
    const total = Math.ceil(properties.length / PROPERTIES_PER_PAGE);
    setTotalPages(total || 1);
    setTotalItems(properties.length);
    
    if (currentPage > total && total > 0) {
      setCurrentPage(total);
    }
  }, [properties, currentPage]);

  // Form validation
  useEffect(() => {
    const requiredFieldsValid = (
      formData.projectName?.trim().length >= 2 && 
      formData.builderName?.trim().length >= 2 &&
      formData.location?.trim().length > 0 &&
      formData.paymentPlan?.trim().length > 0 &&
      formData.propertyType && formData.propertyType.length > 0
    );
    setIsFormValid(requiredFieldsValid);
  }, [formData]);

  // Load properties function
  const loadProperties = async () => {
  try {
    setLoading(true);
    const response = await propertyService.getAllProperties(
      debouncedSearchTerm,
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
      
      // Apply additional filters on the client side if needed
      if (filters.visibility) {
        filteredData = filteredData.filter(property => {
          if (filters.visibility === 'public') return property.isPublic === true;
          if (filters.visibility === 'private') return property.isPublic === false;
          if (filters.visibility === 'featured') return property.isFeatured === true;
          return true;
        });
      }
      
      setProperties(filteredData);
      setTotalItems(filteredData.length);
      
      // Update pagination from response if available, otherwise calculate
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

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          // Validate file size
          uploadService.validateFileSize(file, 200);
          
          setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));
          
          const uploadResponse = await uploadService.uploadFile(file);
          
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
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
            return { success: false, error: uploadResponse.message, fileName: file.name };
          }
        } catch (error: any) {
          return { success: false, error: error.message, fileName: file.name };
        } finally {
          // Remove progress after a delay
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        }
      });

      const results = await Promise.all(uploadPromises);
      
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);
      
      // Add successful files to form data
      if (successfulUploads.length > 0) {
        const newFiles = successfulUploads.map(result => result.file);
        setFormData((prev: any) => ({
          ...prev,
          [field]: [...prev[field], ...newFiles]
        }));
      }
      
      // Show results
      if (successfulUploads.length > 0) {
        toast.success(`Successfully uploaded ${successfulUploads.length} file(s)`);
      }
      
      if (failedUploads.length > 0) {
        failedUploads.forEach(result => {
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
      const toastId = toast.loading(`Making property ${isPublic ? 'public' : 'private'}...`);
      await propertyService.togglePublicVisibility(id, isPublic);
      toast.success(`Property is now ${isPublic ? 'public' : 'private'}`, { id: toastId });
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to update property visibility");
    }
  };

  // Toggle featured status
  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const toastId = toast.loading(`${isFeatured ? 'Adding to' : 'Removing from'} featured properties...`);
      await propertyService.toggleFeaturedStatus(id, isFeatured);
      toast.success(`Property ${isFeatured ? 'added to' : 'removed from'} featured list`, { id: toastId });
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to update featured status");
    }
  };

  // Download utility functions
  const handleDownloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      toast.success(`Downloading ${filename}`);
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${filename}: ${error.message}`);
    }
  };

  const handleDownloadImages = async (images: any[]) => {
    const toastId = toast.loading(`Downloading ${images.length} images...`);
    try {
      for (const image of images) {
        const imageUrl = typeof image === 'string' ? image : image.url;
        const imageName = typeof image === 'string' 
          ? `image-${images.indexOf(image) + 1}.jpg` 
          : image.title || `image-${images.indexOf(image) + 1}.jpg`;
        
        await handleDownloadFile(imageUrl, imageName);
      }
      toast.success(`Downloaded ${images.length} images`, { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to download images: ${error.message}`, { id: toastId });
    }
  };

  const handleDownloadVideos = async (videos: any[]) => {
    const toastId = toast.loading(`Downloading ${videos.length} videos...`);
    try {
      for (const video of videos) {
        const videoUrl = video.url;
        const videoName = video.title || `video-${videos.indexOf(video) + 1}.mp4`;
        
        await handleDownloadFile(videoUrl, videoName);
      }
      toast.success(`Downloaded ${videos.length} videos`, { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to download videos: ${error.message}`, { id: toastId });
    }
  };

  const handleDownloadBrochures = async (brochures: any[]) => {
    const toastId = toast.loading(`Downloading ${brochures.length} brochures...`);
    try {
      for (const brochure of brochures) {
        const brochureUrl = brochure.url;
        const brochureName = brochure.title || `brochure-${brochures.indexOf(brochure) + 1}.pdf`;
        
        await handleDownloadFile(brochureUrl, brochureName);
      }
      toast.success(`Downloaded ${brochures.length} brochures`, { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to download brochures: ${error.message}`, { id: toastId });
    }
  };

  const handleDownloadCreatives = async (creatives: any[]) => {
    const toastId = toast.loading(`Downloading ${creatives.length} creatives...`);
    try {
      for (const creative of creatives) {
        const creativeUrl = creative.url;
        const extension = creative.type === 'video' ? 'mp4' : 'jpg';
        const creativeName = creative.title || `creative-${creatives.indexOf(creative) + 1}.${extension}`;
        
        await handleDownloadFile(creativeUrl, creativeName);
      }
      toast.success(`Downloaded ${creatives.length} creatives`, { id: toastId });
    } catch (error: any) {
      toast.error(`Failed to download creatives: ${error.message}`, { id: toastId });
    }
  };

  const handleDownloadAllMedia = async (property: Property) => {
    const toastId = toast.loading('Preparing all media for download...');
    try {
      const allMedia: Array<{url: string, name: string}> = [];
      
      // Add images
      if (property.images && property.images.length > 0) {
        property.images.forEach((image, index) => {
          const imageUrl = typeof image === 'string' ? image : image.url;
          const imageName = typeof image === 'string' 
            ? `images/image-${index + 1}.jpg` 
            : `images/${image.title || `image-${index + 1}.jpg`}`;
          allMedia.push({ url: imageUrl, name: imageName });
        });
      }
      
      // Add videos
      if (property.videos && property.videos.length > 0) {
        property.videos.forEach((video, index) => {
          const videoUrl = video.url;
          const videoName = `videos/${video.title || `video-${index + 1}.mp4`}`;
          allMedia.push({ url: videoUrl, name: videoName });
        });
      }
      
      // Add brochures
      if (property.brochureUrls && property.brochureUrls.length > 0) {
        property.brochureUrls.forEach((brochure, index) => {
          const brochureUrl = brochure.url;
          const brochureName = `brochures/${brochure.title || `brochure-${index + 1}.pdf`}`;
          allMedia.push({ url: brochureUrl, name: brochureName });
        });
      }
      
      // Add creatives
      if (property.creatives && property.creatives.length > 0) {
        property.creatives.forEach((creative, index) => {
          const creativeUrl = creative.url;
          const extension = creative.type === 'video' ? 'mp4' : 'jpg';
          const creativeName = `creatives/${creative.title || `creative-${index + 1}.${extension}`}`;
          allMedia.push({ url: creativeUrl, name: creativeName });
        });
      }
      
      // Add property images for sub-properties
      if (property.propertyImages && property.propertyImages.length > 0) {
        property.propertyImages.forEach((image, index) => {
          const imageUrl = typeof image === 'string' ? image : image.url;
          const imageName = typeof image === 'string' 
            ? `property-images/image-${index + 1}.jpg` 
            : `property-images/${image.title || `image-${index + 1}.jpg`}`;
          allMedia.push({ url: imageUrl, name: imageName });
        });
      }
      
      if (allMedia.length === 0) {
        toast.info('No media files to download', { id: toastId });
        return;
      }
      
      toast.success(`Downloading ${allMedia.length} files...`, { id: toastId });
      
      // Download files sequentially to avoid overwhelming the browser
      for (const media of allMedia) {
        await handleDownloadFile(media.url, media.name);
        // Small delay between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast.success(`Downloaded ${allMedia.length} files`, { id: toastId });
      
    } catch (error: any) {
      toast.error(`Failed to download media: ${error.message}`, { id: toastId });
    }
  };

  // Filter functions
  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    // setCurrentPage(1);
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
    setFilters(prev => ({ ...prev, [filterType]: "" }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Dialog functions
  const handleOpenDialog = (property: Property | null = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        projectName: property.projectName || "",
        builderName: property.builderName || "",
        location: property.location || "",
        paymentPlan: property.paymentPlan || "",
        propertyType: [property.propertyType],
        description: property.description || "",
        propertyName: property.propertyName || "",
        propertyDescription: property.propertyDescription || "",
        price: property.price || "",
        minSize: property.minSize || "",
        maxSize: property.maxSize || "",
        sizeUnit: property.sizeUnit || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        toilet: property.toilet || 0,
        balcony: property.balcony || 0,
        carpetArea: property.carpetArea || "",
        builtUpArea: property.builtUpArea || "",
        ownershipType: property.ownershipType || "Freehold",
        landType: property.landType || "Residential Plot",
        approvedBy: property.approvedBy || "",
        boundaryWall: property.boundaryWall || false,
        amenities: property.amenities || [],
        status: property.status || [],
        nearby: property.nearby || [],
        projectHighlights: property.projectHighlights || [],
        images: property.images || [],
        propertyImages: property.propertyImages || [],
        floorPlans: property.floorPlans || [],
        creatives: property.creatives || [],
        videos: property.videos || [],
        brochureUrls: property.brochureUrls || [],
        mapLocation: property.mapLocation || { lat: 0, lng: 0 },
        isActive: property.isActive !== undefined ? property.isActive : true,
        isPublic: property.isPublic || false,
        isFeatured: property.isFeatured || false,
        parentId: property.parentId || null,
        residentialProperties: property.propertyType === 'residential' ? [{
          propertyName: property.propertyName,
          propertyDescription: property.propertyDescription,
          price: property.price,
          paymentPlan: property.paymentPlan,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          toilet: property.toilet,
          balcony: property.balcony,
          carpetArea: property.carpetArea,
          builtUpArea: property.builtUpArea,
          minSize: property.minSize,
          maxSize: property.maxSize,
          sizeUnit: property.sizeUnit,
          amenities: property.amenities
        }] : [],
        commercialProperties: property.propertyType === 'commercial' ? [{
          propertyName: property.propertyName,
          propertyDescription: property.propertyDescription,
          price: property.price,
          paymentPlan: property.paymentPlan,
          carpetArea: property.carpetArea,
          builtUpArea: property.builtUpArea,
          minSize: property.minSize,
          maxSize: property.maxSize,
          sizeUnit: property.sizeUnit,
          amenities: property.amenities
        }] : [],
        plotProperties: property.propertyType === 'plot' ? [{
          propertyName: property.propertyName,
          propertyDescription: property.propertyDescription,
          price: property.price,
          paymentPlan: property.paymentPlan,
          ownershipType: property.ownershipType,
          landType: property.landType,
          approvedBy: property.approvedBy,
          boundaryWall: property.boundaryWall,
          minSize: property.minSize,
          maxSize: property.maxSize,
          sizeUnit: property.sizeUnit,
          amenities: property.amenities
        }] : [],
      });
    } else {
      setEditingProperty(null);
      setFormData({
        projectName: "", builderName: "", location: "", paymentPlan: "", propertyType: [],
        description: "", propertyName: "", propertyDescription: "", price: "",
        minSize: "", maxSize: "", sizeUnit: "",
        bedrooms: 0, bathrooms: 0, toilet: 0, balcony: 0, carpetArea: "", builtUpArea: "",
        ownershipType: "Freehold", landType: "Residential Plot", approvedBy: "", boundaryWall: false,
        amenities: [], status: [], nearby: [], projectHighlights: [],
        images: [], propertyImages: [], floorPlans: [], creatives: [], videos: [], brochureUrls: [],
        mapLocation: { lat: 0, lng: 0 },
        isActive: true, 
        isPublic: false,
        isFeatured: false,
        parentId: null,
        residentialProperties: [], commercialProperties: [], plotProperties: [],
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
    setViewingProperty(property); 
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false); 
    setViewingProperty(null);
  };

  const handleViewSubProperty = (subProperty: Property) => {
    setSelectedSubProperty(subProperty);
    setOpenSubPropertyDialog(true);
  };

  // Delete property
  const handleDeleteProperty = async (id: string, propertyName?: string) => {
    const confirmed = window.confirm(
      `🚨 PERMANENT DELETE WARNING 🚨\n\n` +
      `You are about to permanently delete:\n` +
      `"${propertyName || 'This property'}".\n\n` +
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
    
    // Remove empty arrays and null values
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        const filtered = obj.filter(item => item !== null && item !== undefined && item !== '');
        return filtered.length > 0 ? filtered.map(cleanObject) : undefined;
      }
      
      if (obj && typeof obj === 'object') {
        const cleanedObj: any = {};
        Object.keys(obj).forEach(key => {
          const cleanedValue = cleanObject(obj[key]);
          if (cleanedValue !== undefined && cleanedValue !== null && cleanedValue !== '') {
            cleanedObj[key] = cleanedValue;
          }
        });
        return Object.keys(cleanedObj).length > 0 ? cleanedObj : undefined;
      }
      
      return obj !== '' ? obj : undefined;
    };

    // Clean main arrays
    ['images', 'propertyImages', 'floorPlans', 'creatives', 'videos', 'brochureUrls'].forEach(key => {
      if (cleaned[key] && Array.isArray(cleaned[key])) {
        const cleanedArray = cleaned[key].filter((item: any) => {
          if (item && item.url) {
            return item.url.trim() !== '';
          }
          return false;
        });
        cleaned[key] = cleanedArray.length > 0 ? cleanedArray : undefined;
      }
    });

    // Clean nested property arrays
    ['residentialProperties', 'commercialProperties', 'plotProperties'].forEach(key => {
      if (cleaned[key] && Array.isArray(cleaned[key])) {
        cleaned[key] = cleaned[key].map((prop: any) => ({
          ...prop,
          propertyImages: prop.propertyImages?.filter((img: any) => img && img.url && img.url.trim() !== '') || undefined,
          floorPlans: prop.floorPlans?.filter((plan: any) => plan && plan.url && plan.url.trim() !== '') || undefined,
        })).filter((prop: any) => 
          prop.propertyName || prop.propertyDescription || prop.price || prop.amenities?.length > 0
        );
        
        if (cleaned[key].length === 0) {
          delete cleaned[key];
        }
      }
    });

    // Remove completely empty objects
    const finalCleaned = cleanObject(cleaned);
    
    return finalCleaned;
  };

  // Check data size before submission
  const checkDataSize = (data: any): { isValid: boolean; sizeMB: number } => {
    const jsonString = JSON.stringify(data);
    const sizeMB = jsonString.length / (1024 * 1024);
    const isValid = sizeMB <= 1; // 1MB limit
    
    return { isValid, sizeMB };
  };

  // Submit form
  const handleSubmit = async (data: any) => {
    const selectedTypes = Array.isArray(data.propertyType) 
      ? data.propertyType 
      : [data.propertyType];

    let processedData;

    // ✅ EDITING MODE - Extract data from nested arrays
    if (editingProperty && editingProperty._id) {

      // Start with base data
      processedData = {
        projectName: data.projectName,
        builderName: data.builderName,
        location: data.location,
        description: data.description,
        paymentPlan: data.paymentPlan,
        status: data.status,
        nearby: data.nearby,
        projectHighlights: data.projectHighlights,
        amenities: data.amenities,
        mapLocation: data.mapLocation,
        isActive: data.isActive,
        isPublic: data.isPublic,
        isFeatured: data.isFeatured,
        parentId: data.parentId,
      };

      // ✅ Extract property-specific data from nested arrays
      const currentType = selectedTypes[0] || editingProperty.propertyType;
      processedData.propertyType = currentType;

      if (currentType === 'residential' && data.residentialProperties?.[0]) {
        const resData = data.residentialProperties[0];
        Object.assign(processedData, {
          propertyName: resData.propertyName,
          propertyDescription: resData.propertyDescription,
          price: resData.price,
          paymentPlan: resData.paymentPlan || data.paymentPlan,
          bedrooms: resData.bedrooms,
          bathrooms: resData.bathrooms,
          toilet: resData.toilet,
          balcony: resData.balcony,
          carpetArea: resData.carpetArea,
          builtUpArea: resData.builtUpArea,
          minSize: resData.minSize,
          maxSize: resData.maxSize,
          sizeUnit: resData.sizeUnit,
          propertyImages: resData.propertyImages?.map((img: any) => ({
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            isPrimary: img.isPrimary || false,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: resData.floorPlans?.map((plan: any) => ({
            url: plan.url,
            title: plan.title || '',
            description: plan.description || '',
            type: plan.type || '2d',
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || [],
        });
      } else if (currentType === 'commercial' && data.commercialProperties?.[0]) {
        const comData = data.commercialProperties[0];
        Object.assign(processedData, {
          propertyName: comData.propertyName,
          propertyDescription: comData.propertyDescription,
          price: comData.price,
          paymentPlan: comData.paymentPlan || data.paymentPlan,
          carpetArea: comData.carpetArea,
          builtUpArea: comData.builtUpArea,
          minSize: comData.minSize,
          maxSize: comData.maxSize,
          sizeUnit: comData.sizeUnit,
          propertyImages: comData.propertyImages?.map((img: any) => ({
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            isPrimary: img.isPrimary || false,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: comData.floorPlans?.map((plan: any) => ({
            url: plan.url,
            title: plan.title || '',
            description: plan.description || '',
            type: plan.type || '2d',
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || [],
        });
      } else if (currentType === 'plot' && data.plotProperties?.[0]) {
        const plotData = data.plotProperties[0];
        Object.assign(processedData, {
          propertyName: plotData.propertyName,
          propertyDescription: plotData.propertyDescription,
          price: plotData.price,
          paymentPlan: plotData.paymentPlan || data.paymentPlan,
          ownershipType: plotData.ownershipType,
          landType: plotData.landType,
          approvedBy: plotData.approvedBy,
          boundaryWall: plotData.boundaryWall,
          minSize: plotData.minSize,
          maxSize: plotData.maxSize,
          sizeUnit: plotData.sizeUnit,
          propertyImages: plotData.propertyImages?.map((img: any) => ({
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            isPrimary: img.isPrimary || false,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: plotData.floorPlans?.map((plan: any) => ({
            url: plan.url,
            title: plan.title || '',
            description: plan.description || '',
            type: plan.type || '2d',
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || [],
        });
      } else {
        // Project type or fallback to flat data
        Object.assign(processedData, {
          propertyName: data.propertyName,
          propertyDescription: data.propertyDescription,
          price: data.price,
        });
      }

      // Add main project images/videos/brochures
      processedData.images = data.images?.map((img: any) => ({
        url: img.url,
        title: img.title || '',
        description: img.description || '',
        isPrimary: img.isPrimary || false,
        uploadedAt: img.uploadedAt || new Date().toISOString()
      })) || [];

      processedData.creatives = data.creatives?.map((creative: any) => ({
        type: creative.type || 'image',
        url: creative.url,
        title: creative.title || '',
        description: creative.description || '',
        thumbnail: creative.thumbnail || '',
        uploadedAt: creative.uploadedAt || new Date().toISOString()
      })) || [];

      processedData.videos = data.videos?.map((video: any) => ({
        url: video.url,
        title: video.title || '',
        description: video.description || '',
        thumbnail: video.thumbnail || '',
        type: video.type || 'direct',
        uploadedAt: video.uploadedAt || new Date().toISOString()
      })) || [];

      processedData.brochureUrls = data.brochureUrls?.map((brochure: any) => ({
        title: brochure.title || '',
        url: brochure.url,
        type: brochure.type || 'PDF Document'
      })) || [];

    } else {
      // ✅ CREATE MODE
      processedData = {
        ...data,
        propertyType: selectedTypes,
      };
    }

    const cleanedData = cleanFormData(processedData);
    const sizeCheck = checkDataSize(cleanedData);
    
    if (!sizeCheck.isValid) {
      toast.error(`Data too large (${sizeCheck.sizeMB.toFixed(2)}MB). Please reduce the number of files or descriptions.`);
      return;
    }

    const toastId = toast.loading(editingProperty ? "Updating property..." : "Creating properties...");
    
    let response;
    
    if (editingProperty && editingProperty._id) {
      response = await propertyService.updateProperty(editingProperty._id, cleanedData);
      toast.success("Property updated successfully", { id: toastId });
    } else {
      response = await propertyService.createProperty(cleanedData);
      
      if (response.success) {
        if ('mainProject' in response.data) {
          const { mainProject, subProperties } = response.data;
          const propertyTypes = subProperties.map(sp => sp.propertyType).join(', ');
          toast.success(`Main project created with ${subProperties.length} sub-properties (${propertyTypes})`, { id: toastId });
        } else {
          toast.success("Property created successfully", { id: toastId });
        }
      }
    }
    
    handleCloseDialog();
    loadProperties();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading properties...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />

      {/* Header */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "15px",
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Title */}
          <Grid item xs={12} md="auto">
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                textAlign: { xs: "center", md: "left" },
                mb: { xs: 2, md: 0 },
              }}
            >
              Properties
            </Typography>
          </Grid>

          {/* Search + Buttons */}
          <Grid
            item
            xs={12}
            md
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-end" },
              flexWrap: "wrap",
            }}
          >
            {/* Search Field */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{
                width: { xs: "100%", sm: "250px", md: "300px" },
              }}
            />

            {/* Button Group */}
            <Grid
              item
              sx={{
                width: { xs: "100%", sm: "auto" },
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  flexGrow: { xs: 1, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#115293" },
                  flexGrow: { xs: 1, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Add Property
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Results Summary */}
        {(searchTerm || activeFiltersCount > 0) && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Found {totalItems} project{totalItems !== 1 ? "s" : ""}{" "}
            {searchTerm && ` matching "${searchTerm}"`}
            {activeFiltersCount > 0 &&
              ` with ${activeFiltersCount} filter${
                activeFiltersCount !== 1 ? "s" : ""
              } applied`}
          </Typography>
        )}
      </Paper>

      {/* Enhanced Filters Section */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: "15px" }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Filters
              {activeFiltersCount > 0 && (
                <Chip 
                  label={`${activeFiltersCount} active`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 2 }} 
                />
              )}
            </Typography>
            <Button 
              onClick={clearAllFilters} 
              variant="outlined" 
              size="small"
              disabled={activeFiltersCount === 0}
            >
              Clear All
            </Button>
          </Box>

          <Grid container spacing={2}>
            {/* Property Type Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  label="Property Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="project">Main Projects</MenuItem>
                  <MenuItem value="residential">Residential</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="plot">Plot</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Ready to Move">Ready to Move</MenuItem>
                  <MenuItem value="Under Construction">Under Construction</MenuItem>
                  <MenuItem value="New Launch">New Launch</MenuItem>
                  <MenuItem value="Pre Launch">Pre Launch</MenuItem>
                  <MenuItem value="Sold Out">Sold Out</MenuItem>
                  <MenuItem value="Coming Soon">Coming Soon</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Location Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </Grid>

            {/* Builder Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Builder"
                value={filters.builderName}
                onChange={(e) => handleFilterChange('builderName', e.target.value)}
                placeholder="Builder name"
              />
            </Grid>

            {/* Visibility Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Visibility</InputLabel>
                <Select
                  value={filters.visibility}
                  onChange={(e) => handleFilterChange('visibility', e.target.value)}
                  label="Visibility"
                >
                  <MenuItem value="">All Properties</MenuItem>
                  <MenuItem value="public">Public Only</MenuItem>
                  <MenuItem value="private">Private Only</MenuItem>
                  <MenuItem value="featured">Featured Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.propertyType && (
                  <Chip
                    label={`Type: ${filters.propertyType}`}
                    onDelete={() => removeFilter('propertyType')}
                    size="small"
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${filters.status}`}
                    onDelete={() => removeFilter('status')}
                    size="small"
                  />
                )}
                {filters.location && (
                  <Chip
                    label={`Location: ${filters.location}`}
                    onDelete={() => removeFilter('location')}
                    size="small"
                  />
                )}
                {filters.builderName && (
                  <Chip
                    label={`Builder: ${filters.builderName}`}
                    onDelete={() => removeFilter('builderName')}
                    size="small"
                  />
                )}
                {filters.visibility && (
                  <Chip
                    label={`Visibility: ${filters.visibility}`}
                    onDelete={() => removeFilter('visibility')}
                    size="small"
                  />
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Collapse>

      {/* Properties List with Pagination */}
      <Box sx={{ width: '100%' }}>
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '15px' }}>
            <Typography variant="h6" color="text.secondary">
              No properties found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchTerm ? `No results for "${searchTerm}"` : 'Create your first property to get started'}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => handleOpenDialog()} 
              sx={{ mt: 2, borderRadius: '8px' }}
            >
              Add Your First Property
            </Button>
          </Paper>
        ) : (
          <>
            {/* Properties Grid */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(auto-fill, minmax(320px, 1fr))',
                md: 'repeat(auto-fill, minmax(340px, 1fr))',
                lg: 'repeat(auto-fill, minmax(360px, 1fr))'
              }, 
              gap: 3,
              mb: 4
            }}>
              {getPaginatedProperties().map((project) => (
                <PropertyCard
                  key={project._id}
                  project={project}
                  onEdit={handleOpenDialog}
                  onView={handleViewProperty}
                  onDelete={(id) => handleDeleteProperty(id, project.projectName)}
                  onViewSubProperty={handleViewSubProperty}
                  onEditSubProperty={handleOpenDialog}
                  onDeleteSubProperty={(id, subPropertyName) => handleDeleteProperty(id, subPropertyName)}
                  onTogglePublic={handleTogglePublic}
                  onToggleFeatured={handleToggleFeatured}
                  showAdminControls={true}
                />
              ))}
            </Box>

            {/* Pagination Controls */}
            <PaginationControls 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
              totalItems={totalItems} 
              itemsPerPage={PROPERTIES_PER_PAGE} 
            />
          </>
        )}
      </Box>

      {/* Add/Edit Dialog */}
      <PropertyFormDialog
        open={openDialog}
        onClose={handleCloseDialog}
        editingProperty={editingProperty}
        onSubmit={handleSubmit}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadProgress={uploadProgress}
        isFormValid={isFormValid}
        formData={formData}
        setFormData={setFormData}
        validationErrors={validationErrors}
      />

      {/* View Property Dialog */}
      <PropertyViewDialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        property={viewingProperty}
        onEdit={handleOpenDialog}
        onDownloadAllMedia={handleDownloadAllMedia}
        onDownloadImages={handleDownloadImages}
        onDownloadVideos={handleDownloadVideos}
        onDownloadBrochures={handleDownloadBrochures}
        onDownloadCreatives={handleDownloadCreatives}
        onDownloadFile={handleDownloadFile}
        onViewSubProperty={handleViewSubProperty}
      />

      {/* Sub-Property View Dialog */}
      <SubPropertyViewDialog
        open={openSubPropertyDialog}
        onClose={() => setOpenSubPropertyDialog(false)}
        property={selectedSubProperty}
        onEdit={handleOpenDialog}
        onDownloadAllMedia={handleDownloadAllMedia}
        onDownloadImages={handleDownloadImages}
        onDownloadFile={handleDownloadFile}
      />
    </Box>
  );
}