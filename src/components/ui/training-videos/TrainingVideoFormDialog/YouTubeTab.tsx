/* eslint-disable react/no-unescaped-entities */
import React, { useRef } from "react";
import {
  TextField,
  Card,
  CardMedia,
  Typography,
  Box,
  Button,
  FormHelperText,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, YouTube, CheckCircle, Error as ErrorIcon } from "@mui/icons-material";
import { TrainingVideoFormData } from "@/types/trainingVideo";
import { formatFileSize, MAX_THUMBNAIL_SIZE, YOUTUBE_PATTERNS } from "../constants";

interface YouTubeTabProps {
  formData: TrainingVideoFormData;
  errors: { [key: string]: string };
  onChange: (field: keyof TrainingVideoFormData) => (event: any) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>, field: 'videoUrl' | 'thumbnailUrl', inputRef?: React.RefObject<HTMLInputElement>) => Promise<void>;
  uploadingThumbnail: boolean;
  uploadProgress: number;
  isUploading: boolean;
  onRemoveThumbnail: () => void; // Added prop
}

export const YouTubeTab: React.FC<YouTubeTabProps> = ({
  formData,
  errors,
  onChange,
  onFileUpload,
  uploadingThumbnail,
  uploadProgress,
  isUploading,
  onRemoveThumbnail, // Added prop
}) => {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  
  const extractYouTubeId = (url: string): string | null => {
    if (!url) return null;
    
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/v\/([a-zA-Z0-9_-]+)/,
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    
    for (const pattern of YOUTUBE_PATTERNS) {
      if (pattern.test(url)) {
        return true;
      }
    }
    return false;
  };

  const youtubeId = extractYouTubeId(formData.videoUrl);
  const isValidYouTube = formData.videoUrl ? validateYouTubeUrl(formData.videoUrl) : false;
  const youtubeThumbnail = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : '';

  // Handle thumbnail removal
  const handleRemoveThumbnail = () => {
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
    onRemoveThumbnail(); // Call parent handler
  };

  return (
    <Box>
      <TextField
        fullWidth
        label="YouTube Video URL *"
        placeholder="https://www.youtube.com/watch?v=..."
        value={formData.videoUrl}
        onChange={onChange("videoUrl")}
        error={!!errors.videoUrl}
        helperText={errors.videoUrl || "Paste YouTube video link"}
        disabled={isUploading}
        InputProps={{
          startAdornment: <YouTube sx={{ color: 'error.main', mr: 1 }} />,
        }}
      />
      
      {/* YouTube Preview */}
      {isValidYouTube && youtubeId && (
        <Card sx={{ mt: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', p: 2 }}>
            <CardMedia
              component="img"
              sx={{ width: 120, height: 68, borderRadius: 1, mr: 2 }}
              image={youtubeThumbnail}
              alt="YouTube preview"
            />
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
                <Typography variant="subtitle2" color="success.main">
                  YouTube video detected
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Video ID: {youtubeId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Using YouTube's default thumbnail. You can upload a custom thumbnail below.
              </Typography>
            </Box>
          </Box>
        </Card>
      )}
      
      {formData.videoUrl && !isValidYouTube && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, color: 'error.main' }}>
          <ErrorIcon sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="caption">
            Invalid YouTube URL format
          </Typography>
        </Box>
      )}
      
      {/* Custom Thumbnail Upload for YouTube */}
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
          {uploadingThumbnail ? (
            "Uploading..."
          ) : formData.thumbnailUrl && formData.thumbnailUrl !== youtubeThumbnail ? (
            "Change Custom Thumbnail"
          ) : (
            "Upload Custom Thumbnail"
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
          <Box sx={{ mt: 1 }}>
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
        
        {formData.thumbnailUrl && formData.thumbnailUrl !== youtubeThumbnail && !uploadingThumbnail && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <img 
                src={formData.thumbnailUrl} 
                alt="Custom thumbnail" 
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
                  Custom thumbnail uploaded
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
        )}
        
        <FormHelperText>
          Upload a custom thumbnail image (JPG, PNG, etc. Max: {formatFileSize(MAX_THUMBNAIL_SIZE)})
        </FormHelperText>
      </Box>
    </Box>
  );
};

