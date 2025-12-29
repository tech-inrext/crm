import React, { useRef } from "react";
import {
  Typography,
  Box,
  Button,
  FormHelperText,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, VideoFile, Image, CheckCircle } from "@mui/icons-material";
import { TrainingVideoFormData } from "@/types/trainingVideo";
import { formatFileSize, MAX_VIDEO_SIZE, MAX_THUMBNAIL_SIZE } from "../constants";

interface UploadTabProps {
  formData: TrainingVideoFormData;
  errors: { [key: string]: string };
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, field: 'videoUrl' | 'thumbnailUrl', inputRef?: React.RefObject<HTMLInputElement>) => Promise<void>;
  uploadingVideo: boolean;
  uploadingThumbnail: boolean;
  uploadProgress: number;
  isUploading: boolean;
  onRemoveVideo: () => void; // Added prop
  onRemoveThumbnail: () => void; // Added prop
}

export const UploadTab: React.FC<UploadTabProps> = ({
  formData,
  errors,
  onFileUpload,
  uploadingVideo,
  uploadingThumbnail,
  uploadProgress,
  isUploading,
  onRemoveVideo, // Added prop
  onRemoveThumbnail, // Added prop
}) => {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Handle video removal
  const handleRemoveVideo = () => {
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
    onRemoveVideo(); // Call parent handler
  };

  // Handle thumbnail removal
  const handleRemoveThumbnail = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
    onRemoveThumbnail(); // Call parent handler
  };

  return (
    <Box>
      {/* Video File Upload */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Video File *
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={uploadingVideo ? <CircularProgress size={20} /> : <VideoFile />}
          disabled={isUploading}
          fullWidth
          sx={{ 
            height: '56px', 
            mb: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {uploadingVideo ? (
            "Uploading Video..."
          ) : formData.videoUrl ? (
            "Change Video File"
          ) : (
            "Upload Video File"
          )}
          <input
            type="file"
            hidden
            accept="video/*"
            ref={videoInputRef}
            onChange={(e) => onFileUpload(e, 'videoUrl', videoInputRef)}
          />
        </Button>
        
        {uploadingVideo && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
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
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
        
        {formData.videoUrl && !uploadingVideo && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
              <Typography variant="caption" color="success.main">
                Video uploaded successfully
              </Typography>
            </Box>
            <Button
              size="small"
              onClick={handleRemoveVideo}
            >
              Remove
            </Button>
          </Box>
        )}
        
        {errors.videoUrl && (
          <FormHelperText error>{errors.videoUrl}</FormHelperText>
        )}
        
        <FormHelperText>
          Upload MP4, MOV, AVI, or other video formats (Max: {formatFileSize(MAX_VIDEO_SIZE)})
        </FormHelperText>
      </Box>

      {/* Thumbnail Upload */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Thumbnail Image *
        </Typography>
        <Button
          variant="outlined"
          component="label"
          startIcon={uploadingThumbnail ? <CircularProgress size={20} /> : <Image />}
          disabled={isUploading}
          fullWidth
          sx={{ 
            height: '56px', 
            mb: 1,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {uploadingThumbnail ? (
            "Uploading Thumbnail..."
          ) : formData.thumbnailUrl ? (
            "Change Thumbnail"
          ) : (
            "Upload Thumbnail"
          )}
          <input
            type="file"
            hidden
            accept="image/*"
            ref={thumbnailInputRef}
            onChange={(e) => onFileUpload(e, 'thumbnailUrl', thumbnailInputRef)}
          />
        </Button>
        
        {uploadingThumbnail && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
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
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}
        
        {formData.thumbnailUrl && !uploadingThumbnail && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <img 
                  src={formData.thumbnailUrl} 
                  alt="Thumbnail preview" 
                  style={{ 
                    width: 80, 
                    height: 45, 
                    borderRadius: 4,
                    marginRight: 8,
                    objectFit: 'cover' 
                  }}
                />
                <Box>
                  <CheckCircle sx={{ color: 'success.main', fontSize: 16, mr: 0.5 }} />
                  <Typography variant="caption" color="success.main">
                    Thumbnail uploaded
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                onClick={handleRemoveThumbnail}
              >
                Remove
              </Button>
            </Box>
          </Box>
        )}
        
        {errors.thumbnailUrl && (
          <FormHelperText error>{errors.thumbnailUrl}</FormHelperText>
        )}
        
        <FormHelperText>
          Upload JPG, PNG, or other image formats (Max: {formatFileSize(MAX_THUMBNAIL_SIZE)})
        </FormHelperText>
      </Box>
    </Box>
  );
};