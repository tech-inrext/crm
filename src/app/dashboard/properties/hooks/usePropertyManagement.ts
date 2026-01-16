// app/dashboard/properties/hooks/usePropertyManagement.ts

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { propertyService, type Property } from "@/services/propertyService";

// Core state management
import { usePropertyState } from "./usePropertyState";
// Filter and search management
import { usePropertyFilters } from "./usePropertyFilters";
// File and media management
import { usePropertyMedia } from "./usePropertyMedia";

const PROPERTIES_PER_PAGE = 6;

export const usePropertyManagement = () => {
  // Filter management - Initialize first since we need filters for state
  const {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    setActiveFiltersCount,
    handleFilterChange,
    clearAllFilters,
    removeFilter,
    handleSearchChange
  } = usePropertyFilters();

  // State management - Pass filters as parameter
  const {
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
    formData,
    setFormData,
    validationErrors,
    isFormValid,
    setIsFormValid,
    loadProperties,
    handleOpenDialog,
    handleCloseDialog,
    handleViewProperty,
    handleCloseViewDialog,
    handleViewSubProperty,
    handleDeleteProperty,
    handleSubmit,
    getPaginatedProperties,
    handlePageChange,
    cleanPropertyBase64,
    cleanFormData,
    validateNoBase64
  } = usePropertyState(filters);

  // File and media management
  const {
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
  } = usePropertyMedia({ loadProperties, formData, setFormData });

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

  return {
    // State
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
    
    // Filters
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    activeFiltersCount,
    
    // Media
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
    
    // Form
    validationErrors,
    isFormValid,
    formData,
    setFormData,
    
    // Actions
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
