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
} from "@mui/material";
import { Close, CloudUpload } from "@mui/icons-material";
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
  category: ""
};

const TrainingVideoFormDialog: React.FC<TrainingVideoFormDialogProps> = ({ 
  open, 
  video = null, 
  onClose, 
  onSave,
  loading = false 
}) => {
  const [formData, setFormData] = useState<TrainingVideoFormData>(DEFAULT_VIDEO_DATA);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { uploadFile, uploading: fileUploading } = useFileUpload();

  useEffect(() => {
    if (open) {
      if (video) {
        setFormData({
          title: video.title || "",
          description: video.description || "",
          videoUrl: video.videoUrl || "",
          thumbnailUrl: video.thumbnailUrl || "",
          category: video.category || ""
        });
      } else {
        setFormData(DEFAULT_VIDEO_DATA);
      }
      setErrors({});
    }
  }, [open, video]);

  const handleChange = (field: keyof TrainingVideoFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent
  ): void => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>, 
    field: 'videoUrl' | 'thumbnailUrl'
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      newErrors.videoUrl = "Video file is required";
    }

    if (!formData.thumbnailUrl.trim()) {
      newErrors.thumbnailUrl = "Thumbnail image is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) return;

    await onSave(formData);
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
            />
          </Grid>

          {/* File Uploads */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Media Files
            </Typography>
          </Grid>

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
                sx={{ height: '56px' }}
              >
                {formData.videoUrl ? "Change Video" : "Upload Video"}
                <input
                  type="file"
                  hidden
                  accept="video/*"
                  onChange={(e) => handleFileUpload(e, 'videoUrl')}
                />
              </Button>
              {formData.videoUrl && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ Video uploaded successfully
                </Typography>
              )}
              {errors.videoUrl && (
                <FormHelperText error>{errors.videoUrl}</FormHelperText>
              )}
              <FormHelperText>
                Upload MP4, MOV, or other video formats
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
                sx={{ height: '56px' }}
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
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  ✓ Thumbnail uploaded successfully
                </Typography>
              )}
              {errors.thumbnailUrl && (
                <FormHelperText error>{errors.thumbnailUrl}</FormHelperText>
              )}
              <FormHelperText>
                Upload JPG, PNG, or other image formats
              </FormHelperText>
            </Box>
          </Grid>

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