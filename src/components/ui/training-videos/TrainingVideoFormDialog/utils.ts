import { YOUTUBE_PATTERNS } from "./constants";
import { FormErrors } from "./types";
import { TrainingVideoFormData } from "@/types/trainingVideo";

export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
};

export const validateYouTubeUrl = (url: string): boolean => {
  if (!url) return false;
  
  for (const pattern of YOUTUBE_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }
  return false;
};

export const validateForm = (
  formData: TrainingVideoFormData, 
  activeTab: "youtube" | "upload"
): FormErrors => {
  const errors: FormErrors = {};

  if (!formData.title.trim()) {
    errors.title = "Title is required";
  }

  if (!formData.videoUrl.trim()) {
    errors.videoUrl = activeTab === "youtube" 
      ? "YouTube URL is required" 
      : "Video file is required";
  }

  if (activeTab === "youtube") {
    if (formData.videoUrl && !validateYouTubeUrl(formData.videoUrl)) {
      errors.videoUrl = "Invalid YouTube URL format";
    }
  } else {
    if (!formData.thumbnailUrl.trim()) {
      errors.thumbnailUrl = "Thumbnail image is required";
    }
  }

  if (!formData.category) {
    errors.category = "Category is required";
  }

  return errors;
};

export const validateFileSize = (
  file: File, 
  maxSize: number, 
  field: string
): { isValid: boolean; error?: string } => {
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB} MB`
    };
  }
  return { isValid: true };
};

export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};