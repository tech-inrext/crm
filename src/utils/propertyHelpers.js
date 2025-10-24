// utils/propertyHelpers.js

// Helper to validate property data based on type
export const validatePropertyData = (propertyType, data) => {
  const errors = [];

  // Common required fields for all types
  if (!data.projectName) errors.push("Project name is required");
  if (!data.builderName) errors.push("Builder name is required");
  if (!data.location) errors.push("Location is required");

  switch (propertyType) {
    case 'project':
      if (!data.description) errors.push("Description is required");
      break;

    case 'residential':
      if (!data.propertyName) errors.push("Property name is required");
      if (!data.propertyDescription) errors.push("Property description is required");
      if (!data.price) errors.push("Price is required");
      if (!data.paymentPlan) errors.push("Payment plan is required");
      if (!data.minSize) errors.push("Minimum size is required");
      if (!data.maxSize) errors.push("Maximum size is required");
      if (!data.bedrooms) errors.push("Number of bedrooms is required");
      if (!data.bathrooms) errors.push("Number of bathrooms is required");
      if (!data.carpetArea) errors.push("Carpet area is required");
      if (!data.builtUpArea) errors.push("Built-up area is required");
      if (!data.propertyImage?.url) errors.push("Property image is required");
      break;

    case 'commercial':
      if (!data.propertyName) errors.push("Property name is required");
      if (!data.propertyDescription) errors.push("Property description is required");
      if (!data.price) errors.push("Price is required");
      if (!data.paymentPlan) errors.push("Payment plan is required");
      if (!data.minSize) errors.push("Minimum size is required");
      if (!data.maxSize) errors.push("Maximum size is required");
      if (!data.carpetArea) errors.push("Carpet area is required");
      if (!data.builtUpArea) errors.push("Built-up area is required");
      if (!data.propertyImage?.url) errors.push("Property image is required");
      break;

    case 'plot':
      if (!data.propertyName) errors.push("Property name is required");
      if (!data.propertyDescription) errors.push("Property description is required");
      if (!data.price) errors.push("Price is required");
      if (!data.paymentPlan) errors.push("Payment plan is required");
      if (!data.minSize) errors.push("Minimum size is required");
      if (!data.maxSize) errors.push("Maximum size is required");
      if (!data.ownershipType) errors.push("Ownership type is required");
      if (!data.landType) errors.push("Land type is required");
      if (!data.approvedBy) errors.push("Approved by is required");
      if (data.boundaryWall === undefined) errors.push("Boundary wall information is required");
      if (!data.propertyImage?.url) errors.push("Property image is required");
      break;
  }

  return errors;
};

// Helper to process property image data
export const processPropertyImage = (imageData) => {
  if (!imageData) return null;
  
  if (typeof imageData === 'string') {
    return {
      url: imageData,
      title: 'Property Image',
      description: '',
      uploadedAt: new Date()
    };
  }
  
  return {
    url: imageData.url,
    title: imageData.title || 'Property Image',
    description: imageData.description || '',
    uploadedAt: imageData.uploadedAt || new Date()
  };
};

// Helper to format property data for response
export const formatPropertyResponse = (property) => {
  const formatted = property.toObject ? property.toObject() : { ...property };
  
  // Ensure propertyImage is properly formatted
  if (!formatted.propertyImage) {
    formatted.propertyImage = {};
  }
  
  // Add virtual fields for easy access
  formatted.galleryImages = formatted.images?.filter(img => img.type === 'gallery') || [];
  formatted.floorPlans = formatted.images?.filter(img => img.type === 'floorPlan') || [];
  formatted.creatives = formatted.creatives || [];
  formatted.brochures = formatted.documents?.filter(doc => doc.type === 'brochure') || [];
  formatted.videos = formatted.videoUrls || [];
  
  // Add featured image (propertyImage takes priority)
  formatted.featuredImage = formatted.propertyImage?.url 
    ? formatted.propertyImage 
    : formatted.images?.find(img => img.isPrimary) || formatted.images?.[0] || null;
  
  return formatted;
};

// Helper to create property-specific data structure
export const createPropertyData = (baseData, propertyType) => {
  const commonData = {
    projectName: baseData.projectName,
    builderName: baseData.builderName,
    location: baseData.location,
    description: baseData.description,
    propertyType: propertyType,
    propertyName: baseData.propertyName,
    price: baseData.price,
    paymentPlan: baseData.paymentPlan,
    status: baseData.status,
    nearby: baseData.nearby,
    projectHighlights: baseData.projectHighlights,
    amenities: baseData.amenities,
    mapLocation: baseData.mapLocation,
    images: baseData.images || [],
    documents: baseData.documents || [],
    videoUrls: baseData.videoUrls || [],
    creatives: baseData.creatives || [],
    isActive: baseData.isActive !== undefined ? baseData.isActive : true,
  };

  // Add propertyImage if provided
  if (baseData.propertyImage) {
    commonData.propertyImage = processPropertyImage(baseData.propertyImage);
  }

  // Type-specific fields
  switch (propertyType) {
    case 'project':
      // Projects don't need propertyImage, minSize, maxSize, etc.
      delete commonData.propertyImage;
      delete commonData.minSize;
      delete commonData.maxSize;
      delete commonData.sizeUnit;
      delete commonData.propertyDescription;
      break;

    case 'residential':
      commonData.propertyDescription = baseData.propertyDescription;
      commonData.minSize = baseData.minSize;
      commonData.maxSize = baseData.maxSize;
      commonData.sizeUnit = baseData.sizeUnit;
      commonData.bedrooms = baseData.bedrooms;
      commonData.bathrooms = baseData.bathrooms;
      commonData.toilet = baseData.toilet;
      commonData.balcony = baseData.balcony;
      commonData.carpetArea = baseData.carpetArea;
      commonData.builtUpArea = baseData.builtUpArea;
      break;

    case 'commercial':
      commonData.propertyDescription = baseData.propertyDescription;
      commonData.minSize = baseData.minSize;
      commonData.maxSize = baseData.maxSize;
      commonData.sizeUnit = baseData.sizeUnit;
      commonData.carpetArea = baseData.carpetArea;
      commonData.builtUpArea = baseData.builtUpArea;
      break;

    case 'plot':
      commonData.propertyDescription = baseData.propertyDescription;
      commonData.minSize = baseData.minSize;
      commonData.maxSize = baseData.maxSize;
      commonData.sizeUnit = baseData.sizeUnit;
      commonData.ownershipType = baseData.ownershipType;
      commonData.landType = baseData.landType;
      commonData.approvedBy = baseData.approvedBy;
      commonData.boundaryWall = baseData.boundaryWall;
      break;
  }

  return commonData;
};

// Helper to get property type specific fields
export const getPropertyTypeFields = (propertyType) => {
  const baseFields = [
    'projectName', 'builderName', 'location', 'description',
    'propertyName', 'price', 'paymentPlan', 'status', 'nearby',
    'projectHighlights', 'amenities', 'mapLocation', 'images',
    'documents', 'videoUrls', 'creatives'
  ];

  const typeSpecificFields = {
    project: [...baseFields],
    residential: [
      ...baseFields,
      'propertyDescription', 'minSize', 'maxSize', 'sizeUnit',
      'bedrooms', 'bathrooms', 'toilet', 'balcony', 'carpetArea',
      'builtUpArea', 'propertyImage'
    ],
    commercial: [
      ...baseFields,
      'propertyDescription', 'minSize', 'maxSize', 'sizeUnit',
      'carpetArea', 'builtUpArea', 'propertyImage'
    ],
    plot: [
      ...baseFields,
      'propertyDescription', 'minSize', 'maxSize', 'sizeUnit',
      'ownershipType', 'landType', 'approvedBy', 'boundaryWall', 'propertyImage'
    ]
  };

  return typeSpecificFields[propertyType] || baseFields;
};