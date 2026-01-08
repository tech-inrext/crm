/* eslint-disable react/no-unescaped-entities */
// components/ui/TrainingVideoFormDialog.tsx
import React, { useState, useEffect } from "react";
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
  Card,
  CardMedia,
  IconButton,
} from "@mui/material";
import { 
  Close, 
  CloudUpload, 
  YouTube,
  CheckCircle,
  Error as ErrorIcon 
} from "@mui/icons-material";
import { TrainingVideo, TrainingVideoFormData } from "@/types/trainingVideo";
import { useFileUpload } from "@/hooks/useFileUpload";

interface TrainingVideoFormDialogProps {
  open: boolean;
  video?: TrainingVideo | null;
  onClose: () => void;
  onSave: (videoData: TrainingVideoFormData) => Promise<void>;
  loading?: boolean;
}

const CATEGORIES = [
  "basic-sales-training-fundamentals",
  "team-building",
  "growth-model",
  "basic-fundamentals-of-real-estate",
  "company-code-of-conduct-rules-compliances"
];

const DEFAULT_VIDEO_DATA: TrainingVideoFormData = {
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  category: "",
  sourceType: "upload"
};

// File size constants
const MAX_VIDEO_SIZE = 150 * 1024 * 1024; // 150 MB
const MAX_THUMBNAIL_SIZE = 1 * 1024 * 1024; // 1 MB

// YouTube URL patterns for validation
const YOUTUBE_PATTERNS = [
  /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtu\.be\/[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/v\/[a-zA-Z0-9_-]+/,
  /^(https?:\/\/)?(www\.)?youtube\.com\/shorts\/[a-zA-Z0-9_-]+/
];

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
    field: 'videoUrl' | 'thumbnailUrl'
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size based on field type
    if (field === 'videoUrl' && !validateFileSize(file, MAX_VIDEO_SIZE, 'videoUrl')) {
      return;
    }
    
    if (field === 'thumbnailUrl' && !validateFileSize(file, MAX_THUMBNAIL_SIZE, 'thumbnailUrl')) {
      return;
    }

    try {
      const fileUrl = await uploadFile(file);
      setFormData(prev => ({
        ...prev,
        [field]: fileUrl
      }));
      
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: "" }));
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [field]: 'Failed to upload file' }));
    }
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

    // Prepare final data with source type
    const finalData = {
      ...formData,
      sourceType: activeTab
    };

    await onSave(finalData);
  };

  const getCategoryLabel = (category: string): string => {
    const categoryLabels: { [key: string]: string } = {
      "basic-sales-training-fundamentals": "Basic Sales Training Fundamentals",
      "team-building": "Team Building",
      "growth-model": "Growth Model",
      "basic-fundamentals-of-real-estate": "Basic Fundamentals of Real Estate",
      "company-code-of-conduct-rules-compliances": "Company Code of Conduct, Rules & Compliances (RERA)"
    };
    return categoryLabels[category] || category;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isUploading = fileUploading || loading;

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
          <Button onClick={onClose} disabled={isUploading}>
            <Close />
          </Button>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
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
            />
            <Tab 
              value="youtube" 
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <YouTube fontSize="small" />
                  YouTube URL
                </Box>
              } 
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

          <Grid size={{ xs: 12 }}>
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
              <Box>
                <TextField
                  fullWidth
                  label="YouTube Video URL *"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.videoUrl}
                  onChange={handleChange("videoUrl")}
                  error={!!errors.videoUrl}
                  helperText={errors.videoUrl || "Paste YouTube video link"}
                  disabled={isUploading}
                  InputProps={{
                    startAdornment: <YouTube sx={{ color: 'error.main', mr: 1 }} />,
                  }}
                />
                
                {/* YouTube Preview */}
                {youtubePreview.valid && youtubePreview.youTubeId && (
                  <Card sx={{ mt: 2, border: '1px solid #e0e0e0' }}>
                    <Box sx={{ display: 'flex', p: 2 }}>
                      <CardMedia
                        component="img"
                        sx={{ width: 120, height: 68, borderRadius: 1, mr: 2 }}
                        image={youtubePreview.thumbnail}
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
                          Video ID: {youtubePreview.youTubeId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Using YouTube's default thumbnail. You can upload a custom thumbnail below.
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                )}
                
                {formData.videoUrl && !youtubePreview.valid && (
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
                    startIcon={<CloudUpload />}
                    disabled={isUploading}
                    sx={{ mb: 1 }}
                  >
                    {formData.thumbnailUrl && formData.thumbnailUrl !== youtubePreview.thumbnail 
                      ? "Change Custom Thumbnail" 
                      : "Upload Custom Thumbnail"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                    />
                  </Button>
                  {formData.thumbnailUrl && formData.thumbnailUrl !== youtubePreview.thumbnail && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
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
                      <Typography variant="caption" color="success.main">
                        Custom thumbnail uploaded
                      </Typography>
                    </Box>
                  )}
                  <FormHelperText>
                    Upload a custom thumbnail image (JPG, PNG, etc. Max: {formatFileSize(MAX_THUMBNAIL_SIZE)})
                  </FormHelperText>
                </Box>
              </Box>
            </Grid>
          ) : (
            /* File Upload Section */
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Video File *
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    disabled={isUploading}
                    fullWidth
                    sx={{ height: '56px', mb: 1 }}
                  >
                    {formData.videoUrl ? "Change Video File" : "Upload Video File"}
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'videoUrl')}
                    />
                  </Button>
                  {formData.videoUrl && (
                    <Typography variant="caption" color="success.main" sx={{ display: 'block', mb: 1 }}>
                      ✓ Video file uploaded successfully
                    </Typography>
                  )}
                  {errors.videoUrl && (
                    <FormHelperText error>{errors.videoUrl}</FormHelperText>
                  )}
                  <FormHelperText>
                    Upload MP4, MOV, AVI, or other video formats (Max: {formatFileSize(MAX_VIDEO_SIZE)})
                  </FormHelperText>
                </Box>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Thumbnail Image *
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    disabled={isUploading}
                    fullWidth
                    sx={{ height: '56px', mb: 1 }}
                  >
                    {formData.thumbnailUrl ? "Change Thumbnail" : "Upload Thumbnail"}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'thumbnailUrl')}
                    />
                  </Button>
                  {formData.thumbnailUrl && (
                    <>
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
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
                        <Typography variant="caption" color="success.main">
                          ✓ Thumbnail uploaded successfully
                        </Typography>
                      </Box>
                    </>
                  )}
                  {errors.thumbnailUrl && (
                    <FormHelperText error>{errors.thumbnailUrl}</FormHelperText>
                  )}
                  <FormHelperText>
                    Upload JPG, PNG, or other image formats (Max: {formatFileSize(MAX_THUMBNAIL_SIZE)})
                  </FormHelperText>
                </Box>
              </Grid>
            </>
          )}

          {/* Category */}
          <Grid size={{ xs: 12 }}>
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
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isUploading}
          sx={{ minWidth: 100 }}
        >
          {isUploading ? (
            <CircularProgress size={24} />
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
