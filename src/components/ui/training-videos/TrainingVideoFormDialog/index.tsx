import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormHelperText,
  SelectChangeEvent,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material";
import { Close, CloudUpload, YouTube } from "@mui/icons-material";
import { TrainingVideo, TrainingVideoFormData } from "@/types/trainingVideo";
import { YouTubeTab } from "./YouTubeTab";
import { UploadTab } from "./UploadTab";
import { useFileUpload } from "@/hooks/useFileUpload";
import { 
  CATEGORIES, 
  DEFAULT_VIDEO_DATA, 
  MAX_VIDEO_SIZE, 
  MAX_THUMBNAIL_SIZE,
  getCategoryLabel,
  formatFileSize,
  YOUTUBE_PATTERNS 
} from "../constants";

interface TrainingVideoFormDialogProps {
  open: boolean;
  video?: TrainingVideo | null;
  onClose: () => void;
  onSave: (videoData: TrainingVideoFormData) => Promise<void>;
  loading?: boolean;
}

const TrainingVideoFormDialog: React.FC<TrainingVideoFormDialogProps> = ({ 
  open, 
  video = null, 
  onClose, 
  onSave,
  loading = false 
}) => {
  const [formData, setFormData] = useState<TrainingVideoFormData>(DEFAULT_VIDEO_DATA);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeTab, setActiveTab] = useState<"youtube" | "upload">("upload");
  const [youtubePreview, setYoutubePreview] = useState<{
    valid: boolean;
    thumbnail?: string;
    youTubeId?: string;
  }>({ valid: false });
  
  // Separate states for file upload progress
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { uploadFile, uploading: fileUploading } = useFileUpload();

  useEffect(() => {
    if (open) {
      if (video) {
        setFormData({
          title: video.title || "",
          description: video.description || "",
          videoUrl: video.videoUrl || "",
          thumbnailUrl: video.thumbnailUrl || "",
          category: video.category || "",
          isYouTube: video.isYouTube || false,
          youTubeId: video.youTubeId || "",
          sourceType: video.sourceType || "upload"
        });
        
        // Set active tab based on video source
        setActiveTab(video.isYouTube ? "youtube" : "upload");
        
        // Set YouTube preview if it's a YouTube video
        if (video.isYouTube && video.youTubeId) {
          setYoutubePreview({
            valid: true,
            thumbnail: video.thumbnailUrl,
            youTubeId: video.youTubeId
          });
        }
      } else {
        setFormData(DEFAULT_VIDEO_DATA);
        setYoutubePreview({ valid: false });
        setActiveTab("upload");
      }
      setErrors({});
      setUploadingVideo(false);
      setUploadingThumbnail(false);
      setUploadProgress(0);
    }
  }, [open, video]);

  // Extract YouTube ID from URL
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

  // Validate YouTube URL
  const validateYouTubeUrl = (url: string): boolean => {
    if (!url) return false;
    
    for (const pattern of YOUTUBE_PATTERNS) {
      if (pattern.test(url)) {
        return true;
      }
    }
    return false;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: "youtube" | "upload") => {
    setActiveTab(newValue);
    
    // Clear video URL when switching tabs
    setFormData(prev => ({
      ...prev,
      videoUrl: "",
      thumbnailUrl: "",
      youTubeId: "",
      sourceType: newValue
    }));
    
    // Clear YouTube preview
    if (newValue === "upload") {
      setYoutubePreview({ valid: false });
    }
    
    // Clear errors
    setErrors(prev => ({ 
      ...prev, 
      videoUrl: "", 
      thumbnailUrl: "" 
    }));
  };

  const handleChange = (field: keyof TrainingVideoFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ): void => {
    const value = event.target.value;
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);

    // Auto-process YouTube URL
    if (field === "videoUrl" && activeTab === "youtube") {
      const url = value;
      const isValid = validateYouTubeUrl(url);
      
      if (isValid) {
        const youTubeId = extractYouTubeId(url);
        if (youTubeId) {
          // Auto-set thumbnail for YouTube
          const thumbnailUrl = `https://img.youtube.com/vi/${youTubeId}/maxresdefault.jpg`;
          setFormData(prev => ({
            ...prev,
            thumbnailUrl,
            youTubeId,
            isYouTube: true
          }));
          
          setYoutubePreview({
            valid: true,
            thumbnail: thumbnailUrl,
            youTubeId
          });
          
          // Clear YouTube URL error
          if (errors.videoUrl) {
            setErrors(prev => ({ ...prev, videoUrl: "" }));
          }
        }
      } else if (url) {
        setYoutubePreview({ valid: false });
        setErrors(prev => ({ 
          ...prev, 
          videoUrl: "Invalid YouTube URL format" 
        }));
      } else {
        setYoutubePreview({ valid: false });
        if (errors.videoUrl) {
          setErrors(prev => ({ ...prev, videoUrl: "" }));
        }
      }
    }

    // Clear errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateFileSize = (file: File, maxSize: number, fileType: string): boolean => {
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024);
      setErrors(prev => ({ 
        ...prev, 
        [fileType]: `File size must be less than ${maxSizeMB} MB` 
      }));
      return false;
    }
    return true;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    field: 'videoUrl' | 'thumbnailUrl',
    inputRef?: React.RefObject<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size based on field type
    if (field === 'videoUrl' && !validateFileSize(file, MAX_VIDEO_SIZE, 'videoUrl')) {
      if (inputRef?.current) inputRef.current.value = '';
      return;
    }
    
    if (field === 'thumbnailUrl' && !validateFileSize(file, MAX_THUMBNAIL_SIZE, 'thumbnailUrl')) {
      if (inputRef?.current) inputRef.current.value = '';
      return;
    }

    try {
      // Set uploading state based on field
      if (field === 'videoUrl') {
        setUploadingVideo(true);
        // Clear previous video URL
        setFormData(prev => ({ ...prev, videoUrl: '' }));
      } else {
        setUploadingThumbnail(true);
        // Clear previous thumbnail URL
        setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
      }
      
      // Clear any previous errors
      setErrors(prev => ({ ...prev, [field]: '' }));
      
      // Reset progress
      setUploadProgress(0);
      
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20; // Random increment for realistic progress
        if (progress > 90) progress = 90; // Cap at 90% until actual upload completes
        setUploadProgress(Math.min(progress, 90));
      }, 200);

      // Upload file
      const fileUrl = await uploadFile(file);
      
      // Complete progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Small delay to show 100% completion
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        [field]: fileUrl
      }));
      
      // Reset uploading states
      if (field === 'videoUrl') {
        setUploadingVideo(false);
      } else {
        setUploadingThumbnail(false);
      }
      
      setUploadProgress(0);
      
    } catch (err) {
      console.error('Upload error:', err);
      
      // Reset uploading states
      if (field === 'videoUrl') {
        setUploadingVideo(false);
      } else {
        setUploadingThumbnail(false);
      }
      
      setUploadProgress(0);
      
      // Reset file input
      if (inputRef?.current) inputRef.current.value = '';
      
      setErrors(prev => ({ 
        ...prev, 
        [field]: 'Failed to upload file. Please try again.' 
      }));
    }
  };

  // Handle removing video file
  const handleRemoveVideo = (): void => {
    setFormData(prev => ({ ...prev, videoUrl: '' }));
  };

  // Handle removing thumbnail
  const handleRemoveThumbnail = (): void => {
    setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.videoUrl.trim()) {
      newErrors.videoUrl = activeTab === "youtube" 
        ? "YouTube URL is required" 
        : "Video file is required";
    }

    if (activeTab === "youtube") {
      // Additional validation for YouTube URLs
      if (formData.videoUrl && !validateYouTubeUrl(formData.videoUrl)) {
        newErrors.videoUrl = "Invalid YouTube URL format";
      }
    } else {
      // For uploaded videos, thumbnail is required
      if (!formData.thumbnailUrl.trim()) {
        newErrors.thumbnailUrl = "Thumbnail image is required";
      }
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    // Check if files are still uploading
    if (uploadingVideo || uploadingThumbnail) {
      setErrors(prev => ({
        ...prev,
        form: "Please wait for files to finish uploading"
      }));
      return;
    }

    // Prepare final data with source type
    const finalData = {
      ...formData,
      sourceType: activeTab
    };

    await onSave(finalData);
  };

  const isUploading = uploadingVideo || uploadingThumbnail || fileUploading || loading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">
            {video ? "Edit Training Video" : "Add New Training Video"}
          </Typography>
          <Button onClick={onClose} disabled={isUploading} sx={{ minWidth: 'auto', p: 1 }}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Global Upload Progress Bar */}
        {(uploadingVideo || uploadingThumbnail) && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="primary">
                {uploadingVideo ? 'Uploading video...' : 'Uploading thumbnail...'}
              </Typography>
              <Typography variant="body2" color="primary">
                {Math.round(uploadProgress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Source Type Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="video source tabs"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 48,
              }
            }}
          >
            <Tab 
              value="upload" 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <CloudUpload fontSize="small" />
                  Upload Video File
                </Box>
              } 
              disabled={isUploading}
            />
            <Tab 
              value="youtube" 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <YouTube fontSize="small" />
                  YouTube URL
                </Box>
              } 
              disabled={isUploading}
            />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
              Basic Information
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Video Title *"
              value={formData.title}
              onChange={handleChange("title")}
              error={!!errors.title}
              helperText={errors.title}
              disabled={isUploading}
              placeholder="Enter video title"
            />
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.category} disabled={isUploading}>
              <InputLabel>Category *</InputLabel>
              <Select
                value={formData.category}
                label="Category *"
                onChange={handleChange("category")}
              >
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <FormHelperText>{errors.category}</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange("description")}
              helperText="Brief description of the video content"
              disabled={isUploading}
              placeholder="Enter video description (optional)"
            />
          </Grid>

          {/* Video Source Section */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Video Source
            </Typography>
          </Grid>

          {activeTab === "youtube" ? (
            /* YouTube URL Input */
            <Grid size={{ xs: 12 }}>
              <YouTubeTab
                formData={formData}
                errors={errors}
                onChange={handleChange}
                onFileUpload={handleFileUpload}
                uploadingThumbnail={uploadingThumbnail}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onRemoveThumbnail={handleRemoveThumbnail}
              />
            </Grid>
          ) : (
            /* File Upload Section */
            <Grid size={{ xs: 12 }}>
              <UploadTab
                formData={formData}
                errors={errors}
                onFileUpload={handleFileUpload}
                uploadingVideo={uploadingVideo}
                uploadingThumbnail={uploadingThumbnail}
                uploadProgress={uploadProgress}
                isUploading={isUploading}
                onRemoveVideo={handleRemoveVideo}
                onRemoveThumbnail={handleRemoveThumbnail}
              />
            </Grid>
          )}

          
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button 
          onClick={onClose} 
          disabled={isUploading}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isUploading}
          sx={{ minWidth: 100 }}
          startIcon={isUploading ? <CircularProgress size={20} /> : null}
        >
          {isUploading ? (
            "Processing..."
          ) : video ? (
            "Update Video"
          ) : (
            "Create Video"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TrainingVideoFormDialog;
