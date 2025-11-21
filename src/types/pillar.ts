export interface ProfileImage {
  url: string;
  type: "primary" | "secondary";
  uploadedAt: string;
}

export interface Pillar {
  _id: string;
  name: string;
  category: "the-visionaries" | "the-strategic-force" | "growth-navigators" | "the-powerhouse-team";
  profileImages: ProfileImage[];
  designation: string;
  about: string;
  experience: string;
  projects: Array<{
    _id: string;
    projectName: string;
    builderName: string;
    location: string;
    price: string;
    images: Array<{ url: string }>;
    slug: string;
    propertyType: string;
  }>;
  expertise: string[];
  skills: string[];
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PillarFormData {
  name: string;
  category: string;
  profileImages: ProfileImage[];
  designation: string;
  about: string;
  experience: string;
  projects: string[];
  expertise: string[];
  skills: string[];
  isFeatured?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationInfo {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface PillarsResponse {
  success: boolean;
  data: Pillar[];
  pagination: PaginationInfo;
}

