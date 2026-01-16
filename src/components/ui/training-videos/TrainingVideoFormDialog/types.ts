import { TrainingVideo, TrainingVideoFormData } from "@/types/trainingVideo";

export interface YouTubePreview {
  valid: boolean;
  thumbnail?: string;
  youTubeId?: string;
}

export interface UploadProgress {
  video: boolean;
  thumbnail: boolean;
  progress: number;
}

export interface FormErrors {
  [key: string]: string;
}

export interface TabChangeEvent {
  event: React.SyntheticEvent;
  newValue: "youtube" | "upload";
}

export interface FileUploadEvent {
  event: React.ChangeEvent<HTMLInputElement>;
  field: 'videoUrl' | 'thumbnailUrl';
  inputRef?: React.RefObject<HTMLInputElement>;
}