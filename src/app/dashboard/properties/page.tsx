// app/dashboard/properties/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { Toaster, toast } from "sonner";
import { propertyService, type Property } from "@/services/propertyService";
import { uploadService } from "@/services/uploadService";

// Components
import PropertiesHeader from "./components/PropertiesHeader";
import FiltersSection from "./components/FiltersSection";
import PropertyList from "./components/PropertyList";
import EmptyState from "./components/EmptyState";
import PaginationControls from "./components/PaginationControls";
import PropertyFormDialog from "./components/PropertyFormDialog";
import PropertyViewDialog from "./components/PropertyViewDialog/index";
import SubPropertyViewDialog from "./components/SubPropertyViewDialog";

// Custom debounce hook
import { useDebounce } from "@/hooks/useDebounce";

// Custom hooks
import { usePropertyManagement } from "./hooks/usePropertyManagement";

export default function PropertiesPage() {
  const { getPermissions } = useAuth();
  
  // State management
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
  } = usePropertyManagement();

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const PROPERTIES_PER_PAGE = 6;
  
  // Check if user has write permission for property module
  const canCreateProperty = getPermissions("property").hasWriteAccess;

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

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading properties...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Toaster position="top-right" />

      <PropertiesHeader
        searchTerm={searchTerm}
        // onSearchChange={handleSearchChange}
        onSearchChange={(e) => setSearchTerm(handleSearchChange(e))}
        activeFiltersCount={activeFiltersCount}
        showFilters={showFilters}
        toggleFilters={() => setShowFilters(!showFilters)}
        canCreateProperty={canCreateProperty}
        onAddProperty={() => handleOpenDialog()}
        totalItems={totalItems}
      />

      <FiltersSection
        showFilters={showFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAllFilters={clearAllFilters}
        onRemoveFilter={removeFilter}
        activeFiltersCount={activeFiltersCount}
      />

      <Box sx={{ width: "100%" }}>
        {properties.length === 0 ? (
          <EmptyState
            searchTerm={searchTerm}
            onAddProperty={() => handleOpenDialog()}
          />
        ) : (
          <>
            <PropertyList
              properties={properties}
              currentPage={currentPage}
              propertiesPerPage={PROPERTIES_PER_PAGE}
              onEdit={handleOpenDialog}
              onView={handleViewProperty}
              onDelete={handleDeleteProperty}
              onViewSubProperty={handleViewSubProperty}
              onEditSubProperty={handleOpenDialog}
              onDeleteSubProperty={(id, subPropertyName) =>
                handleDeleteProperty(id, subPropertyName)
              }
              onTogglePublic={handleTogglePublic}
              onToggleFeatured={handleToggleFeatured}
            />

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
