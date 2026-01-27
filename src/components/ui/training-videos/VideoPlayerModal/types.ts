import { TrainingVideo } from "@/types/trainingVideo";

export interface VideoPlayerProps {
  open: boolean;
  video: TrainingVideo | null;
  onClose: () => void;
}

export interface PlayerState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  progress: number;
  bufferProgress: number;
  isLoading: boolean;
  isFullscreen: boolean;
  showControls: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  hasError: boolean;
}

export interface YouTubePlayerConfig {
  videoId: string;
  autoplay?: boolean;
  controls?: boolean;
  modestbranding?: boolean;
  rel?: number;
  showinfo?: number;
  fs?: number;
  playsinline?: number;
}