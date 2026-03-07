// app/dashboard/properties/hooks/usePropertyState.ts
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { propertyService, type Property } from "@/services/propertyService";

const PROPERTIES_PER_PAGE = 6;

interface Filters {
  propertyType: string;
  status: string;
  location: string;
  builderName: string;
  visibility: string;
}

interface UsePropertyStateProps {
  filters: Filters;
}

export const usePropertyState = (filters: Filters) => {
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
  
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState(false);

  // Clean base64 from property data
  const cleanPropertyBase64 = useCallback((property: Property): Property => {
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
  }, []);

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
  }, [searchTerm, currentPage, filters, cleanPropertyBase64]);

  // Get paginated properties
  const getPaginatedProperties = useCallback(() => {
    if (properties.length <= PROPERTIES_PER_PAGE) {
      return properties;
    }
    const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
    const endIndex = startIndex + PROPERTIES_PER_PAGE;
    return properties.slice(startIndex, endIndex);
  }, [properties, currentPage]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Data cleaning utility
  const cleanFormData = useCallback((data: any) => {
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
  }, []);

  // Validate data has no base64 before submission
  const validateNoBase64 = useCallback((
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
  }, []);

  // Dialog functions
  const handleOpenDialog = useCallback((property: Property | null = null) => {
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
  }, [cleanPropertyBase64]);

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
    setEditingProperty(null);
    setValidationErrors({});
    setIsFormValid(false);
  }, []);

  const handleViewProperty = useCallback((property: Property) => {
    const cleanedProperty = cleanPropertyBase64(property);
    setViewingProperty(cleanedProperty);
    setOpenViewDialog(true);
  }, [cleanPropertyBase64]);

  const handleCloseViewDialog = useCallback(() => {
    setOpenViewDialog(false);
    setViewingProperty(null);
  }, []);

  const handleViewSubProperty = useCallback((subProperty: Property) => {
    const cleanedSubProperty = cleanPropertyBase64(subProperty);
    setSelectedSubProperty(cleanedSubProperty);
    setOpenSubPropertyDialog(true);
  }, [cleanPropertyBase64]);

  // Delete property
  const handleDeleteProperty = useCallback(async (id: string, propertyName?: string) => {
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
  }, [loadProperties]);

  // Submit form
  const handleSubmit = useCallback(async (data: any) => {
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
  }, [editingProperty, validateNoBase64, handleCloseDialog, loadProperties]);

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
  };
};
