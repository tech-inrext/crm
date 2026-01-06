// services/propertyService.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v0';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Public API instance 
const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

export interface Property {
  _id?: string;
  slug?: string;
  projectName: string;
  builderName: string;
  description: string;
  location: string;

  isPublic?: boolean;
  isFeatured?: boolean;
  
  propertyType: 'project' | 'residential' | 'commercial' | 'plot';
  propertyName: string;
  propertyDescription: string;
  price: string;
  minPrice?: number;
  maxPrice?: number;
  paymentPlan: string;

  minSize?: string;
  maxSize?: string;
  sizeUnit?: string;

  bedrooms?: number;
  bathrooms?: number;
  toilet?: number;
  balcony?: number;
  carpetArea?: string;
  builtUpArea?: string;

  ownershipType?: 'Freehold' | 'Leasehold' | 'GPA' | 'Power of Attorney';
  landType?: 'Residential Plot' | 'Commercial Plot' | 'Farm Land' | 'Industrial Plot' | 'Mixed Use';
  approvedBy?: string;
  boundaryWall?: boolean;

  amenities?: string[];
  status: string[];
  nearby: string[];
  projectHighlights: string[];
  mapLocation?: {
    lat: number;
    lng: number;
  };

  images?: {
    url: string;
    title?: string;
    description?: string;
    isPrimary?: boolean;
    uploadedAt?: string;
  }[];

  propertyImages?: {
    url: string;
    title?: string;
    description?: string;
    isPrimary?: boolean;
    uploadedAt?: string;
  }[];

  floorPlans?: {
    url: string;
    title?: string;
    description?: string;
    type?: "2d" | "3d" | "structural" | "image" | "pdf";
    uploadedAt?: string;
  }[];

  creatives?: {
    type: "image" | "video" | "3d-tour";
    url: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    uploadedAt?: string;
  }[];

  videos?: {
    url: string;
    title?: string;
    description?: string;
    thumbnail?: string;
    type?: "youtube" | "vimeo" | "direct";
    uploadedAt?: string;
  }[];

  brochureUrls?: {
    title: string;
    url: string;
    type?: string;
  }[];

  createdBy?: string;
  parentId?: string | null;
  parentDetails?: {
    projectName: string;
    builderName: string;
    location: string;
    price: string;
    minPrice?: number;
    maxPrice?: number;
  };
  subPropertyCount?: number;
  subProperties?: Property[];
  children?: Property[];
  hierarchyLevel?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SinglePropertyResponse {
  success: boolean;
  data: Property;
  message?: string;
}

export interface MultiplePropertiesResponse {
  success: boolean;
  data: {
    mainProject: Property;
    subProperties: Property[];
  };
  message?: string;
}

export interface PropertyListResponse {
  success: boolean;
  data: Property[];
  message?: string;
  pagination?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  parentProject?: Property;
  view?: string;
}

export interface HierarchicalPropertyResponse {
  success: boolean;
  data: Property[];
  message?: string;
  view: "hierarchical";
}

export type PropertyResponse = SinglePropertyResponse | MultiplePropertiesResponse | PropertyListResponse | HierarchicalPropertyResponse;

export interface PublicPropertyResponse {
  success: boolean;
  data: Property[];
  message?: string;
  pagination?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

export interface SinglePublicPropertyResponse {
  success: boolean;
  data: Property;
  message?: string;
}

// Helper function to clean base64 data
const cleanBase64Data = (data: any): any => {
  const cleaned = JSON.parse(JSON.stringify(data));
  
  const cleanArray = (arr: any[] | undefined) => {
    if (!arr || !Array.isArray(arr)) return arr;
    return arr.map(item => {
      if (item && item.url && item.url.startsWith('data:')) {
        // Remove base64 items
        console.warn('Removing base64 data:', item.url.substring(0, 50) + '...');
        return null;
      }
      return item;
    }).filter(item => item !== null);
  };
  
  // Clean all file arrays
  cleaned.images = cleanArray(cleaned.images);
  cleaned.propertyImages = cleanArray(cleaned.propertyImages);
  cleaned.floorPlans = cleanArray(cleaned.floorPlans);
  cleaned.creatives = cleanArray(cleaned.creatives);
  cleaned.videos = cleanArray(cleaned.videos);
  cleaned.brochureUrls = cleanArray(cleaned.brochureUrls);
  
  return cleaned;
};

export const propertyService = {
  getAllProperties: async (
    search = '', 
    page = 1, 
    limit = 100, 
    parentOnly = "false", 
    parentId?: string,
    propertyType?: string,
    status?: string,
    location?: string,
    builderName?: string,
    includeChildren = "false",
    minPrice?: number,
    maxPrice?: number
  ): Promise<PropertyListResponse> => {
    const params: any = { search, page, limit, parentOnly, includeChildren, _t: Date.now() };
    if (propertyType) params.propertyType = propertyType;
  if (status) params.status = status;
  if (location) params.location = location;
  if (builderName) params.builderName = builderName;
  if (parentId) params.parentId = parentId;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  
  const response = await api.get('/property', { params });
  return response.data;
  },

  getPublicProperties: async (
    search = '', 
    page = 1, 
    limit = 12, 
    propertyType?: string,
    location?: string,
    builderName?: string,
    minPrice?: number,
    maxPrice?: number,
    featured = "false"
  ): Promise<PublicPropertyResponse> => {
    const params: any = { 
      isPublic: "true", 
      search, 
      page, 
      limit, 
      featured,
      _t: Date.now() 
    };
    
    if (propertyType) params.propertyType = propertyType;
    if (location) params.location = location;
    if (builderName) params.builderName = builderName;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    
    const response = await publicApi.get('/property', { params });
    return response.data;
  },

  getPublicPropertyById: async (idOrSlug: string, withChildren = "false"): Promise<SinglePublicPropertyResponse> => {
    const response = await publicApi.get(`/property/${idOrSlug}`, {
      params: { 
        publicView: "true",
        withChildren 
      }
    });
    return response.data;
  },

  getFeaturedProperties: async (limit = 6): Promise<PublicPropertyResponse> => {
    const response = await publicApi.get('/property', {
      params: { 
        isPublic: "true",
        featured: "true",
        limit,
        _t: Date.now()
      }
    });
    return response.data;
  },

  togglePublicVisibility: async (id: string, isPublic: boolean): Promise<SinglePropertyResponse> => {
    const response = await api.patch(`/property/${id}`, { isPublic });
    return response.data;
  },

  toggleFeaturedStatus: async (id: string, isFeatured: boolean): Promise<SinglePropertyResponse> => {
    const response = await api.patch(`/property/${id}`, { isFeatured });
    return response.data;
  },

  getHierarchicalProperties: async (
  search = '', 
  status?: string, 
  propertyType?: string,
  location?: string,
  builderName?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<HierarchicalPropertyResponse> => {
  const params: any = { 
    hierarchyView: "true", 
    search, 
    _t: Date.now(),
    parentOnly: "true" 
  };
  
  if (status) params.status = status;
  if (propertyType) params.propertyType = propertyType;
  if (location) params.location = location;
  if (builderName) params.builderName = builderName;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  
  const response = await api.get('/property', { params });
  return response.data;
},

  getPaginatedHierarchicalProperties: async (
  search = '', 
  page = 1, 
  limit = 6,
  status?: string, 
  propertyType?: string,
  location?: string,
  builderName?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<PropertyListResponse> => {
  const params: any = { 
    search, 
    page, 
    limit,
    parentOnly: "true",
    _t: Date.now()
  };
  
  if (status) params.status = status;
  if (propertyType) params.propertyType = propertyType;
  if (location) params.location = location;
  if (builderName) params.builderName = builderName;
  if (minPrice) params.minPrice = minPrice;
  if (maxPrice) params.maxPrice = maxPrice;
  
  const response = await api.get('/property', { params });
  return response.data;
  },

  getPropertyById: async (idOrSlug: string, withChildren = "false"): Promise<SinglePropertyResponse> => {
    const response = await api.get(`/property/${idOrSlug}`, {
      params: { withChildren }
    });
    return response.data;
  },

  getPropertyBySlug: async (slug: string, withChildren = "false"): Promise<SinglePropertyResponse> => {
    const response = await api.get(`/property/${slug}`, {
      params: { withChildren }
    });
    return response.data;
  },

  createProperty: async (propertyData: any): Promise<PropertyResponse> => {
    try {
      // Clean any base64 data before sending
      const cleanedData = cleanBase64Data(propertyData);
      
      const formattedData = {
        ...cleanedData,
        propertyType: Array.isArray(cleanedData.propertyType) ? cleanedData.propertyType : [cleanedData.propertyType],
        
        images: cleanedData.images?.map((img: any) => ({
          url: img.url,
          title: img.title || '',
          description: img.description || '',
          isPrimary: img.isPrimary || false,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        })) || [],
        
        propertyImages: cleanedData.propertyImages?.map((img: any) => ({
          url: img.url,
          title: img.title || '',
          description: img.description || '',
          isPrimary: img.isPrimary || false,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        })) || [],
        
        floorPlans: cleanedData.floorPlans?.map((plan: any) => ({
          url: plan.url,
          title: plan.title || '',
          description: plan.description || '',
          type: plan.type || '2d',
          uploadedAt: plan.uploadedAt || new Date().toISOString()
        })) || [],
        
        creatives: cleanedData.creatives?.map((creative: any) => ({
          type: creative.type || 'image',
          url: creative.url,
          title: creative.title || '',
          description: creative.description || '',
          thumbnail: creative.thumbnail || '',
          uploadedAt: creative.uploadedAt || new Date().toISOString()
        })) || [],
        
        videos: cleanedData.videos?.map((video: any) => ({
          url: video.url,
          title: video.title || '',
          description: video.description || '',
          thumbnail: video.thumbnail || '',
          type: video.type || 'direct',
          uploadedAt: video.uploadedAt || new Date().toISOString()
        })) || [],
        
        brochureUrls: cleanedData.brochureUrls?.map((brochure: any) => ({
          title: brochure.title || '',
          url: brochure.url,
          type: brochure.type || 'PDF Document'
        })) || [],

        residentialProperties: cleanedData.residentialProperties?.map((prop: any) => ({
          propertyName: prop.propertyName || '',
          propertyDescription: prop.propertyDescription || '',
          price: prop.price || '',
          floors: prop.floors,
          paymentPlan: prop.paymentPlan || cleanedData.paymentPlan,
          bedrooms: prop.bedrooms || 0,
          bathrooms: prop.bathrooms || 0,
          toilet: prop.toilet || 0,
          balcony: prop.balcony || 0,
          carpetArea: prop.carpetArea || '',
          builtUpArea: prop.builtUpArea || '',
          minSize: prop.minSize || '',
          maxSize: prop.maxSize || '',
          sizeUnit: prop.sizeUnit || 'sq.ft.',
          amenities: prop.amenities || [],
          propertyImages: prop.propertyImages?.map((img: any) => ({
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            isPrimary: img.isPrimary || false,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: prop.floorPlans?.map((plan: any) => ({
            url: plan.url,
            title: plan.title || '',
            description: plan.description || '',
            type: plan.type || '2d',
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || []
        })) || [],
        
        commercialProperties: cleanedData.commercialProperties?.map((prop: any) => ({
          propertyName: prop.propertyName || '',
          propertyDescription: prop.propertyDescription || '',
          price: prop.price || '',
          floors: prop.floors,
          paymentPlan: prop.paymentPlan || cleanedData.paymentPlan,
          carpetArea: prop.carpetArea || '',
          builtUpArea: prop.builtUpArea || '',
          minSize: prop.minSize || '',
          maxSize: prop.maxSize || '',
          sizeUnit: prop.sizeUnit || 'sq.ft.',
          amenities: prop.amenities || [],
          propertyImages: prop.propertyImages?.map((img: any) => ({
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            isPrimary: img.isPrimary || false,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: prop.floorPlans?.map((plan: any) => ({
            url: plan.url,
            title: plan.title || '',
            description: plan.description || '',
            type: plan.type || '2d',
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || []
        })) || [],
        
        plotProperties: cleanedData.plotProperties?.map((prop: any) => ({
          propertyName: prop.propertyName || '',
          propertyDescription: prop.propertyDescription || '',
          price: prop.price || '',
          paymentPlan: prop.paymentPlan || cleanedData.paymentPlan,
          ownershipType: prop.ownershipType || 'Freehold',
          landType: prop.landType || 'Residential Plot',
          approvedBy: prop.approvedBy || '',
          boundaryWall: prop.boundaryWall || false,
          minSize: prop.minSize || '',
          maxSize: prop.maxSize || '',
          sizeUnit: prop.sizeUnit || 'sq.ft.',
          amenities: prop.amenities || [],
          propertyImages: prop.propertyImages?.map((img: any) => ({
            url: img.url,
            title: img.title || '',
            description: img.description || '',
            isPrimary: img.isPrimary || false,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: prop.floorPlans?.map((plan: any) => ({
            url: plan.url,
            title: plan.title || '',
            description: plan.description || '',
            type: plan.type || '2d',
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || []
        })) || []
      };

      const response = await api.post('/property', formattedData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating property:', error);
      throw new Error(error.response?.data?.message || error.message || "Failed to create property");
    }
  },

  updateProperty: async (idOrSlug: string, propertyData: Partial<Property>): Promise<SinglePropertyResponse> => {
    // Clean any base64 data before sending
    const cleanedData = cleanBase64Data(propertyData);
    const response = await api.patch(`/property/${idOrSlug}`, cleanedData);
    return response.data;
  },

  deleteProperty: async (idOrSlug: string): Promise<SinglePropertyResponse> => {
    const response = await api.delete(`/property/${idOrSlug}`);
    return response.data;
  },

  getMainProjects: async (search = '', page = 1, limit = 100): Promise<PropertyListResponse> => {
    const response = await api.get('/property', {
      params: { search, page, limit, parentOnly: "true" }
    });
    return response.data;
  },

  getSubProperties: async (parentId: string, search = '', page = 1, limit = 100): Promise<PropertyListResponse> => {
    const response = await api.get('/property', {
      params: { 
        parentId, 
        search, 
        page, 
        limit,
        action: 'subproperties'
      }
    });
    return response.data;
  },

  getPropertiesWithChildren: async (search = '', page = 1, limit = 100): Promise<PropertyListResponse> => {
    const response = await api.get('/property', {
      params: { search, page, limit, includeChildren: "true" }
    });
    return response.data;
  },
  
  // Helper to validate property data has no base64
  validatePropertyData: (propertyData: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    const checkArray = (arr: any[], name: string) => {
      if (!arr || !Array.isArray(arr)) return;
      
      arr.forEach((item, index) => {
        if (item && item.url && item.url.startsWith('data:')) {
          errors.push(`Base64 data found in ${name}[${index}]`);
        }
      });
    };
    
    checkArray(propertyData.images, 'images');
    checkArray(propertyData.propertyImages, 'propertyImages');
    checkArray(propertyData.floorPlans, 'floorPlans');
    checkArray(propertyData.creatives, 'creatives');
    checkArray(propertyData.videos, 'videos');
    checkArray(propertyData.brochureUrls, 'brochureUrls');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};
