// app/dashboard/properties/components/PropertyFormDialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Box,
  Typography,
  Paper,
  Alert,
  FormControlLabel,
  Switch,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import { CloudUpload, Public } from "@mui/icons-material";
import { toast } from 'sonner';
import { Property } from '@/services/propertyService';
import { PropertyTypeSelector, AdditionalDetailsSection } from './index';

interface PropertyFormDialogProps {
  open: boolean;
  onClose: () => void;
  editingProperty: Property | null;
  onSubmit: (data: any) => Promise<void>;
  onFileUpload: (files: FileList, field: string) => Promise<void>;
  uploading: boolean;
  uploadProgress: { [key: string]: number };
  isFormValid: boolean;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  validationErrors: any;
}

const UploadProgress = ({ uploadProgress }: { uploadProgress: { [key: string]: number } }) => {
  if (Object.keys(uploadProgress).length === 0) return null;
  
  return (
    <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'primary.main', borderRadius: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Upload Progress:
      </Typography>
      {Object.entries(uploadProgress).map(([fileId, progress]) => (
        <Box key={fileId} sx={{ mb: 1 }}>
          <Typography variant="caption" display="block">
            {fileId.split('-')[1]} - {progress}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
      ))}
    </Box>
  );
};

const PropertyFormDialog: React.FC<PropertyFormDialogProps> = ({
  open,
  onClose,
  editingProperty,
  onSubmit,
  onFileUpload,
  uploading,
  uploadProgress,
  isFormValid,
  formData,
  setFormData,
  validationErrors,
}) => {
  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle sx={{ 
        backgroundColor: '#f5f5f5', 
        borderBottom: '1px solid #e0e0e0', 
        color: '#1976d2', 
        borderRadius: '15px 15px 0 0', 
        fontWeight: 600, 
        fontSize: '1.5rem' 
      }}>
        {editingProperty ? "Edit Property" : "Add New Properties"}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
              Basic Project Information
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Fields marked with <Typography component="span" color="error">*</Typography> are required
            </Typography>
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField 
              fullWidth 
              label="Project Name" 
              value={formData.projectName} 
              onChange={(e) => setFormData((prev: any) => ({ ...prev, projectName: e.target.value }))}
              required 
              error={!!validationErrors.projectName} 
              helperText={validationErrors.projectName} 
              sx={{ mb: 2 }} 
            />
          </Grid>
          
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField 
              fullWidth 
              label="Builder Name" 
              value={formData.builderName} 
              onChange={(e) => setFormData((prev: any) => ({ ...prev, builderName: e.target.value }))}
              required 
              error={!!validationErrors.builderName} 
              helperText={validationErrors.builderName} 
              sx={{ mb: 2 }} 
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select 
                multiple 
                value={formData.status} 
                onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))} 
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {["Ready to Move", "Under Construction", "New Launch", "Pre Launch", "Sold Out", "Coming Soon"].map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField 
              fullWidth 
              label="Payment Plan" 
              value={formData.paymentPlan} 
              onChange={(e) => setFormData((prev: any) => ({ ...prev, paymentPlan: e.target.value }))}
              required 
              error={!!validationErrors.paymentPlan} 
              helperText={validationErrors.paymentPlan} 
              sx={{ mb: 2 }} 
            />
          </Grid>

          <Grid size={{ xs: 12}}>
            <TextField 
              fullWidth 
              label="Description" 
              value={formData.description} 
              onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} 
              multiline 
              rows={3}
              sx={{ mb: 2 }} 
            />
          </Grid>

          <Grid size={{ xs: 12}}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Project Highlights</InputLabel>
              <Select 
                multiple 
                value={formData.projectHighlights} 
                onChange={(e) => setFormData((prev: any) => ({ ...prev, projectHighlights: e.target.value }))} 
                input={<OutlinedInput label="Project Highlights" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {["Gated Community", "Eco-Friendly", "Luxury Living", "Affordable Housing", "Smart Home Features", "Waterfront Property", "High-Rise Building", "Low-Rise Building", "Vastu Compliant"].map(highlight => (
                  <MenuItem key={highlight} value={highlight}>{highlight}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Public & Featured Controls */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '15px', backgroundColor: '#f8f9fa' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Public />
                Visibility Settings
              </Typography>
              
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isPublic}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, isPublic: e.target.checked }))}
                        color="primary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Make Public
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Show this property on public website
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
                
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData((prev: any) => ({ ...prev, isFeatured: e.target.checked }))}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          Featured Property
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Highlight this property as featured
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Public:</strong> Property will be visible on your public website.<br />
                  <strong>Featured:</strong> Property will be highlighted as a featured listing.
                </Typography>
              </Alert>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <PropertyTypeSelector formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <AdditionalDetailsSection formData={formData} setFormData={setFormData} validationErrors={validationErrors} />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '15px' }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Project Media Uploads
              </Typography>

              {/* Upload Progress */}
              <UploadProgress uploadProgress={uploadProgress} />

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <input
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    id="project-images"
                    type="file"
                    multiple
                    onChange={async (e) => {
                      if (e.target.files) {
                        await onFileUpload(e.target.files, 'images');
                      }
                    }}
                    disabled={uploading}
                  />
                  <label htmlFor="project-images">
                    <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Project Images & Files'}
                    </Button>
                  </label>
                  
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.images.map((img: any, imgIndex: number) => (
                      <Chip
                        key={imgIndex}
                        label={img.title}
                        onDelete={() => {
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            images: prev.images.filter((_: any, i: number) => i !== imgIndex) 
                          }));
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <input
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                    style={{ display: 'none' }}
                    id="brochure-upload"
                    type="file"
                    multiple
                    onChange={async (e) => {
                      if (e.target.files) {
                        await onFileUpload(e.target.files, 'brochureUrls');
                      }
                    }}
                    disabled={uploading}
                  />
                  <label htmlFor="brochure-upload">
                    <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Brochures & Documents'}
                    </Button>
                  </label>
                  
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.brochureUrls.map((brochure: any, brochureIndex: number) => (
                      <Chip
                        key={brochureIndex}
                        label={brochure.title}
                        onDelete={() => {
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            brochureUrls: prev.brochureUrls.filter((_: any, i: number) => i !== brochureIndex) 
                          }));
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <input
                    accept="image/*,video/*,.mp4,.mov,.avi"
                    style={{ display: 'none' }}
                    id="creatives-upload"
                    type="file"
                    multiple
                    onChange={async (e) => {
                      if (e.target.files) {
                        await onFileUpload(e.target.files, 'creatives');
                      }
                    }}
                    disabled={uploading}
                  />
                  <label htmlFor="creatives-upload">
                    <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Creatives (Images/Videos)'}
                    </Button>
                  </label>
                  
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.creatives.map((creative: any, creativeIndex: number) => (
                      <Chip
                        key={creativeIndex}
                        label={creative.title}
                        onDelete={() => {
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            creatives: prev.creatives.filter((_: any, i: number) => i !== creativeIndex) 
                          }));
                        }}
                      />
                    ))}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <input
                    accept="video/*,.mp4,.mov,.avi,.mkv"
                    style={{ display: 'none' }}
                    id="videos-upload"
                    type="file"
                    multiple
                    onChange={async (e) => {
                      if (e.target.files) {
                        await onFileUpload(e.target.files, 'videos');
                      }
                    }}
                    disabled={uploading}
                  />
                  <label htmlFor="videos-upload">
                    <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth disabled={uploading}>
                      {uploading ? 'Uploading...' : 'Upload Videos'}
                    </Button>
                  </label>
                  
                  <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {formData.videos.map((video: any, videoIndex: number) => (
                      <Chip
                        key={videoIndex}
                        label={video.title}
                        onDelete={() => {
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            videos: prev.videos.filter((_: any, i: number) => i !== videoIndex) 
                          }));
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0', borderRadius: '0 0 15px 15px' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Tooltip title={!isFormValid ? "Please fill all required fields" : "All required fields are filled"} arrow placement="top">
          <span>
            <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid || uploading}>
              {uploading ? 'Uploading...' : editingProperty ? "Update Property" : "Create Properties"}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
};

export default PropertyFormDialog;
