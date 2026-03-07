import React from "react";
import {
  Typography,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, CheckCircle } from "@mui/icons-material";
import { TrainingVideoFormData } from "@/types/trainingVideo";

interface CustomThumbnailUploadProps {
  formData: TrainingVideoFormData;
  uploadingThumbnail: boolean;
  uploadProgress: number;
  isUploading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, field: 'videoUrl' | 'thumbnailUrl', inputRef?: React.RefObject<HTMLInputElement>) => Promise<void>;
  onRemoveThumbnail: () => void;
  thumbnailInputRef: React.RefObject<HTMLInputElement>;
}

export const CustomThumbnailUpload: React.FC<CustomThumbnailUploadProps> = ({
  formData,
  uploadingThumbnail,
  uploadProgress,
  isUploading,
  onFileUpload,
  onRemoveThumbnail,
  thumbnailInputRef,
}) => {
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    return match?.[1] || null;
  };

  const youtubeId = extractYouTubeId(formData.videoUrl);
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '';

  const handleRemoveThumbnail = () => {
    thumbnailInputRef.current && (thumbnailInputRef.current.value = '');
    onRemoveThumbnail();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Custom Thumbnail (Optional)
      </Typography>
      <Button
        variant="outlined"
        component="label"
        startIcon={uploadingThumbnail ? <CircularProgress size={20} /> : <CloudUpload />}
        disabled={isUploading}
        sx={{ mb: 1 }}
      >
        {uploadingThumbnail ? "Uploading..." :
         formData.thumbnailUrl && formData.thumbnailUrl !== youtubeThumbnail ? 
         "Change Custom Thumbnail" : "Upload Custom Thumbnail"}
        <input
          type="file"
          hidden
          accept="image/*"
          ref={thumbnailInputRef}
          onChange={(e) => onFileUpload(e, 'thumbnailUrl', thumbnailInputRef)}
        />
      </Button>
      
      {uploadingThumbnail && (
        <Box sx={{ mt: 1 }}>
          <Box sx={styles.progressHeader}>
            <Typography variant="caption" color="text.secondary">
              Uploading...
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(uploadProgress)}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={uploadProgress} 
            sx={styles.progressBar}
          />
        </Box>
      )}
      
      {formData.thumbnailUrl && formData.thumbnailUrl !== youtubeThumbnail && !uploadingThumbnail && (
        <Box sx={styles.uploadedThumbnail}>
          <Box sx={styles.thumbnailRow}>
            <img 
              src={formData.thumbnailUrl} 
              alt="Custom thumbnail" 
              style={styles.thumbnailPreview}
            />
            <Box>
              <CheckCircle sx={styles.successIcon} />
              <Typography variant="caption" color="success.main">
                Custom thumbnail uploaded
              </Typography>
            </Box>
          </Box>
          <Button size="small" onClick={handleRemoveThumbnail}>
            Remove
          </Button>
        </Box>
      )}
    </Box>
  );
};

const styles = {
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    mb: 0.5
  },
  progressBar: {
    height: 6,
    borderRadius: 3
  },
  uploadedThumbnail: {
    mt: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  thumbnailRow: {
    display: 'flex',
    alignItems: 'center'
  },
  thumbnailPreview: {
    width: 80,
    height: 45,
    borderRadius: 4,
    marginRight: 8,
    objectFit: 'cover'
  },
  successIcon: {
    color: 'success.main',
    fontSize: 16,
    mr: 0.5
  }
} as const;