export const CATEGORIES = [
  "basic-sales-training-fundamentals",
  "team-building",
  "growth-model",
  "basic-fundamentals-of-real-estate",
  "company-code-of-conduct-rules-compliances"
] as const;

export const DEFAULT_VIDEO_DATA = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  category: "",
  sourceType: "upload" as const
};

export const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150 MB
export const MAX_THUMBNAIL_SIZE = 1 * 1024 * 1024; // 1 MB

export const YOUTUBE_PATTERNS = [
  /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtu\.be\/[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/v\/[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]+/
] as const;

export const getCategoryLabel = (category: string): string => {
  const categoryLabels: Record<string, string> = {
    "basic-sales-training-fundamentals": "Basic Sales Training Fundamentals",
    "team-building": "Team Building",
    "growth-model": "Growth Model",
    "basic-fundamentals-of-real-estate": "Basic Fundamentals of Real Estate",
    "company-code-of-conduct-rules-compliances": "Company Code of Conduct, Rules & Compliances (RERA)"
  };
  return categoryLabels[category] || category;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const SORT_OPTIONS = [
  { value: "uploadDate_desc", label: "Newest First" },
  { value: "uploadDate_asc", label: "Oldest First" },
  { value: "title_asc", label: "Title A-Z" },
  { value: "title_desc", label: "Title Z-A" }
] as const;