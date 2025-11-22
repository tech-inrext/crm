export interface TrainingVideo {
  _id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  uploadDate: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TrainingVideoFormData {
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
}

export interface Category {
  name: string;
  count: number;
  latestVideo: string;
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
  featured: TrainingVideo[];
  pagination: PaginationInfo;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileUrl: string;
  fileName: string;
}