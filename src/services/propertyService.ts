
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v0';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface Property {
  _id?: string;
  projectName: string;
  builderName: string;
  description: string;
  location: string;
  price: string;
  status: string[];
  features: string[];
  amenities: string[];
  nearby: string[];
  projectHighlights: string[];
  mapLocation: {
    lat: number;
    lng: number;
  };
  images: {
    url: string;
    title?: string;
    description?: string;
    isPrimary?: boolean;
    uploadedAt?: string;
  }[];
  brochureUrls: {
    title: string;
    url: string;
    type: string;
  }[];
  creatives: {
    title: string;
    url: string;
    type: string;
  }[];
  // videoIds: string[];
  videoFiles: {
    title: string;
    url: string;
    type: string;
  }[];
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const propertyService = {
  getAllProperties: async (search = '', page = 1, limit = 100) => {
    const response = await api.get('/property', {
      params: { search, page, limit }
    });
    return response.data;
  },

  getPropertyById: async (id: string) => {
    const response = await api.get(`/property/${id}`);
    return response.data;
  },

  createProperty: async (propertyData: Omit<Property, '_id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post('/property', propertyData);
    return response.data;
  },

  updateProperty: async (id: string, propertyData: Partial<Property>) => {
    const response = await api.patch(`/property/${id}`, propertyData);
    return response.data;
  },

  deleteProperty: async (id: string) => {
    const response = await api.delete(`/property/${id}`);
    return response.data;
  },
};

