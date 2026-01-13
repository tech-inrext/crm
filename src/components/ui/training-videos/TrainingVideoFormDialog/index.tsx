// components/ui/training-videos/TrainingVideoFormDialog/index.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, Grid, Typography } from "@mui/material";
import { TrainingVideo, TrainingVideoFormData } from "@/types/trainingVideo";
import { YouTubeTab } from "./YouTubeTab";
import { UploadTab } from "./UploadTab";
import { BasicInfoSection } from "./BasicInfoSection";
import { Header } from "./Header";
import { ProgressBar } from "./ProgressBar";
import { TabNavigation } from "./TabNavigation";
import { FormActions } from "./FormActions";
import { useFileUpload } from "@/hooks/useFileUpload";
import { 
  DEFAULT_VIDEO_DATA, 
  MAX_VIDEO_SIZE, 
  MAX_THUMBNAIL_SIZE 
} from "./constants";
import { 
  extractYouTubeId, 
  validateYouTubeUrl, 
  validateForm, 
  validateFileSize 
} from "./utils";
import { YouTubePreview } from "./types";

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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"youtube" | "upload">("upload");
  const [youtubePreview, setYoutubePreview] = useState<YouTubePreview>({ valid: false });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { uploadFile, uploading: fileUploading } = useFileUpload();
  const isUploading = uploadingVideo || uploadingThumbnail || fileUploading || loading;

  // Initialize form data
  useEffect(() => {
    if (!open) return;

    if (video) {
      const newFormData = {
        title: video.title || "",
        description: video.description || "",
        videoUrl: video.videoUrl || "",
        thumbnailUrl: video.thumbnailUrl || "",
        category: video.category || "",
        isYouTube: video.isYouTube || false,
        youTubeId: video.youTubeId || "",
        sourceType: video.sourceType || "upload"
      };
      
      setFormData(newFormData);
      setActiveTab(video.isYouTube ? "youtube" : "upload");
      
      if (video.isYouTube && video.youTubeId) {
        setYoutubePreview({
          valid: true,
          thumbnail: video.thumbnailUrl,
          youTubeId: video.youTubeId
        });
      }
    } else {
      resetForm();
    }
  }, [open, video]);

  const resetForm = useCallback(() => {
    setFormData(DEFAULT_VIDEO_DATA);
    setYoutubePreview({ valid: false });
    setActiveTab("upload");
    setErrors({});
    setUploadingVideo(false);
    setUploadingThumbnail(false);
    setUploadProgress(0);
  }, []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: "youtube" | "upload") => {
    setActiveTab(newValue);
    setFormData(prev => ({
      ...prev,
      videoUrl: "",
      thumbnailUrl: "",
      youTubeId: "",
      sourceType: newValue
    }));
    
    if (newValue === "upload") {
      setYoutubePreview({ valid: false });
    }
    
    setErrors(prev => ({ ...prev, videoUrl: "", thumbnailUrl: "" }));
  };

  const handleChange = useCallback((field: keyof TrainingVideoFormData) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
  ) => {
    const value = event.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));

    if (field === "videoUrl" && activeTab === "youtube") {
      handleYouTubeUrlChange(value);
    }

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [activeTab, errors]);

  const handleYouTubeUrlChange = useCallback((url: string) => {
    const isValid = validateYouTubeUrl(url);
    
    if (isValid) {
      const youTubeId = extractYouTubeId(url);
      if (youTubeId) {
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
  }, [errors.videoUrl]);

  const handleFileUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>, 
    field: 'videoUrl' | 'thumbnailUrl',
    inputRef?: React.RefObject<HTMLInputElement>
  ): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = field === 'videoUrl' ? MAX_VIDEO_SIZE : MAX_THUMBNAIL_SIZE;
    const validation = validateFileSize(file, maxSize, field);
    
    if (!validation.isValid) {
      validation.error && setErrors(prev => ({ ...prev, [field]: validation.error! }));
      inputRef?.current && (inputRef.current.value = '');
      return;
    }

    try {
      startUpload(field);
      const fileUrl = await performUpload(file, field);
      completeUpload(field, fileUrl);
    } catch (error) {
      handleUploadError(error, field, inputRef);
    }
  }, []);

  const startUpload = useCallback((field: 'videoUrl' | 'thumbnailUrl') => {
    if (field === 'videoUrl') {
      setUploadingVideo(true);
      setFormData(prev => ({ ...prev, videoUrl: '' }));
    } else {
      setUploadingThumbnail(true);
      setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
    }
    
    setErrors(prev => ({ ...prev, [field]: '' }));
    setUploadProgress(0);
  }, []);

  const performUpload = useCallback(async (file: File, field: 'videoUrl' | 'thumbnailUrl'): Promise<string> => {
    // Simulate upload progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.random() * 20;
      if (progress > 90) progress = 90;
      setUploadProgress(Math.min(progress, 90));
    }, 200);

    const fileUrl = await uploadFile(file);
    
    clearInterval(progressInterval);
    setUploadProgress(100);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return fileUrl;
  }, [uploadFile]);

  const completeUpload = useCallback((field: 'videoUrl' | 'thumbnailUrl', fileUrl: string) => {
    setFormData(prev => ({ ...prev, [field]: fileUrl }));
    
    if (field === 'videoUrl') {
      setUploadingVideo(false);
    } else {
      setUploadingThumbnail(false);
    }
    
    setUploadProgress(0);
  }, []);

  const handleUploadError = useCallback((
    error: any, 
    field: 'videoUrl' | 'thumbnailUrl',
    inputRef?: React.RefObject<HTMLInputElement>
  ) => {
    console.error('Upload error:', error);
    
    if (field === 'videoUrl') {
      setUploadingVideo(false);
    } else {
      setUploadingThumbnail(false);
    }
    
    setUploadProgress(0);
    inputRef?.current && (inputRef.current.value = '');
    
    setErrors(prev => ({ 
      ...prev, 
      [field]: 'Failed to upload file. Please try again.' 
    }));
  }, []);

  const handleRemoveVideo = useCallback((): void => {
    setFormData(prev => ({ ...prev, videoUrl: '' }));
  }, []);

  const handleRemoveThumbnail = useCallback((): void => {
    setFormData(prev => ({ ...prev, thumbnailUrl: '' }));
  }, []);

  const handleSubmit = useCallback(async (): Promise<void> => {
    const formErrors = validateForm(formData, activeTab);
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) return;

    if (uploadingVideo || uploadingThumbnail) {
      setErrors(prev => ({
        ...prev,
        form: "Please wait for files to finish uploading"
      }));
      return;
    }

    const finalData = { ...formData, sourceType: activeTab };
    await onSave(finalData);
  }, [formData, activeTab, uploadingVideo, uploadingThumbnail, onSave]);

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <Header 
        title={video ? "Edit Training Video" : "Add New Training Video"}
        onClose={onClose}
        isUploading={isUploading}
      />

      <DialogContent dividers>
        <ProgressBar 
          uploadingVideo={uploadingVideo}
          uploadingThumbnail={uploadingThumbnail}
          uploadProgress={uploadProgress}
        />

        <TabNavigation 
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isUploading={isUploading}
        />

        <Grid container spacing={3}>
          <BasicInfoSection
            formData={formData}
            errors={errors}
            onChange={handleChange}
            isUploading={isUploading}
          />

          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ color: "primary.main", mt: 2 }}>
              Video Source
            </Typography>
          </Grid>

          {activeTab === "youtube" ? (
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

      <FormActions 
        isUploading={isUploading}
        isEditing={!!video}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </Dialog>
  );
};

export default TrainingVideoFormDialog;