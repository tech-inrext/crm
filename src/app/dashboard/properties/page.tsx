// app/dashboard/properties/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  FormHelperText,
  Alert,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Tab,
  Tabs,
  Switch,
  LinearProgress,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  CloudUpload,
  FilterList,
  Clear,
  LocationOn,
  Description,
  CloudDownload,
  PlayArrow,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close,
  Business,
  Home,
  Star,
  CheckCircle,
  CurrencyRupee,
  Public,
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
} from './components';
import LeafletMap from "./LeafletMap";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

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
      const response = await propertyService.getHierarchicalProperties(
        debouncedSearchTerm,
        filters.status,
        filters.propertyType,
        filters.location,
        filters.builderName
      );
      if (response.success) {
        const propertiesData = response.data as Property[];
        setProperties(propertiesData);
        setTotalItems(propertiesData.length);
        
        const total = Math.ceil(propertiesData.length / PROPERTIES_PER_PAGE);
        setTotalPages(total || 1);
        
        if (currentPage > total && total > 0) {
          setCurrentPage(total);
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
    setCurrentPage(1);
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

  // Form validation
  const validateForm = (): boolean => {
    const errors: any = {};
    
    if (!formData.projectName?.trim()) errors.projectName = "Project name is required";
    if (!formData.builderName?.trim()) errors.builderName = "Builder name is required";
    if (!formData.location?.trim()) errors.location = "Location is required";
    if (!formData.paymentPlan?.trim()) errors.paymentPlan = "Payment plan is required";
    if (!formData.propertyType || formData.propertyType.length === 0) errors.propertyType = "At least one property type is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form
  const handleSubmit = async () => {
  if (!validateForm()) {
    toast.error("Please fix the validation errors before submitting");
    return;
  }

  try {
    const selectedTypes = Array.isArray(formData.propertyType) 
      ? formData.propertyType 
      : [formData.propertyType];

    let processedData;

    // ✅ EDITING MODE - Extract data from nested arrays
    if (editingProperty && editingProperty._id) {

      // Start with base data
      processedData = {
        projectName: formData.projectName,
        builderName: formData.builderName,
        location: formData.location,
        description: formData.description,
        paymentPlan: formData.paymentPlan,
        status: formData.status,
        nearby: formData.nearby,
        projectHighlights: formData.projectHighlights,
        amenities: formData.amenities,
        mapLocation: formData.mapLocation,
        isActive: formData.isActive,
        isPublic: formData.isPublic,
        isFeatured: formData.isFeatured,
        parentId: formData.parentId,
      };

      // ✅ Extract property-specific data from nested arrays
      const currentType = selectedTypes[0] || editingProperty.propertyType;
      processedData.propertyType = currentType;

      if (currentType === 'residential' && formData.residentialProperties?.[0]) {
        const resData = formData.residentialProperties[0];
        Object.assign(processedData, {
          propertyName: resData.propertyName,
          propertyDescription: resData.propertyDescription,
          price: resData.price,
          paymentPlan: resData.paymentPlan || formData.paymentPlan,
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
      } else if (currentType === 'commercial' && formData.commercialProperties?.[0]) {
        const comData = formData.commercialProperties[0];
        Object.assign(processedData, {
          propertyName: comData.propertyName,
          propertyDescription: comData.propertyDescription,
          price: comData.price,
          paymentPlan: comData.paymentPlan || formData.paymentPlan,
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
      } else if (currentType === 'plot' && formData.plotProperties?.[0]) {
        const plotData = formData.plotProperties[0];
        Object.assign(processedData, {
          propertyName: plotData.propertyName,
          propertyDescription: plotData.propertyDescription,
          price: plotData.price,
          paymentPlan: plotData.paymentPlan || formData.paymentPlan,
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
          propertyName: formData.propertyName,
          propertyDescription: formData.propertyDescription,
          price: formData.price,
        });
      }

      // Add main project images/videos/brochures
      processedData.images = formData.images?.map((img: any) => ({
        url: img.url,
        title: img.title || '',
        description: img.description || '',
        isPrimary: img.isPrimary || false,
        uploadedAt: img.uploadedAt || new Date().toISOString()
      })) || [];

      processedData.creatives = formData.creatives?.map((creative: any) => ({
        type: creative.type || 'image',
        url: creative.url,
        title: creative.title || '',
        description: creative.description || '',
        thumbnail: creative.thumbnail || '',
        uploadedAt: creative.uploadedAt || new Date().toISOString()
      })) || [];

      processedData.videos = formData.videos?.map((video: any) => ({
        url: video.url,
        title: video.title || '',
        description: video.description || '',
        thumbnail: video.thumbnail || '',
        type: video.type || 'direct',
        uploadedAt: video.uploadedAt || new Date().toISOString()
      })) || [];

      processedData.brochureUrls = formData.brochureUrls?.map((brochure: any) => ({
        title: brochure.title || '',
        url: brochure.url,
        type: brochure.type || 'PDF Document'
      })) || [];

    } else {
      // ✅ CREATE MODE
      processedData = {
        ...formData,
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
    
  } catch (error: any) {
    console.error('Submission error:', error);
    toast.error(error.message || "Failed to save property");
  }
};

  // Progress display component
  const UploadProgress = () => {
    if (Object.keys(uploadProgress).length === 0) return null;
    
    return (
      <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Upload Progress:
        </Typography>
        {Object.entries(uploadProgress).map(([fileId, progress]) => (
          <Box key={fileId} sx={{ mb: 1 }}>
            <Typography variant="caption" display="block">
              {fileId.split('-')[1]} - {progress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ))}
      </Box>
    );
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', color: '#1976d2', borderRadius: '15px 15px 0 0', fontWeight: 600, fontSize: '1.5rem' }}>
          {editingProperty ? "Edit Property" : "Add New Properties"}
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>Basic Project Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fields marked with <Typography component="span" color="error">*</Typography> are required
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Project Name " value={formData.projectName} onChange={(e) => setFormData((prev: any) => ({ ...prev, projectName: e.target.value }))}
                required error={!!validationErrors.projectName} helperText={validationErrors.projectName} sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Builder Name " value={formData.builderName} onChange={(e) => setFormData((prev: any) => ({ ...prev, builderName: e.target.value }))}
                required error={!!validationErrors.builderName} helperText={validationErrors.builderName} sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select multiple value={formData.status} onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))} input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{(selected as string[]).map((value) => (<Chip key={value} label={value} size="small" />))}</Box>)}>
                  {["Ready to Move", "Under Construction", "New Launch", "Pre Launch", "Sold Out", "Coming Soon"].map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Payment Plan " value={formData.paymentPlan} onChange={(e) => setFormData((prev: any) => ({ ...prev, paymentPlan: e.target.value }))}
                required error={!!validationErrors.paymentPlan} helperText={validationErrors.paymentPlan} sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12}}>
              <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} multiline rows={3}
                sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12}}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Project Highlights</InputLabel>
                <Select multiple value={formData.projectHighlights} onChange={(e) => setFormData((prev: any) => ({ ...prev, projectHighlights: e.target.value }))} input={<OutlinedInput label="ProjectHighlights" />}
                  renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{(selected as string[]).map((value) => (<Chip key={value} label={value} size="small" />))}</Box>)}>
                  {["Gated Community", "Eco-Friendly", "Luxury Living", "Affordable Housing", "Smart Home Features", "Waterfront Property", "High-Rise Building", "Low-Rise Building", "Vastu Compliant"].map(highlight => (
                    <MenuItem key={highlight} value={highlight}>{highlight}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Public & Featured Controls */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '15px', backgroundColor: '#f8f9fa' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Public />
                  Visibility Settings
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isPublic}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, isPublic: e.target.checked }))}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Make Public
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Show this property on public website
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.isFeatured}
                          onChange={(e) => setFormData((prev: any) => ({ ...prev, isFeatured: e.target.checked }))}
                          color="secondary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            Featured Property
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Highlight this property as featured
                          </Typography>
                        </Box>
                      }
                    />
                  </Grid>
                </Grid>
                
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    <strong>Public:</strong> Property will be visible on your public website.<br />
                    <strong>Featured:</strong> Property will be highlighted as a featured listing.
                  </Typography>
                </Alert>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <PropertyTypeSelector formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <AdditionalDetailsSection formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '15px' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Project Media Uploads
                  <Typography variant="caption" display="block" color="text.secondary">
                    Supports files up to 200MB. Large files will be uploaded directly to cloud storage.
                  </Typography>
                </Typography>

                {/* Upload Progress */}
                <UploadProgress />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <input
                      accept="image/*,video/*,.pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      id="project-images"
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          await handleFileUpload(e.target.files, 'images');
                        }
                      }}
                      disabled={uploading}
                    />
                    <label htmlFor="project-images">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Project Images & Files'}
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.images.map((img, imgIndex) => (
                        <Chip
                          key={imgIndex}
                          label={img.title}
                          onDelete={() => {
                            setFormData((prev: any) => ({ 
                              ...prev, 
                              images: prev.images.filter((_: any, i: number) => i !== imgIndex) 
                            }));
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <input
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      style={{ display: 'none' }}
                      id="brochure-upload"
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          await handleFileUpload(e.target.files, 'brochureUrls');
                        }
                      }}
                      disabled={uploading}
                    />
                    <label htmlFor="brochure-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Brochures & Documents'}
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.brochureUrls.map((brochure, brochureIndex) => (
                        <Chip
                          key={brochureIndex}
                          label={brochure.title}
                          onDelete={() => {
                            setFormData((prev: any) => ({ 
                              ...prev, 
                              brochureUrls: prev.brochureUrls.filter((_: any, i: number) => i !== brochureIndex) 
                            }));
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <input
                      accept="image/*,video/*,.mp4,.mov,.avi"
                      style={{ display: 'none' }}
                      id="creatives-upload"
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          await handleFileUpload(e.target.files, 'creatives');
                        }
                      }}
                      disabled={uploading}
                    />
                    <label htmlFor="creatives-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Creatives (Images/Videos)'}
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.creatives.map((creative, creativeIndex) => (
                        <Chip
                          key={creativeIndex}
                          label={creative.title}
                          onDelete={() => {
                            setFormData((prev: any) => ({ 
                              ...prev, 
                              creatives: prev.creatives.filter((_: any, i: number) => i !== creativeIndex) 
                            }));
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <input
                      accept="video/*,.mp4,.mov,.avi,.mkv"
                      style={{ display: 'none' }}
                      id="videos-upload"
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          await handleFileUpload(e.target.files, 'videos');
                        }
                      }}
                      disabled={uploading}
                    />
                    <label htmlFor="videos-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Videos'}
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.videos.map((video, videoIndex) => (
                        <Chip
                          key={videoIndex}
                          label={video.title}
                          onDelete={() => {
                            setFormData((prev: any) => ({ 
                              ...prev, 
                              videos: prev.videos.filter((_: any, i: number) => i !== videoIndex) 
                            }));
                          }}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0', borderRadius: '0 0 15px 15px' }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Tooltip title={!isFormValid ? "Please fill all required fields" : "All required fields are filled"} arrow placement="top">
            <span>
              <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid || uploading}>
                {uploading ? 'Uploading...' : editingProperty ? "Update Property" : "Create Properties"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

      {/* View Property Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={handleCloseViewDialog} 
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
        {viewingProperty && (
          <>
            {/* Enhanced Header with Gradient Overlay */}
            <Box sx={{ 
              position: 'relative',
              height: { xs: 200, md: 200 },
              background: viewingProperty?.images?.length > 0 
                ? `linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%), url(${viewingProperty.images.find(img => img.isPrimary)?.url || viewingProperty.images[0]?.url})`
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
                  onClick={handleCloseViewDialog}
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
                    {viewingProperty?.projectName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>
                        {viewingProperty?.builderName}
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
                    {viewingProperty?.price || 'Contact for Price'}
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
                        {viewingProperty?.images?.length || 0} Images
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PlayArrow color="primary" />
                      <Typography variant="body2" fontWeight={600}>
                        {viewingProperty?.videos?.length || 0} Videos
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Description color="primary" />
                      <Typography variant="body2" fontWeight={600}>
                        {viewingProperty?.brochureUrls?.length || 0} Brochures
                      </Typography>
                    </Box>
                  </Box>
                  
                  {/* Download All Button */}
                  {(viewingProperty?.brochureUrls?.length > 0 || viewingProperty?.images?.length > 0) && (
                    <Button
                      variant="contained"
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownloadAllMedia(viewingProperty)}
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
                          {viewingProperty?.description}
                        </Typography>

                        {/* Highlights Grid */}
                        <Grid container spacing={3}>
                          {viewingProperty?.status && (
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50', height: '100%' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
                                  🏗️ Project Status
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {(Array.isArray(viewingProperty.status) ? viewingProperty.status : viewingProperty.status.split(',')).map((item, index) => (
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

                          {viewingProperty?.nearby && (
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'success.50', height: '100%' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', mb: 2 }}>
                                  📍 Nearby Locations
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {(Array.isArray(viewingProperty.nearby) ? viewingProperty.nearby : viewingProperty.nearby.split(',')).map((item, index) => (
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

                          {viewingProperty?.projectHighlights && (
                            <Grid size={{ xs: 12 }}>
                              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                                  ⭐ Project Highlights
                                </Typography>
                                <Grid container spacing={2}>
                                  {(Array.isArray(viewingProperty.projectHighlights) ? viewingProperty.projectHighlights : viewingProperty.projectHighlights.split(',')).map((point, index) => (
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
                          <Typography sx={{ p: 2,  }}>
                            {viewingProperty?.location}
                          </Typography>
                        </Box>


              {viewingProperty?.mapLocation ? (
                <>
                  <Box sx={{ height: 200, position: 'relative' }}>
                    <LeafletMap 
                      location={viewingProperty.mapLocation}
                      propertyName={viewingProperty.projectName}
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
                            {viewingProperty.mapLocation.lat?.toFixed(6) || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Longitude
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {viewingProperty.mapLocation.lng?.toFixed(6) || 'N/A'}
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
                              label={viewingProperty?.parentId === null ? "Main" : "Sub"} 
                              size="small" 
                              color={viewingProperty?.parentId === null ? "primary" : "secondary"}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total Media</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {(viewingProperty?.images?.length || 0) + (viewingProperty?.videos?.length || 0) + (viewingProperty?.brochureUrls?.length || 0)}
                            </Typography>
                          </Box>
                          
                          {viewingProperty?.parentId === null && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                              <Typography variant="body2" color="text.secondary">Sub Properties</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {viewingProperty?.subPropertyCount || 0}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Sub Properties Section */}
                {viewingProperty?.parentId === null && (
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
                          Property Types ({viewingProperty?.subPropertyCount || 0})
                        </Typography>
                      </Box>
                      <SubPropertiesViewer 
                        parentId={viewingProperty._id!} 
                        onViewSubProperty={handleViewSubProperty} 
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Media Sections */}
                <Grid container spacing={4} sx={{ mt: 2 }}>
                  {/* Images Section */}
                  {viewingProperty?.images && viewingProperty.images.length > 0 && (
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
                              Project Images ({viewingProperty.images.length})
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownload />}
                              onClick={() => handleDownloadImages(viewingProperty.images)}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            >
                              Download All
                            </Button>
                          </Box>
                          <Grid container spacing={2}>
                            {viewingProperty.images.map((image, index) => (
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
                                          handleDownloadFile(image.url, image.title || `image-${index + 1}.jpg`);
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
                  {viewingProperty?.videos && viewingProperty.videos.length > 0 && (
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
                              Videos ({viewingProperty.videos.length})
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownload />}
                              onClick={() => handleDownloadVideos(viewingProperty.videos)}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            >
                              Download All
                            </Button>
                          </Box>
                          <Grid container spacing={2}>
                            {viewingProperty.videos.map((video, index) => (
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
                                          handleDownloadFile(video.url, video.title || `video-${index + 1}.mp4`);
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
                  {viewingProperty?.brochureUrls && viewingProperty.brochureUrls.length > 0 && (
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
                              Brochures ({viewingProperty.brochureUrls.length})
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownload />}
                              onClick={() => handleDownloadBrochures(viewingProperty.brochureUrls)}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            >
                              Download All
                            </Button>
                          </Box>
                          <Grid container spacing={2}>
                            {viewingProperty.brochureUrls.map((brochure, index) => (
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
                                    onClick={() => handleDownloadFile(brochure.url, brochure.title || `brochure-${index + 1}.pdf`)}
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
                  {viewingProperty?.creatives && viewingProperty.creatives.length > 0 && (
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
                              Creatives ({viewingProperty.creatives.length})
                            </Typography>
                            <Button
                              variant="outlined"
                              startIcon={<CloudDownload />}
                              onClick={() => handleDownloadCreatives(viewingProperty.creatives)}
                              size="small"
                              sx={{ borderRadius: 2 }}
                            >
                              Download All
                            </Button>
                          </Box>
                          <Grid container spacing={2}>
                            {viewingProperty.creatives.map((creative, index) => (
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
                                            handleDownloadFile(creative.url, creative.title || `creative-${index + 1}.jpg`);
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
                                            handleDownloadFile(creative.url, creative.title || `creative-${index + 1}.mp4`);
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
                onClick={handleCloseViewDialog}
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
                  handleCloseViewDialog(); 
                  handleOpenDialog(viewingProperty); 
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
          </>
        )}
      </Dialog>

      {/* Sub-Property View Dialog */}
      <Dialog 
        open={openSubPropertyDialog} 
        onClose={() => setOpenSubPropertyDialog(false)} 
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
        {selectedSubProperty && (
          <>
            {/* Enhanced Header with Gradient Overlay */}
            <Box sx={{ 
              position: 'relative',
              height: { xs: 200, md: 200 },
              background: selectedSubProperty?.propertyImages?.length > 0 
                ? `linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%), url(${typeof selectedSubProperty.propertyImages[0] === 'string' ? selectedSubProperty.propertyImages[0] : selectedSubProperty.propertyImages[0]?.url})`
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
                  onClick={() => setOpenSubPropertyDialog(false)}
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
                    {selectedSubProperty?.propertyName}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Business sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
                      <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600, textTransform: 'capitalize' }}>
                        {selectedSubProperty?.propertyType} Property
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
                    {selectedSubProperty?.price ? `${selectedSubProperty.price.toLocaleString()}` : 'Contact for Price'}
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
                        {selectedSubProperty?.propertyImages?.length || 0} Images
                      </Typography>
                    </Box>
                    
                    {selectedSubProperty?.amenities && selectedSubProperty.amenities.length > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Star color="primary" />
                        <Typography variant="body2" fontWeight={600}>
                          {selectedSubProperty.amenities.length} Amenities
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Download All Button */}
                  {selectedSubProperty?.propertyImages?.length > 0 && (
                    <Button
                      variant="contained"
                      startIcon={<CloudDownload />}
                      onClick={() => handleDownloadAllMedia(selectedSubProperty)}
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
                          {selectedSubProperty?.propertyDescription || 'No description available.'}
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
                                    {selectedSubProperty?.propertyType}
                                  </Typography>
                                </Box>
                                {selectedSubProperty?.paymentPlan && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {selectedSubProperty.paymentPlan}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                          </Grid>

                          {/* Size Information */}
                          {(selectedSubProperty?.minSize || selectedSubProperty?.maxSize) && (
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'success.50', height: '100%' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', mb: 2 }}>
                                  📐 Size Details
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {selectedSubProperty?.minSize && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Min: {selectedSubProperty.minSize} {selectedSubProperty?.sizeUnit || ''}
                                      </Typography>
                                    </Box>
                                  )}
                                  {selectedSubProperty?.maxSize && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Max: {selectedSubProperty.maxSize} {selectedSubProperty?.sizeUnit || ''}
                                      </Typography>
                                    </Box>
                                  )}
                                </Box>
                              </Paper>
                            </Grid>
                          )}

                          {/* Residential Details */}
                          {selectedSubProperty?.propertyType === 'residential' && (
                            <Grid size={{ xs: 12 }}>
                              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                                  🏡 Residential Specifications
                                </Typography>
                                <Grid container spacing={2}>
                                  {selectedSubProperty?.bedrooms && (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                          {selectedSubProperty.bedrooms} Bedrooms
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  )}
                                  {selectedSubProperty?.bathrooms && (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                          {selectedSubProperty.bathrooms} Bathrooms
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  )}
                                  {selectedSubProperty?.carpetArea && (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                          Carpet: {selectedSubProperty.carpetArea}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  )}
                                  {selectedSubProperty?.builtUpArea && (
                                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                          Built-up: {selectedSubProperty.builtUpArea}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  )}
                                </Grid>
                              </Paper>
                            </Grid>
                          )}

                          {/* Plot Details */}
                          {selectedSubProperty?.propertyType === 'plot' && (
                            <Grid size={{ xs: 12 }}>
                              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'info.50' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'info.main', mb: 2 }}>
                                  📊 Plot Information
                                </Typography>
                                <Grid container spacing={2}>
                                  {selectedSubProperty?.ownershipType && (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                          {selectedSubProperty.ownershipType}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  )}
                                  {selectedSubProperty?.landType && (
                                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                          {selectedSubProperty.landType}
                                        </Typography>
                                      </Box>
                                    </Grid>
                                  )}
                                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'info.main' }} />
                                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Boundary: {selectedSubProperty?.boundaryWall ? 'Yes' : 'No'}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>
                          )}

                          {/* Amenities */}
                          {selectedSubProperty?.amenities && selectedSubProperty.amenities.length > 0 && (
                            <Grid size={{ xs: 12 }}>
                              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'secondary.50' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ color: 'secondary.main', mb: 2 }}>
                                  ⭐ Amenities & Features
                                </Typography>
                                <Grid container spacing={2}>
                                  {selectedSubProperty.amenities.map((amenity, index) => (
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
                              label={selectedSubProperty?.propertyType} 
                              size="small" 
                              color="primary"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total Images</Typography>
                            <Typography variant="body2" fontWeight={600}>
                              {selectedSubProperty?.propertyImages?.length || 0}
                            </Typography>
                          </Box>
                          
                          {selectedSubProperty?.paymentPlan && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                              <Typography variant="body2" color="text.secondary">Payment Plan</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {selectedSubProperty.paymentPlan}
                              </Typography>
                            </Box>
                          )}

                          {selectedSubProperty?.amenities && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                              <Typography variant="body2" color="text.secondary">Amenities</Typography>
                              <Typography variant="body2" fontWeight={600}>
                                {selectedSubProperty.amenities.length}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Amenities Card */}
                    {selectedSubProperty?.amenities && selectedSubProperty.amenities.length > 0 && (
                      <Card sx={{ 
                        borderRadius: 3, 
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            color: 'primary.main'
                          }}>
                            <Star sx={{ mr: 1.5 }} />
                            Top Amenities
                          </Typography>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                            {selectedSubProperty.amenities.slice(0, 6).map((amenity, index) => (
                              <Box key={index} sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 2,
                                p: 1.5,
                                borderRadius: 2,
                                background: 'rgba(25, 118, 210, 0.05)',
                                border: '1px solid rgba(25, 118, 210, 0.1)',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  background: 'rgba(25, 118, 210, 0.1)',
                                  transform: 'translateX(4px)'
                                }
                              }}>
                                <CheckCircle sx={{ fontSize: '1rem', color: 'success.main' }} />
                                <Typography variant="body2" fontWeight={600}>
                                  {amenity}
                                </Typography>
                              </Box>
                            ))}
                            {selectedSubProperty.amenities.length > 6 && (
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', mt: 1 }}>
                                +{selectedSubProperty.amenities.length - 6} more amenities
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                  </Grid>
                </Grid>

                {/* Images Section */}
                {selectedSubProperty?.propertyImages && selectedSubProperty.propertyImages.length > 0 && (
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
                          Property Images ({selectedSubProperty.propertyImages.length})
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<CloudDownload />}
                          onClick={() => handleDownloadImages(selectedSubProperty.propertyImages)}
                          size="small"
                          sx={{ borderRadius: 2 }}
                        >
                          Download All
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        {selectedSubProperty.propertyImages.map((image, index) => {
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
                                        handleDownloadFile(imageUrl, imageTitle);
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
                onClick={() => setOpenSubPropertyDialog(false)}
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
                  setOpenSubPropertyDialog(false); 
                  handleOpenDialog(selectedSubProperty); 
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
          </>
        )}
      </Dialog>
    </Box>
  );
}
