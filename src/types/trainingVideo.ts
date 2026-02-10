// types/trainingVideo.ts
export interface TrainingVideo {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  mimeType?: string;
  resolution?: string;
  isPublic?: boolean;
  category: string;
  uploadDate: string;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  isYouTube?: boolean;
  youTubeId?: string;
  sourceType?: "youtube" | "upload";
}

export interface TrainingVideoFormData {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  mimeType?: string;
  resolution?: string;
  isYouTube?: boolean;
  youTubeId?: string;
  sourceType?: "youtube" | "upload";
}

export interface Category {
  name: string;
  count: number;
  latestVideo?: Date;
}

export interface PaginationInfo {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface TrainingVideosResponse {
  success: boolean;
  data: TrainingVideo[];
  featured?: TrainingVideo[];
  pagination?: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface UploadUrlResponse {
  success: boolean;
  uploadUrl: string;
  fileUrl: string;
}
