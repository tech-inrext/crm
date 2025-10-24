// app/dashboard/properties/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  MenuItem,
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Tooltip,
  FormHelperText,
  Alert,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Divider,
  Badge,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Search,
  CloudUpload,
  FilterList,
  Clear,
  Home,
  Business,
  Landscape,
  LocationOn,
  ExpandMore,
  ExpandLess,
  Visibility,
  CurrencyRupee,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description,
  Info,
  PlayArrow,
  CloudDownload,
  StarBorder,
  Close,
  Download,
  CheckCircle,
  Star,
  Fence,
  Grass,
  AccountBalance,
  SquareFoot,
  Bathtub,
  Apartment,
  Straighten,
  Payment,
  Category,
  Label,
  PhotoCamera,
  Bed,
  AreaChart,
  ArrowBackIos,
  ArrowForwardIos,
  Pause,
  Fullscreen,
} from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Toaster, toast } from 'sonner';
import { propertyService, type Property } from '@/services/propertyService';
import LeafletMap from "./LeafletMap";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// File upload service
const uploadService = {
  uploadFile: async (file: File): Promise<{ success: boolean; data?: { url: string; fileName: string }; message?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve({ success: true, data: { url: base64, fileName: file.name } });
      };
      reader.onerror = () => resolve({ success: false, message: 'Failed to read file' });
      reader.readAsDataURL(file);
    });
  },
};

// Property Property Forms
const ResidentialForm = ({ formData, setFormData, validationErrors, index }: any) => {
  const [uploading, setUploading] = useState<string | null>(null);

  const mapFloorPlanType = (fileType: string) => {
    if (!fileType) return '2d';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('image')) return 'image';
    return '2d';
  };

  const handleFileUpload = async (files: FileList, type: 'propertyImages' | 'floorPlans') => {
    setUploading(type);
    try {
      const fileArray = Array.from(files);
      const uploadedFiles = [];

      for (const file of fileArray) {
        const uploadResponse = await uploadService.uploadFile(file);
        if (uploadResponse.success && uploadResponse.data) {
          const newFile = {
            url: uploadResponse.data.url,
            title: file.name.replace(/\.[^/.]+$/, ""),
            description: "",
            isPrimary: false,
            uploadedAt: new Date().toISOString(),
            ...(type === 'floorPlans' && { 
              type: mapFloorPlanType(file.type)
            })
          };
          uploadedFiles.push(newFile);
        }
      }

      const newResidential = [...(formData.residentialProperties || [])];
      if (!newResidential[index]) newResidential[index] = {};
      
      if (type === 'propertyImages') {
        newResidential[index].propertyImages = [
          ...(newResidential[index].propertyImages || []),
          ...uploadedFiles
        ];
      } else {
        newResidential[index].floorPlans = [
          ...(newResidential[index].floorPlans || []),
          ...uploadedFiles
        ];
      }

      setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
      
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (type: 'propertyImages' | 'floorPlans', fileIndex: number) => {
    const newResidential = [...(formData.residentialProperties || [])];
    if (!newResidential[index]) return;

    if (type === 'propertyImages') {
      newResidential[index].propertyImages = newResidential[index].propertyImages?.filter((_: any, i: number) => i !== fileIndex) || [];
    } else {
      newResidential[index].floorPlans = newResidential[index].floorPlans?.filter((_: any, i: number) => i !== fileIndex) || [];
    }

    setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
    toast.success('File removed successfully');
  };

  const setPrimaryImage = (fileIndex: number) => {
    const newResidential = [...(formData.residentialProperties || [])];
    if (!newResidential[index]?.propertyImages) return;

    newResidential[index].propertyImages = newResidential[index].propertyImages.map((img: any, i: number) => ({
      ...img,
      isPrimary: i === fileIndex
    }));

    setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
    toast.success('Primary image updated');
  };

  const currentProperty = formData.residentialProperties?.[index] || {};

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <Home sx={{ mr: 1 }} />
          Residential Property #{index + 1}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Property Name" value={currentProperty.propertyName || ''}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].propertyName = e.target.value;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
  <TextField 
    fullWidth 
    label="Price" 
    value={currentProperty.price || ''}
    onChange={(e) => {
      const newResidential = [...(formData.residentialProperties || [])];
      if (!newResidential[index]) newResidential[index] = {};
      newResidential[index].price = e.target.value;
      setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
    }}
    placeholder="Leave empty to inherit from main project"
    helperText={formData.parentId ? "Leave empty to automatically use main project price" : "Enter price for this residential property"}
  />
</Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Property Description" value={currentProperty.propertyDescription || ''}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].propertyDescription = e.target.value;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
          multiline rows={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField fullWidth label="Bedrooms" type="number" value={currentProperty.bedrooms || 0}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].bedrooms = parseInt(e.target.value) || 0;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField fullWidth label="Bathrooms" type="number" value={currentProperty.bathrooms || 0}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].bathrooms = parseInt(e.target.value) || 0;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField fullWidth label="Toilets" type="number" value={currentProperty.toilet || 0}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].toilet = parseInt(e.target.value) || 0;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField fullWidth label="Balcony" type="number" value={currentProperty.balcony || 0}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].balcony = parseInt(e.target.value) || 0;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Carpet Area" value={currentProperty.carpetArea || ''}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].carpetArea = e.target.value;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Built-up Area" value={currentProperty.builtUpArea || ''}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].builtUpArea = e.target.value;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Minimum Size" value={currentProperty.minSize || ''}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].minSize = e.target.value;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Maximum Size" value={currentProperty.maxSize || ''}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].maxSize = e.target.value;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Size Unit" value={currentProperty.sizeUnit || 'sq.ft.'}
          onChange={(e) => {
            const newResidential = [...(formData.residentialProperties || [])];
            if (!newResidential[index]) newResidential[index] = {};
            newResidential[index].sizeUnit = e.target.value;
            setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Amenities</InputLabel>
          <Select
            multiple
            value={currentProperty.amenities || []}
            onChange={(e) => {
              const newResidential = [...(formData.residentialProperties || [])];
              if (!newResidential[index]) newResidential[index] = {};
              newResidential[index].amenities = e.target.value as string[];
              setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
            }}
            input={<OutlinedInput label="Amenities" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {[
              "Swimming Pool", "Gym", "Park", "Club House", "Security", "Power Backup",
              "Water Supply", "Car Parking", "Lift", "Play Area", "Garden", "Shopping Center"
            ].map(amenity => (
              <MenuItem key={amenity} value={amenity}>
                {amenity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
            <CloudUpload sx={{ mr: 1 }} />
            Property Images
            {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
              <Chip 
                label={`${currentProperty.propertyImages.length} uploaded`} 
                size="small" 
                color="primary" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={`residential-images-${index}`}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'propertyImages')}
            disabled={uploading === 'propertyImages'}
          />
          <label htmlFor={`residential-images-${index}`}>
            <Button 
              variant="contained" 
              component="span" 
              startIcon={uploading === 'propertyImages' ? <CircularProgress size={20} /> : <CloudUpload />}
              fullWidth
              disabled={uploading === 'propertyImages'}
              sx={{ mb: 2 }}
            >
              {uploading === 'propertyImages' ? 'Uploading Images...' : 'Upload Property Images'}
            </Button>
          </label>
          
          {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Images
              </Typography>
              <Grid container spacing={2}>
                {currentProperty.propertyImages.map((image: any, imgIndex: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={imgIndex}>
                    <Card 
                      sx={{ 
                        position: 'relative',
                        border: image.isPrimary ? '2px solid #1976d2' : '1px solid #e0e0e0',
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            height: 120,
                            backgroundImage: `url(${image.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 1,
                            position: 'relative',
                            mb: 1
                          }}
                        >
                          {image.isPrimary && (
                            <Chip 
                              label="Primary" 
                              size="small" 
                              color="primary" 
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                left: 8,
                              }} 
                            />
                          )}
                          
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            display: 'flex',
                            gap: 0.5
                          }}>
                            {!image.isPrimary && (
                              <Tooltip title="Set as primary image">
                                <IconButton
                                  size="small"
                                  onClick={() => setPrimaryImage(imgIndex)}
                                  sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                  }}
                                >
                                  <StarBorder sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Remove image">
                              <IconButton
                                size="small"
                                onClick={() => removeFile('propertyImages', imgIndex)}
                                sx={{ 
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                }}
                              >
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {image.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main' }}>
            <Description sx={{ mr: 1 }} />
            Floor Plans
            {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
              <Chip 
                label={`${currentProperty.floorPlans.length} uploaded`} 
                size="small" 
                color="secondary" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <input
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            id={`residential-floorplans-${index}`}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'floorPlans')}
            disabled={uploading === 'floorPlans'}
          />
          <label htmlFor={`residential-floorplans-${index}`}>
            <Button 
              variant="contained" 
              component="span" 
              color="secondary"
              startIcon={uploading === 'floorPlans' ? <CircularProgress size={20} /> : <CloudUpload />}
              fullWidth
              disabled={uploading === 'floorPlans'}
              sx={{ mb: 2 }}
            >
              {uploading === 'floorPlans' ? 'Uploading Floor Plans...' : 'Upload Floor Plans'}
            </Button>
          </label>
          
          {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Floor Plans
              </Typography>
              <Grid container spacing={2}>
                {currentProperty.floorPlans.map((plan: any, planIndex: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={planIndex}>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            height: 120,
                            backgroundColor: 'grey.50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            position: 'relative',
                            mb: 1,
                            border: '1px dashed #e0e0e0'
                          }}
                        >
                          {plan.type?.includes('image') ? (
                            <img 
                              src={plan.url} 
                              alt={plan.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
                              }} 
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <Description sx={{ fontSize: 48, color: 'secondary.main', mb: 1 }} />
                              <Typography variant="caption" display="block">
                                PDF Document
                              </Typography>
                            </Box>
                          )}
                          
                          <Tooltip title="Remove floor plan">
                            <IconButton
                              size="small"
                              onClick={() => removeFile('floorPlans', planIndex)}
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(255,255,255,0.95)',
                              }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {plan.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

// Commercial Property Form
const CommercialForm = ({ formData, setFormData, validationErrors, index }: any) => {
  const [uploading, setUploading] = useState<string | null>(null);

  const mapFloorPlanType = (fileType: string) => {
    if (!fileType) return '2d';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('image')) return 'image';
    return '2d';
  };

  const handleFileUpload = async (files: FileList, type: 'propertyImages' | 'floorPlans') => {
    setUploading(type);
    try {
      const fileArray = Array.from(files);
      const uploadedFiles = [];

      for (const file of fileArray) {
        const uploadResponse = await uploadService.uploadFile(file);
        if (uploadResponse.success && uploadResponse.data) {
          const newFile = {
            url: uploadResponse.data.url,
            title: file.name.replace(/\.[^/.]+$/, ""),
            description: "",
            isPrimary: false,
            uploadedAt: new Date().toISOString(),
            ...(type === 'floorPlans' && { 
              type: mapFloorPlanType(file.type)
            })
          };
          uploadedFiles.push(newFile);
        }
      }

      const newCommercial = [...(formData.commercialProperties || [])];
      if (!newCommercial[index]) newCommercial[index] = {};
      
      if (type === 'propertyImages') {
        newCommercial[index].propertyImages = [
          ...(newCommercial[index].propertyImages || []),
          ...uploadedFiles
        ];
      } else {
        newCommercial[index].floorPlans = [
          ...(newCommercial[index].floorPlans || []),
          ...uploadedFiles
        ];
      }

      setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
      
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (type: 'propertyImages' | 'floorPlans', fileIndex: number) => {
    const newCommercial = [...(formData.commercialProperties || [])];
    if (!newCommercial[index]) return;

    if (type === 'propertyImages') {
      newCommercial[index].propertyImages = newCommercial[index].propertyImages?.filter((_: any, i: number) => i !== fileIndex) || [];
    } else {
      newCommercial[index].floorPlans = newCommercial[index].floorPlans?.filter((_: any, i: number) => i !== fileIndex) || [];
    }

    setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
    toast.success('File removed successfully');
  };

  const setPrimaryImage = (fileIndex: number) => {
    const newCommercial = [...(formData.commercialProperties || [])];
    if (!newCommercial[index]?.propertyImages) return;

    newCommercial[index].propertyImages = newCommercial[index].propertyImages.map((img: any, i: number) => ({
      ...img,
      isPrimary: i === fileIndex
    }));

    setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
    toast.success('Primary image updated');
  };

  const currentProperty = formData.commercialProperties?.[index] || {};

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', display: 'flex', alignItems: 'center' }}>
          <Business sx={{ mr: 1 }} />
          Commercial Property #{index + 1}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Property Name" value={currentProperty.propertyName || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].propertyName = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
  <TextField 
    fullWidth 
    label="Price" 
    value={currentProperty.price || ''}
    onChange={(e) => {
      const newCommercial = [...(formData.commercialProperties || [])];
      if (!newCommercial[index]) newCommercial[index] = {};
      newCommercial[index].price = e.target.value;
      setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
    }}
    placeholder="Leave empty to inherit from main project"
    helperText={formData.parentId ? "Leave empty to automatically use main project price" : "Enter price for this commercial property"}
  />
</Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Property Description" value={currentProperty.propertyDescription || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].propertyDescription = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
          multiline rows={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Carpet Area" value={currentProperty.carpetArea || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].carpetArea = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Built-up Area" value={currentProperty.builtUpArea || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].builtUpArea = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Minimum Size" value={currentProperty.minSize || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].minSize = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Maximum Size" value={currentProperty.maxSize || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].maxSize = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Size Unit" value={currentProperty.sizeUnit || 'sq.ft.'}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].sizeUnit = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Amenities</InputLabel>
          <Select
            multiple
            value={currentProperty.amenities || []}
            onChange={(e) => {
              const newCommercial = [...(formData.commercialProperties || [])];
              if (!newCommercial[index]) newCommercial[index] = {};
              newCommercial[index].amenities = e.target.value as string[];
              setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
            }}
            input={<OutlinedInput label="Amenities" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {[
              "Parking", "Security", "Power Backup", "Lift", "Fire Safety", "Conference Room",
              "Reception", "Pantry", "Internet", "AC", "Modular Kitchen", "Restrooms"
            ].map(amenity => (
              <MenuItem key={amenity} value={amenity}>
                {amenity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
            <CloudUpload sx={{ mr: 1 }} />
            Commercial Property Images
            {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
              <Chip 
                label={`${currentProperty.propertyImages.length} uploaded`} 
                size="small" 
                color="warning" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={`commercial-images-${index}`}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'propertyImages')}
            disabled={uploading === 'propertyImages'}
          />
          <label htmlFor={`commercial-images-${index}`}>
            <Button 
              variant="contained" 
              component="span" 
              color="warning"
              startIcon={uploading === 'propertyImages' ? <CircularProgress size={20} /> : <CloudUpload />}
              fullWidth
              disabled={uploading === 'propertyImages'}
              sx={{ mb: 2 }}
            >
              {uploading === 'propertyImages' ? 'Uploading Images...' : 'Upload Commercial Images'}
            </Button>
          </label>
          
          {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Images
              </Typography>
              <Grid container spacing={2}>
                {currentProperty.propertyImages.map((image: any, imgIndex: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={imgIndex}>
                    <Card 
                      sx={{ 
                        position: 'relative',
                        border: image.isPrimary ? '2px solid #ed6c02' : '1px solid #e0e0e0',
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            height: 120,
                            backgroundImage: `url(${image.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 1,
                            position: 'relative',
                            mb: 1
                          }}
                        >
                          {image.isPrimary && (
                            <Chip 
                              label="Primary" 
                              size="small" 
                              color="warning" 
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                left: 8,
                              }} 
                            />
                          )}
                          
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            display: 'flex',
                            gap: 0.5
                          }}>
                            {!image.isPrimary && (
                              <Tooltip title="Set as primary image">
                                <IconButton
                                  size="small"
                                  onClick={() => setPrimaryImage(imgIndex)}
                                  sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                  }}
                                >
                                  <StarBorder sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Remove image">
                              <IconButton
                                size="small"
                                onClick={() => removeFile('propertyImages', imgIndex)}
                                sx={{ 
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                }}
                              >
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {image.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'warning.main' }}>
            <Description sx={{ mr: 1 }} />
            Commercial Floor Plans
            {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
              <Chip 
                label={`${currentProperty.floorPlans.length} uploaded`} 
                size="small" 
                color="warning" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <input
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            id={`commercial-floorplans-${index}`}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'floorPlans')}
            disabled={uploading === 'floorPlans'}
          />
          <label htmlFor={`commercial-floorplans-${index}`}>
            <Button 
              variant="contained" 
              component="span" 
              color="warning"
              startIcon={uploading === 'floorPlans' ? <CircularProgress size={20} /> : <CloudUpload />}
              fullWidth
              disabled={uploading === 'floorPlans'}
              sx={{ mb: 2 }}
            >
              {uploading === 'floorPlans' ? 'Uploading Floor Plans...' : 'Upload Floor Plans'}
            </Button>
          </label>
          
          {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Floor Plans
              </Typography>
              <Grid container spacing={2}>
                {currentProperty.floorPlans.map((plan: any, planIndex: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={planIndex}>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            height: 120,
                            backgroundColor: 'grey.50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            position: 'relative',
                            mb: 1,
                            border: '1px dashed #e0e0e0'
                          }}
                        >
                          {plan.type?.includes('image') ? (
                            <img 
                              src={plan.url} 
                              alt={plan.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
                              }} 
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <Description sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                              <Typography variant="caption" display="block">
                                PDF Document
                              </Typography>
                            </Box>
                          )}
                          
                          <Tooltip title="Remove floor plan">
                            <IconButton
                              size="small"
                              onClick={() => removeFile('floorPlans', planIndex)}
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(255,255,255,0.95)',
                              }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {plan.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

// Plot Property Form
const PlotForm = ({ formData, setFormData, validationErrors, index }: any) => {
  const [uploading, setUploading] = useState<string | null>(null);

  const mapFloorPlanType = (fileType: string) => {
    if (!fileType) return '2d';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('image')) return 'image';
    return '2d';
  };

  const handleFileUpload = async (files: FileList, type: 'propertyImages' | 'floorPlans') => {
    setUploading(type);
    try {
      const fileArray = Array.from(files);
      const uploadedFiles = [];

      for (const file of fileArray) {
        const uploadResponse = await uploadService.uploadFile(file);
        if (uploadResponse.success && uploadResponse.data) {
          const newFile = {
            url: uploadResponse.data.url,
            title: file.name.replace(/\.[^/.]+$/, ""),
            description: "",
            isPrimary: false,
            uploadedAt: new Date().toISOString(),
            ...(type === 'floorPlans' && { 
              type: mapFloorPlanType(file.type)
            })
          };
          uploadedFiles.push(newFile);
        }
      }

      const newPlot = [...(formData.plotProperties || [])];
      if (!newPlot[index]) newPlot[index] = {};
      
      if (type === 'propertyImages') {
        newPlot[index].propertyImages = [
          ...(newPlot[index].propertyImages || []),
          ...uploadedFiles
        ];
      } else {
        newPlot[index].floorPlans = [
          ...(newPlot[index].floorPlans || []),
          ...uploadedFiles
        ];
      }

      setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
      toast.success(`Successfully uploaded ${uploadedFiles.length} file(s)`);
      
    } catch (error) {
      toast.error('Failed to upload files');
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (type: 'propertyImages' | 'floorPlans', fileIndex: number) => {
    const newPlot = [...(formData.plotProperties || [])];
    if (!newPlot[index]) return;

    if (type === 'propertyImages') {
      newPlot[index].propertyImages = newPlot[index].propertyImages?.filter((_: any, i: number) => i !== fileIndex) || [];
    } else {
      newPlot[index].floorPlans = newPlot[index].floorPlans?.filter((_: any, i: number) => i !== fileIndex) || [];
    }

    setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
    toast.success('File removed successfully');
  };

  const setPrimaryImage = (fileIndex: number) => {
    const newPlot = [...(formData.plotProperties || [])];
    if (!newPlot[index]?.propertyImages) return;

    newPlot[index].propertyImages = newPlot[index].propertyImages.map((img: any, i: number) => ({
      ...img,
      isPrimary: i === fileIndex
    }));

    setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
    toast.success('Primary image updated');
  };

  const currentProperty = formData.plotProperties?.[index] || {};

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'info.main', display: 'flex', alignItems: 'center' }}>
          <Landscape sx={{ mr: 1 }} />
          Plot #{index + 1}
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Property Name" value={currentProperty.propertyName || ''}
          onChange={(e) => {
            const newPlot = [...(formData.plotProperties || [])];
            if (!newPlot[index]) newPlot[index] = {};
            newPlot[index].propertyName = e.target.value;
            setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
  <TextField 
    fullWidth 
    label="Price" 
    value={currentProperty.price || ''}
    onChange={(e) => {
      const newPlot = [...(formData.plotProperties || [])];
      if (!newPlot[index]) newPlot[index] = {};
      newPlot[index].price = e.target.value;
      setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
    }}
    placeholder="Leave empty to inherit from main project"
    helperText={formData.parentId ? "Leave empty to automatically use main project price" : "Enter price for this plot"}
  />
</Grid>
      <Grid size={{ xs: 12 }}>
        <TextField fullWidth label="Property Description" value={currentProperty.propertyDescription || ''}
          onChange={(e) => {
            const newPlot = [...(formData.plotProperties || [])];
            if (!newPlot[index]) newPlot[index] = {};
            newPlot[index].propertyDescription = e.target.value;
            setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
          }}
          multiline rows={2}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Ownership Type</InputLabel>
          <Select value={currentProperty.ownershipType || "Freehold"}
            onChange={(e) => {
              const newPlot = [...(formData.plotProperties || [])];
              if (!newPlot[index]) newPlot[index] = {};
              newPlot[index].ownershipType = e.target.value;
              setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
            }}
            label="Ownership Type"
          >
            <MenuItem value="Freehold">Freehold</MenuItem>
            <MenuItem value="Leasehold">Leasehold</MenuItem>
            <MenuItem value="GPA">GPA</MenuItem>
            <MenuItem value="Power of Attorney">Power of Attorney</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Land Type</InputLabel>
          <Select value={currentProperty.landType || "Residential Plot"}
            onChange={(e) => {
              const newPlot = [...(formData.plotProperties || [])];
              if (!newPlot[index]) newPlot[index] = {};
              newPlot[index].landType = e.target.value;
              setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
            }}
            label="Land Type"
          >
            <MenuItem value="Residential Plot">Residential Plot</MenuItem>
            <MenuItem value="Commercial Plot">Commercial Plot</MenuItem>
            <MenuItem value="Farm Land">Farm Land</MenuItem>
            <MenuItem value="Industrial Plot">Industrial Plot</MenuItem>
            <MenuItem value="Mixed Use">Mixed Use</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField fullWidth label="Approved By" value={currentProperty.approvedBy || ''}
          onChange={(e) => {
            const newPlot = [...(formData.plotProperties || [])];
            if (!newPlot[index]) newPlot[index] = {};
            newPlot[index].approvedBy = e.target.value;
            setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Boundary Wall</InputLabel>
          <Select value={currentProperty.boundaryWall?.toString() || "false"}
            onChange={(e) => {
              const newPlot = [...(formData.plotProperties || [])];
              if (!newPlot[index]) newPlot[index] = {};
              newPlot[index].boundaryWall = e.target.value === 'true';
              setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
            }}
            label="Boundary Wall"
          >
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Minimum Size" value={currentProperty.minSize || ''}
          onChange={(e) => {
            const newPlot = [...(formData.plotProperties || [])];
            if (!newPlot[index]) newPlot[index] = {};
            newPlot[index].minSize = e.target.value;
            setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Maximum Size" value={currentProperty.maxSize || ''}
          onChange={(e) => {
            const newPlot = [...(formData.plotProperties || [])];
            if (!newPlot[index]) newPlot[index] = {};
            newPlot[index].maxSize = e.target.value;
            setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Size Unit" value={currentProperty.sizeUnit || 'sq.ft.'}
          onChange={(e) => {
            const newPlot = [...(formData.plotProperties || [])];
            if (!newPlot[index]) newPlot[index] = {};
            newPlot[index].sizeUnit = e.target.value;
            setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
          }}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Amenities</InputLabel>
          <Select
            multiple
            value={currentProperty.amenities || []}
            onChange={(e) => {
              const newPlot = [...(formData.plotProperties || [])];
              if (!newPlot[index]) newPlot[index] = {};
              newPlot[index].amenities = e.target.value as string[];
              setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
            }}
            input={<OutlinedInput label="Amenities" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {(selected as string[]).map((value) => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {[
              "Boundary Wall", "Gate", "Security", "Road Access", "Water Supply", "Electricity",
              "Drainage", "Street Lights", "Park", "Community Center"
            ].map(amenity => (
              <MenuItem key={amenity} value={amenity}>
                {amenity}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
            <CloudUpload sx={{ mr: 1 }} />
            Plot Images
            {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
              <Chip 
                label={`${currentProperty.propertyImages.length} uploaded`} 
                size="small" 
                color="info" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id={`plot-images-${index}`}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'propertyImages')}
            disabled={uploading === 'propertyImages'}
          />
          <label htmlFor={`plot-images-${index}`}>
            <Button 
              variant="contained" 
              component="span" 
              color="info"
              startIcon={uploading === 'propertyImages' ? <CircularProgress size={20} /> : <CloudUpload />}
              fullWidth
              disabled={uploading === 'propertyImages'}
              sx={{ mb: 2 }}
            >
              {uploading === 'propertyImages' ? 'Uploading Images...' : 'Upload Plot Images'}
            </Button>
          </label>
          
          {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Images
              </Typography>
              <Grid container spacing={2}>
                {currentProperty.propertyImages.map((image: any, imgIndex: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={imgIndex}>
                    <Card 
                      sx={{ 
                        position: 'relative',
                        border: image.isPrimary ? '2px solid #0288d1' : '1px solid #e0e0e0',
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            height: 120,
                            backgroundImage: `url(${image.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            borderRadius: 1,
                            position: 'relative',
                            mb: 1
                          }}
                        >
                          {image.isPrimary && (
                            <Chip 
                              label="Primary" 
                              size="small" 
                              color="info" 
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                left: 8,
                              }} 
                            />
                          )}
                          
                          <Box sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            display: 'flex',
                            gap: 0.5
                          }}>
                            {!image.isPrimary && (
                              <Tooltip title="Set as primary image">
                                <IconButton
                                  size="small"
                                  onClick={() => setPrimaryImage(imgIndex)}
                                  sx={{ 
                                    backgroundColor: 'rgba(255,255,255,0.95)',
                                  }}
                                >
                                  <StarBorder sx={{ fontSize: 18 }} />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Remove image">
                              <IconButton
                                size="small"
                                onClick={() => removeFile('propertyImages', imgIndex)}
                                sx={{ 
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                }}
                              >
                                <Delete sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {image.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
            <Description sx={{ mr: 1 }} />
            Plot Layouts & Plans
            {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
              <Chip 
                label={`${currentProperty.floorPlans.length} uploaded`} 
                size="small" 
                color="info" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          <input
            accept="image/*,.pdf"
            style={{ display: 'none' }}
            id={`plot-floorplans-${index}`}
            type="file"
            multiple
            onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'floorPlans')}
            disabled={uploading === 'floorPlans'}
          />
          <label htmlFor={`plot-floorplans-${index}`}>
            <Button 
              variant="contained" 
              component="span" 
              color="info"
              startIcon={uploading === 'floorPlans' ? <CircularProgress size={20} /> : <CloudUpload />}
              fullWidth
              disabled={uploading === 'floorPlans'}
              sx={{ mb: 2 }}
            >
              {uploading === 'floorPlans' ? 'Uploading Layouts...' : 'Upload Plot Layouts'}
            </Button>
          </label>
          
          {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Layouts & Plans
              </Typography>
              <Grid container spacing={2}>
                {currentProperty.floorPlans.map((plan: any, planIndex: number) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={planIndex}>
                    <Card>
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            height: 120,
                            backgroundColor: 'grey.50',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            position: 'relative',
                            mb: 1,
                            border: '1px dashed #e0e0e0'
                          }}
                        >
                          {plan.type?.includes('image') ? (
                            <img 
                              src={plan.url} 
                              alt={plan.title}
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
                              }} 
                            />
                          ) : (
                            <Box sx={{ textAlign: 'center' }}>
                              <Description sx={{ fontSize: 48, color: 'info.main', mb: 1 }} />
                              <Typography variant="caption" display="block">
                                PDF Document
                              </Typography>
                            </Box>
                          )}
                          
                          <Tooltip title="Remove layout">
                            <IconButton
                              size="small"
                              onClick={() => removeFile('floorPlans', planIndex)}
                              sx={{ 
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(255,255,255,0.95)',
                              }}
                            >
                              <Delete sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                          {plan.title}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
};

const PropertyTypeSelector = ({ formData, setFormData, validationErrors }: any) => {
  const [activeTab, setActiveTab] = useState(0);

  const handlePropertyTypeChange = (selectedTypes: string[]) => {
    setFormData((prev: any) => ({ 
      ...prev, 
      propertyType: selectedTypes,
      residentialProperties: selectedTypes.includes('residential') ? (prev.residentialProperties || [{}]) : [],
      commercialProperties: selectedTypes.includes('commercial') ? (prev.commercialProperties || [{}]) : [],
      plotProperties: selectedTypes.includes('plot') ? (prev.plotProperties || [{}]) : [],
    }));
  };

  const addPropertyOfType = (type: string) => {
    const key = `${type}Properties`;
    const currentProperties = formData[key] || [];
    
    const defaultProperty = {
      propertyName: '',
      propertyDescription: '',
      price: '',
      paymentPlan: formData.paymentPlan || '',
      amenities: [],
      propertyImages: [], 
      floorPlans: [],
      ...(type === 'residential' && {
        bedrooms: 0,
        bathrooms: 0,
        toilet: 0,
        balcony: 0,
        carpetArea: '',
        builtUpArea: '',
        minSize: '',
        maxSize: '',
        sizeUnit: 'sq.ft.'
      }),
      ...(type === 'commercial' && {
        carpetArea: '',
        builtUpArea: '',
        minSize: '',
        maxSize: '',
        sizeUnit: 'sq.ft.'
      }),
      ...(type === 'plot' && {
        ownershipType: 'Freehold',
        landType: 'Residential Plot',
        approvedBy: '',
        boundaryWall: false,
        minSize: '',
        maxSize: '',
        sizeUnit: 'sq.ft.'
      })
    };

    setFormData((prev: any) => ({ 
      ...prev, 
      [key]: [...currentProperties, defaultProperty] 
    }));
    
    setActiveTab(formData.propertyType.indexOf(type));
  };

  const removePropertyOfType = (type: string, index: number) => {
    const key = `${type}Properties`;
    const currentProperties = formData[key] || [];
    const newProperties = currentProperties.filter((_: any, i: number) => i !== index);
    setFormData((prev: any) => ({ 
      ...prev, 
      [key]: newProperties 
    }));
  };

  const selectedTypes = Array.isArray(formData.propertyType) ? formData.propertyType : [];

  return (
    <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '15px' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Property Types Configuration <Typography component="span" color="error">*</Typography>
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12 }}>
          <FormControl fullWidth sx={{ mb: 2 }} error={!!validationErrors.propertyType}>
            <InputLabel>Select Property Types *</InputLabel>
            <Select
              multiple
              value={selectedTypes}
              onChange={(e) => handlePropertyTypeChange(e.target.value as string[])}
              input={<OutlinedInput label="Select Property Types *" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" 
                      color={value === 'residential' ? 'secondary' : value === 'commercial' ? 'warning' : 'info'} />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="residential">
                <Box sx={{ display: 'flex', alignItems: 'center' }}><Home sx={{ mr: 1 }} />Residential</Box>
              </MenuItem>
              <MenuItem value="commercial">
                <Box sx={{ display: 'flex', alignItems: 'center' }}><Business sx={{ mr: 1 }} />Commercial</Box>
              </MenuItem>
              <MenuItem value="plot">
                <Box sx={{ display: 'flex', alignItems: 'center' }}><Landscape sx={{ mr: 1 }} />Plot</Box>
              </MenuItem>
            </Select>
            {validationErrors.propertyType && <FormHelperText error>{validationErrors.propertyType}</FormHelperText>}
          </FormControl>
        </Grid>
      </Grid>

      {selectedTypes.length > 0 && (
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} variant="scrollable">
              {selectedTypes.map((type, index) => (
                <Tab key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} />
              ))}
            </Tabs>
          </Box>

          {selectedTypes.map((type, typeIndex) => (
            <div key={type} role="tabpanel" hidden={activeTab !== typeIndex}>
              {activeTab === typeIndex && (
                <Box sx={{ py: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      {type === 'residential' ? 'Residential Properties' : 
                      type === 'commercial' ? 'Commercial Properties' : 'Plots'}
                    </Typography>
                    <Button variant="outlined" startIcon={<Add />} onClick={() => addPropertyOfType(type)}>
                      Add {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  </Box>

                  {(formData[`${type}Properties`] || []).map((_: any, index: number) => (
                    <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="subtitle1">
                          {type.charAt(0).toUpperCase() + type.slice(1)} Property #{index + 1}
                        </Typography>
                        <IconButton onClick={() => removePropertyOfType(type, index)} color="error">
                          <Delete />
                        </IconButton>
                      </Box>

                      {type === 'residential' && (
                        <ResidentialForm formData={formData} setFormData={setFormData} validationErrors={validationErrors} index={index} />
                      )}
                      {type === 'commercial' && (
                        <CommercialForm formData={formData} setFormData={setFormData} validationErrors={validationErrors} index={index} />
                      )}
                      {type === 'plot' && (
                        <PlotForm formData={formData} setFormData={setFormData} validationErrors={validationErrors} index={index} />
                      )}
                    </Paper>
                  ))}
                </Box>
              )}
            </div>
          ))}
        </Box>
      )}

      {selectedTypes.length > 1 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> A main project will be created automatically with all selected property types.
            Each property type will have its own section and can be managed independently.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

// Additional Details Section
const AdditionalDetailsSection = ({ formData, setFormData, validationErrors }: any) => {
  const [geocoding, setGeocoding] = useState(false);

  const geocodeAddress = async (address: string) => {
    if (!address || address.trim().length < 3) return;
    
    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          
          setFormData((prev: any) => ({
            ...prev,
            mapLocation: { 
              lat: parseFloat(lat), 
              lng: parseFloat(lon) 
            }
          }));
          
          toast.success('Location coordinates fetched automatically');
        } else {
          toast.warning('Address not found. Please enter coordinates manually.');
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to fetch coordinates. Please enter manually.');
    } finally {
      setGeocoding(false);
    }
  };

  const debouncedGeocode = useDebounce(geocodeAddress, 1000);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData((prev: any) => ({ ...prev, location: address }));
    
    if (address && address.trim().length > 5) {
      debouncedGeocode(address);
    }
  };

  const handleManualGeocode = () => {
    if (formData.location && formData.location.trim().length > 3) {
      geocodeAddress(formData.location);
    } else {
      toast.warning('Please enter a valid address first');
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '15px' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <LocationOn sx={{ mr: 1 }} />
        Location & Map
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ position: 'relative' }}>
            <TextField 
              fullWidth 
              label="Location *" 
              value={formData.location} 
              onChange={handleLocationChange}
              required 
              error={!!validationErrors.location} 
              helperText={validationErrors.location} 
              sx={{ mb: 2 }}
              placeholder="Enter full address for automatic map detection"
            />
            {geocoding && (
              <CircularProgress 
                size={20} 
                sx={{ 
                  position: 'absolute', 
                  right: 40, 
                  top: 12 
                }} 
              />
            )}
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            onClick={handleManualGeocode}
            disabled={geocoding || !formData.location}
            startIcon={<LocationOn />}
            sx={{ mb: 2 }}
          >
            {geocoding ? 'Fetching Location...' : 'Get Coordinates'}
          </Button>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Nearby Locations</InputLabel>
            <Select
              multiple
              value={formData.nearby || []}
              onChange={(e) => setFormData((prev: any) => ({ ...prev, nearby: e.target.value as string[] }))}
              input={<OutlinedInput label="Nearby Locations" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {[
                "Metro Station", "Bus Stand", "Railway Station", "Airport", "Shopping Mall",
                "Hospital", "School", "College", "Market", "Restaurant", "Bank", "ATM"
              ].map(location => (
                <MenuItem key={location} value={location}>
                  {location}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid size={{ xs: 12 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
            Map Coordinates
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Coordinates will be automatically fetched when you enter an address. 
              You can also manually adjust them below.
            </Typography>
          </Alert>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Latitude"
            type="number"
            value={formData.mapLocation?.lat || ''}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              mapLocation: { ...prev.mapLocation, lat: parseFloat(e.target.value) || 0 }
            }))}
            sx={{ mb: 2 }}
            helperText="Automatically filled from address"
          />
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Longitude"
            type="number"
            value={formData.mapLocation?.lng || ''}
            onChange={(e) => setFormData((prev: any) => ({
              ...prev,
              mapLocation: { ...prev.mapLocation, lng: parseFloat(e.target.value) || 0 }
            }))}
            sx={{ mb: 2 }}
            helperText="Automatically filled from address"
          />
        </Grid>

        {(formData.mapLocation?.lat !== 0 && formData.mapLocation?.lng !== 0) && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '12px' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                Map Preview
              </Typography>
              <Box sx={{ height: 200, borderRadius: '8px', overflow: 'hidden' }}>
                <LeafletMap 
                  location={formData.mapLocation}
                  propertyName={formData.projectName || "Property Location"}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Coordinates: {formData.mapLocation.lat.toFixed(6)}, {formData.mapLocation.lng.toFixed(6)}
              </Typography>
            </Paper>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.isActive !== undefined ? formData.isActive : true}
                onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                color="primary"
              />
            }
            label="Property is Active and Visible"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

interface SubPropertiesViewerProps {
  parentId: string;
  onViewSubProperty: (property: Property) => void;
}

function SubPropertiesViewer({ parentId, onViewSubProperty }: SubPropertiesViewerProps) {
  const [subProperties, setSubProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubProperties();
  }, [parentId]);

  const loadSubProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getSubProperties(parentId);
      if (response.success) {
        setSubProperties(response.data as Property[]);
      }
    } catch (error) {
      console.error("Failed to load sub-properties:", error);
      toast.error("Failed to load sub-properties");
    } finally {
      setLoading(false);
    }
  };

  const getFirstImage = (property: Property) => {
    if (property.propertyImages && property.propertyImages.length > 0) {
      return property.propertyImages[0];
    }
    if (property.images && property.images.length > 0) {
      return property.images[0].url || property.images[0];
    }
    return null;
  };

  const renderPropertyImage = (property: Property) => {
    const imageSrc = getFirstImage(property);
    
    if (imageSrc) {
      const imageUrl = typeof imageSrc === 'string' ? imageSrc : imageSrc.url;
      return (
        <img 
          src={imageUrl} 
          alt={property.propertyName} 
          style={{ 
            width: '100%', 
            height: '130px', 
            objectFit: 'cover',
            borderRadius: '8px'
          }} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <Box 
        sx={{ 
          width: '100%', 
          height: '120px', 
          backgroundColor: 'grey.200',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Home sx={{ color: 'grey.400' }} />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={2}>
        <CircularProgress size={20} />
        <Typography variant="body2" sx={{ ml: 1 }}>Loading sub-properties...</Typography>
      </Box>
    );
  }

  if (subProperties.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'grey.50' }}>
        <Typography variant="body1" color="text.secondary">
          No sub-properties found for this project
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Add residential, commercial, or plot properties to this project
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        {subProperties.map((subProperty) => (
          <Grid size={{ xs: 12 }} key={subProperty._id}>
            <Card variant="outlined" sx={{ mb: 1 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12, md: 2 }}>
                    {renderPropertyImage(subProperty)}
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 10 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {subProperty.propertyName}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {subProperty.price && (
                        <Chip 
                          label={`${subProperty.price}`} 
                          size="small" 
                          variant="outlined"
                          icon={<CurrencyRupee sx={{ fontSize: '14px' }} />}
                        />
                      )}
                      {subProperty.propertyType && (
                        <Chip 
                          label={`${subProperty.propertyType}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {subProperty.minSize && (
                        <Chip 
                          label={`${subProperty.minSize} - ${subProperty.maxSize} ${subProperty.sizeUnit}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {subProperty.bedrooms && subProperty.bedrooms > 0 && (
                        <Chip 
                          label={`${subProperty.bedrooms} Beds`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {subProperty.bathrooms && subProperty.bathrooms > 0 && (
                        <Chip 
                          label={`${subProperty.bathrooms} Baths`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
                      {subProperty.propertyDescription && (
                        <Typography variant="body2" color="text.secondary">
                          {subProperty.propertyDescription.split(' ').slice(0, 20).join(' ')}
                          {subProperty.propertyDescription.split(' ').length > 20 && '...'}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ mt: 0.5 }}>
                      <Typography 
                        variant="body2" 
                        color="primary.main" 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                        onClick={() => onViewSubProperty(subProperty)}
                      >
                        view more details
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

interface MainProjectCardProps {
  project: Property;
  onEdit: (property: Property) => void;
  onView: (property: Property) => void;
  onDelete: (id: string) => void;
  onViewSubProperty: (property: Property) => void;
  onEditSubProperty: (property: Property) => void;
  onDeleteSubProperty: (id: string) => void;
}

function MainProjectCard({ 
  project, 
  onEdit, 
  onView, 
  onDelete,
  onViewSubProperty,
  onEditSubProperty,
  onDeleteSubProperty
}: MainProjectCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [subProperties, setSubProperties] = useState<Property[]>([]);
  const [loadingSubProperties, setLoadingSubProperties] = useState(false);

  const loadSubProperties = async () => {
    if (subProperties.length > 0) return;
    
    try {
      setLoadingSubProperties(true);
      const response = await propertyService.getSubProperties(project._id!);
      if (response.success) {
        setSubProperties(response.data as Property[]);
      }
    } catch (error) {
      console.error("Failed to load sub-properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoadingSubProperties(false);
    }
  };

  const primaryImage = project.images?.find(img => img.isPrimary) || project.images?.[0];

  return (
    <Paper 
      sx={{ 
        mb: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: expanded ? 'primary.main' : 'divider',
        borderRadius: '15px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: 3,
        }
      }}
    >
      <Box 
        sx={{ 
          p: 2,
          height: "15rem",
          transition: "transform 0.2s",
          backgroundImage: primaryImage ? `url(${primaryImage.url})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: '15px 15px 0 0'
          },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" justifyContent="flex-end" alignItems="flex-start">
          <Box>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onView(project);
              }} 
              sx={{ color: 'white' }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(project);
              }} 
              sx={{ color: 'white' }}
            >
              <EditIcon />
            </IconButton>
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project._id!);
              }} 
              sx={{ color: 'white' }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Box position="absolute" zIndex={1} sx={{ 
          color: 'white', 
          textAlign: 'center', 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          bottom: '10px', 
          left: 0, 
          right: 0 
        }}>
          <Typography variant="h5" fontWeight={600}>{project.projectName}</Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} gutterBottom>
            by {project.builderName}
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            
            {project.price || 'Contact for Price'}
          </Typography>
          <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
            <Chip 
              label={`${project.subPropertyCount || 0} Properties`}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                color: 'black', 
                fontWeight: 600 
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

const PaginationControls = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }: any) => {
  if (totalPages <= 1) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, gap: 2 }}>
      <Typography variant="body2" color="text.secondary">Showing {startItem}-{endItem} of {totalItems} projects</Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
        <Button variant="outlined" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button key={page} variant={currentPage === page ? "contained" : "outlined"} onClick={() => onPageChange(page)}>
            {page}
          </Button>
        ))}
        <Button variant="outlined" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
      </Box>
    </Box>
  );
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openSubPropertyDialog, setOpenSubPropertyDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [selectedSubProperty, setSelectedSubProperty] = useState<Property | null>(null);
  
  const PROPERTIES_PER_PAGE = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState({
    propertyType: "", 
    status: "", 
    location: "", 
    builderName: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'image' | 'brochure' | null>(null);
  
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  const [formData, setFormData] = useState({
    projectName: "",
    builderName: "",
    location: "",
    paymentPlan: "",
    propertyType: [] as string[],
    description: "",
    propertyName: "",
    propertyDescription: "",
    price: "",
    minSize: "",
    maxSize: "",
    sizeUnit: "",
    bedrooms: 0,
    bathrooms: 0,
    toilet: 0,
    balcony: 0,
    carpetArea: "",
    builtUpArea: "",
    ownershipType: "Freehold" as "Freehold" | "Leasehold" | "GPA" | "Power of Attorney",
    landType: "Residential Plot" as "Residential Plot" | "Commercial Plot" | "Farm Land" | "Industrial Plot" | "Mixed Use",
    approvedBy: "",
    boundaryWall: false,
    amenities: [] as string[],
    status: [] as string[],
    nearby: [] as string[],
    projectHighlights: [] as string[],
    images: [] as any[],
    propertyImages: [] as any[],
    floorPlans: [] as any[],
    creatives: [] as any[],
    videos: [] as any[],
    brochureUrls: [] as any[],
    mapLocation: { lat: 0, lng: 0 },
    isActive: true,
    parentId: null as string | null,
    residentialProperties: [] as any[],
    commercialProperties: [] as any[],
    plotProperties: [] as any[],
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay || !selectedSubProperty?.propertyImages || selectedSubProperty.propertyImages.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => 
        prev === selectedSubProperty.propertyImages.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [autoPlay, selectedSubProperty?.propertyImages]);

  useEffect(() => {
    setCurrentImageIndex(0);
    setAutoPlay(true);
  }, [openSubPropertyDialog, selectedSubProperty]);

  useEffect(() => {
    let count = 0;
    if (filters.propertyType) count++;
    if (filters.status) count++;
    if (filters.location) count++;
    if (filters.builderName) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  useEffect(() => { 
    loadProperties(); 
  }, []);

  useEffect(() => { 
    setCurrentPage(1);
    loadProperties(); 
  }, [debouncedSearchTerm, filters]);

  useEffect(() => {
    const total = Math.ceil(properties.length / PROPERTIES_PER_PAGE);
    setTotalPages(total || 1);
    if (currentPage > total && total > 0) setCurrentPage(total);
  }, [properties, currentPage]);

  useEffect(() => {
    const requiredFieldsValid = (
      formData.projectName?.trim().length >= 2 && 
      formData.builderName?.trim().length >= 2 &&
      formData.location?.trim().length > 0 &&
      formData.paymentPlan?.trim().length > 0 &&
      formData.propertyType && formData.propertyType.length > 0
    );
    setIsFormValid(requiredFieldsValid);
  }, [formData]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await propertyService.getHierarchicalProperties(
        debouncedSearchTerm,
        filters.status,
        filters.propertyType,
        filters.location,
        filters.builderName
      );
      if (response.success) {
        setProperties(response.data as Property[]);
      } else {
        throw new Error(response.message || "Failed to load properties");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({ 
      propertyType: "", 
      status: "", 
      location: "", 
      builderName: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  const removeFilter = (filterType: string) => {
    setFilters(prev => ({ ...prev, [filterType]: "" }));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const getPaginatedProperties = () => {
    const startIndex = (currentPage - 1) * PROPERTIES_PER_PAGE;
    return properties.slice(startIndex, startIndex + PROPERTIES_PER_PAGE);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDialog = (property: Property | null = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        projectName: property.projectName || "",
        builderName: property.builderName || "",
        location: property.location || "",
        paymentPlan: property.paymentPlan || "",
        propertyType: [property.propertyType],
        description: property.description || "",
        propertyName: property.propertyName || "",
        propertyDescription: property.propertyDescription || "",
        price: property.price || "",
        minSize: property.minSize || "",
        maxSize: property.maxSize || "",
        sizeUnit: property.sizeUnit || "",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        toilet: property.toilet || 0,
        balcony: property.balcony || 0,
        carpetArea: property.carpetArea || "",
        builtUpArea: property.builtUpArea || "",
        ownershipType: property.ownershipType || "Freehold",
        landType: property.landType || "Residential Plot",
        approvedBy: property.approvedBy || "",
        boundaryWall: property.boundaryWall || false,
        amenities: property.amenities || [],
        status: property.status || [],
        nearby: property.nearby || [],
        projectHighlights: property.projectHighlights || [],
        images: property.images || [],
        propertyImages: property.propertyImages || [],
        floorPlans: property.floorPlans || [],
        creatives: property.creatives || [],
        videos: property.videos || [],
        brochureUrls: property.brochureUrls || [],
        mapLocation: property.mapLocation || { lat: 0, lng: 0 },
        isActive: property.isActive !== undefined ? property.isActive : true,
        parentId: property.parentId || null,
        residentialProperties: property.propertyType === 'residential' ? [{
          propertyName: property.propertyName,
          propertyDescription: property.propertyDescription,
          price: property.price,
          paymentPlan: property.paymentPlan,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          toilet: property.toilet,
          balcony: property.balcony,
          carpetArea: property.carpetArea,
          builtUpArea: property.builtUpArea,
          minSize: property.minSize,
          maxSize: property.maxSize,
          sizeUnit: property.sizeUnit,
          amenities: property.amenities
        }] : [],
        commercialProperties: property.propertyType === 'commercial' ? [{
          propertyName: property.propertyName,
          propertyDescription: property.propertyDescription,
          price: property.price,
          paymentPlan: property.paymentPlan,
          carpetArea: property.carpetArea,
          builtUpArea: property.builtUpArea,
          minSize: property.minSize,
          maxSize: property.maxSize,
          sizeUnit: property.sizeUnit,
          amenities: property.amenities
        }] : [],
        plotProperties: property.propertyType === 'plot' ? [{
          propertyName: property.propertyName,
          propertyDescription: property.propertyDescription,
          price: property.price,
          paymentPlan: property.paymentPlan,
          ownershipType: property.ownershipType,
          landType: property.landType,
          approvedBy: property.approvedBy,
          boundaryWall: property.boundaryWall,
          minSize: property.minSize,
          maxSize: property.maxSize,
          sizeUnit: property.sizeUnit,
          amenities: property.amenities
        }] : [],
      });
    } else {
      setEditingProperty(null);
      setFormData({
        projectName: "", builderName: "", location: "", paymentPlan: "", propertyType: [],
        description: "", propertyName: "", propertyDescription: "", price: "",
        minSize: "", maxSize: "", sizeUnit: "",
        bedrooms: 0, bathrooms: 0, toilet: 0, balcony: 0, carpetArea: "", builtUpArea: "",
        ownershipType: "Freehold", landType: "Residential Plot", approvedBy: "", boundaryWall: false,
        amenities: [], status: [], nearby: [], projectHighlights: [],
        images: [], propertyImages: [], floorPlans: [], creatives: [], videos: [], brochureUrls: [],
        mapLocation: { lat: 0, lng: 0 },
        isActive: true, parentId: null,
        residentialProperties: [], commercialProperties: [], plotProperties: [],
      });
    }
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false); 
    setEditingProperty(null); 
    setValidationErrors({}); 
    setIsFormValid(false);
  };

  const handleViewProperty = (property: Property) => {
    setViewingProperty(property); 
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false); 
    setViewingProperty(null);
  };

  const handleViewSubProperty = (subProperty: Property) => {
    setSelectedSubProperty(subProperty);
    setOpenSubPropertyDialog(true);
  };

  const handleDeleteProperty = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    
    try {
      const toastId = toast.loading("Deleting property...");
      await propertyService.deleteProperty(id);
      toast.success("Property deleted successfully", { id: toastId });
      loadProperties();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete property");
    }
  };

  const validateForm = (): boolean => {
    const errors: any = {};
    
    if (!formData.projectName?.trim()) errors.projectName = "Project name is required";
    if (!formData.builderName?.trim()) errors.builderName = "Builder name is required";
    if (!formData.location?.trim()) errors.location = "Location is required";
    if (!formData.paymentPlan?.trim()) errors.paymentPlan = "Payment plan is required";
    if (!formData.propertyType || formData.propertyType.length === 0) errors.propertyType = "At least one property type is required";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      const toastId = toast.loading(editingProperty ? "Updating property..." : "Creating properties...");
      
      const submitData = {
        ...formData,
        images: formData.images.map(img => ({
          ...img,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        })),
        propertyImages: formData.propertyImages.map(img => ({
          ...img,
          uploadedAt: img.uploadedAt || new Date().toISOString()
        })),
        floorPlans: formData.floorPlans.map(plan => ({
          ...plan,
          uploadedAt: plan.uploadedAt || new Date().toISOString()
        })),
        creatives: formData.creatives.map(creative => ({
          ...creative,
          uploadedAt: creative.uploadedAt || new Date().toISOString()
        })),
        videos: formData.videos.map(video => ({
          ...video,
          uploadedAt: video.uploadedAt || new Date().toISOString()
        })),
        brochureUrls: formData.brochureUrls,
        residentialProperties: formData.residentialProperties.map(prop => ({
          ...prop,
          propertyImages: prop.propertyImages?.map((img: any) => ({
            ...img,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: prop.floorPlans?.map((plan: any) => ({
            ...plan,
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || []
        })),
        commercialProperties: formData.commercialProperties.map(prop => ({
          ...prop,
          propertyImages: prop.propertyImages?.map((img: any) => ({
            ...img,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: prop.floorPlans?.map((plan: any) => ({
            ...plan,
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || []
        })),
        plotProperties: formData.plotProperties.map(prop => ({
          ...prop,
          propertyImages: prop.propertyImages?.map((img: any) => ({
            ...img,
            uploadedAt: img.uploadedAt || new Date().toISOString()
          })) || [],
          floorPlans: prop.floorPlans?.map((plan: any) => ({
            ...plan,
            uploadedAt: plan.uploadedAt || new Date().toISOString()
          })) || []
        }))
      };

      let response;
      
      if (editingProperty && editingProperty._id) {
        const editData = { 
          ...submitData, 
          propertyType: Array.isArray(submitData.propertyType) ? submitData.propertyType[0] : submitData.propertyType 
        };
        response = await propertyService.updateProperty(editingProperty._id, editData);
        toast.success("Property updated successfully", { id: toastId });
      } else {
        response = await propertyService.createProperty(submitData);
        
        if (response.success) {
          if ('mainProject' in response.data) {
            const { mainProject, subProperties } = response.data;
            toast.success(`Main project created with ${subProperties.length} sub-properties`, { id: toastId });
          } else {
            toast.success("Property created successfully", { id: toastId });
          }
        }
      }
      
      handleCloseDialog();
      loadProperties();
      
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || "Failed to save property");
    }
  };

  const handleDownloadFile = (url: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloading ${filename}`);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    }
  };

  const handleDownloadImages = (images: any[]) => {
    images.forEach((image, index) => {
      setTimeout(() => {
        handleDownloadFile(
          image.url, 
          image.title || `image-${index + 1}.jpg`
        );
      }, index * 500);
    });
    toast.success(`Starting download of ${images.length} images`);
  };

  const handleDownloadBrochures = (brochures: any[]) => {
    brochures.forEach((brochure, index) => {
      setTimeout(() => {
        handleDownloadFile(
          brochure.url, 
          brochure.title || `brochure-${index + 1}.pdf`
        );
      }, index * 500);
    });
    toast.success(`Starting download of ${brochures.length} brochures`);
  };

  const handleDownloadCreatives = (creatives: any[]) => {
    creatives.forEach((creative, index) => {
      setTimeout(() => {
        const extension = creative.type === 'image' ? 'jpg' : 'mp4';
        handleDownloadFile(
          creative.url, 
          creative.title || `creative-${index + 1}.${extension}`
        );
      }, index * 500);
    });
    toast.success(`Starting download of ${creatives.length} creatives`);
  };

  const handleDownloadVideos = (videos: any[]) => {
    videos.forEach((video, index) => {
      setTimeout(() => {
        handleDownloadFile(
          video.url, 
          video.title || `video-${index + 1}.mp4`
        );
      }, index * 500);
    });
    toast.success(`Starting download of ${videos.length} videos`);
  };

  const handleDownloadAllMedia = (property: Property) => {
    const allMedia = [
      ...(property.images || []),
      ...(property.brochureUrls || []),
      ...(property.creatives || []),
      ...(property.videos || [])
    ];
    
    if (allMedia.length === 0) {
      toast.info('No media files available for download');
      return;
    }
    
    allMedia.forEach((media, index) => {
      setTimeout(() => {
        let filename = media.title || `file-${index + 1}`;
        let extension = 'file';
        
        if (media.type === 'image') extension = 'jpg';
        else if (media.type === 'video') extension = 'mp4';
        else if (media.url.includes('.pdf')) extension = 'pdf';
        else if (media.url.includes('.doc')) extension = 'doc';
        else if (media.url.includes('.docx')) extension = 'docx';
        
        handleDownloadFile(media.url, `${filename}.${extension}`);
      }, index * 300);
    });
    
    toast.success(`Starting download of ${allMedia.length} files`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading properties...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Toaster position="top-right" />

      {/* Header */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "15px",
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Title */}
          <Grid item xs={12} md="auto">
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                textAlign: { xs: "center", md: "left" },
                mb: { xs: 2, md: 0 },
              }}
            >
              Properties
            </Typography>
          </Grid>

          {/* Search + Buttons */}
          <Grid
            item
            xs={12}
            md
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-end" },
              flexWrap: "wrap",
            }}
          >
            {/* Search Field */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{
                width: { xs: "100%", sm: "250px", md: "300px" },
              }}
            />

            {/* Button Group */}
            <Grid
              item
              sx={{
                width: { xs: "100%", sm: "auto" },
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                justifyContent: { xs: "center", md: "flex-end" },
              }}
            >
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  flexGrow: { xs: 1, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
              </Button>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: "#1976d2",
                  "&:hover": { backgroundColor: "#115293" },
                  flexGrow: { xs: 1, sm: 0 },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                Add Property
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {/* Results Summary */}
        {(searchTerm || activeFiltersCount > 0) && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 2,
              textAlign: { xs: "center", md: "left" },
            }}
          >
            Found {properties.length} project{properties.length !== 1 ? "s" : ""}{" "}
            {searchTerm && ` matching "${searchTerm}"`}
            {activeFiltersCount > 0 &&
              ` with ${activeFiltersCount} filter${
                activeFiltersCount !== 1 ? "s" : ""
              } applied`}
          </Typography>
        )}
      </Paper>

      {/* Enhanced Filters Section */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: "15px" }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Filters
              {activeFiltersCount > 0 && (
                <Chip 
                  label={`${activeFiltersCount} active`} 
                  size="small" 
                  color="primary" 
                  sx={{ ml: 2 }} 
                />
              )}
            </Typography>
            <Button 
              onClick={clearAllFilters} 
              variant="outlined" 
              size="small"
              disabled={activeFiltersCount === 0}
            >
              Clear All
            </Button>
          </Box>

          <Grid container spacing={2}>
            {/* Property Type Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  label="Property Type"
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="project">Main Projects</MenuItem>
                  <MenuItem value="residential">Residential</MenuItem>
                  <MenuItem value="commercial">Commercial</MenuItem>
                  <MenuItem value="plot">Plot</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="Ready to Move">Ready to Move</MenuItem>
                  <MenuItem value="Under Construction">Under Construction</MenuItem>
                  <MenuItem value="New Launch">New Launch</MenuItem>
                  <MenuItem value="Pre Launch">Pre Launch</MenuItem>
                  <MenuItem value="Sold Out">Sold Out</MenuItem>
                  <MenuItem value="Coming Soon">Coming Soon</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Location Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Enter location"
              />
            </Grid>

            {/* Builder Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Builder"
                value={filters.builderName}
                onChange={(e) => handleFilterChange('builderName', e.target.value)}
                placeholder="Builder name"
              />
            </Grid>
          </Grid>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Filters:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filters.propertyType && (
                  <Chip
                    label={`Type: ${filters.propertyType}`}
                    onDelete={() => removeFilter('propertyType')}
                    size="small"
                  />
                )}
                {filters.status && (
                  <Chip
                    label={`Status: ${filters.status}`}
                    onDelete={() => removeFilter('status')}
                    size="small"
                  />
                )}
                {filters.location && (
                  <Chip
                    label={`Location: ${filters.location}`}
                    onDelete={() => removeFilter('location')}
                    size="small"
                  />
                )}
                {filters.builderName && (
                  <Chip
                    label={`Builder: ${filters.builderName}`}
                    onDelete={() => removeFilter('builderName')}
                    size="small"
                  />
                )}
              </Box>
            </Box>
          )}
        </Paper>
      </Collapse>

      {/* Properties List with Hierarchy */}
      <Box sx={{ width: '100%' }}>
        {properties.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No properties found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {searchTerm ? `No results for "${searchTerm}"` : 'Create your first property to get started'}
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={() => handleOpenDialog()} 
              sx={{ mt: 2 }}
            >
              Add Your First Property
            </Button>
          </Paper>
        ) : (
          <>
          <Box sx={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2, display: 'grid' }}>
            {getPaginatedProperties().map((project) => (
              <MainProjectCard
                key={project._id}
                project={project}
                onEdit={handleOpenDialog}
                onView={handleViewProperty}
                onDelete={handleDeleteProperty}
                onViewSubProperty={handleViewSubProperty}
                onEditSubProperty={handleOpenDialog}
                onDeleteSubProperty={handleDeleteProperty}
              />
            ))}
            </Box>
          </>
        )}
      </Box>

      {/* Pagination */}
      {properties.length > 0 && (
        <PaginationControls 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
          totalItems={properties.length} 
          itemsPerPage={PROPERTIES_PER_PAGE} 
        />
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', color: '#1976d2', borderRadius: '15px 15px 0 0' }}>
          <Typography variant="h5" fontWeight={600}>{editingProperty ? "Edit Property" : "Add New Properties"}</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>Basic Project Information</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Fields marked with <Typography component="span" color="error">*</Typography> are required
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Project Name *" value={formData.projectName} onChange={(e) => setFormData((prev: any) => ({ ...prev, projectName: e.target.value }))}
                required error={!!validationErrors.projectName} helperText={validationErrors.projectName} sx={{ mb: 2 }} />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Builder Name *" value={formData.builderName} onChange={(e) => setFormData((prev: any) => ({ ...prev, builderName: e.target.value }))}
                required error={!!validationErrors.builderName} helperText={validationErrors.builderName} sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select multiple value={formData.status} onChange={(e) => setFormData((prev: any) => ({ ...prev, status: e.target.value }))} input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{(selected as string[]).map((value) => (<Chip key={value} label={value} size="small" />))}</Box>)}>
                  {["Ready to Move", "Under Construction", "New Launch", "Pre Launch", "Sold Out", "Coming Soon"].map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Payment Plan *" value={formData.paymentPlan} onChange={(e) => setFormData((prev: any) => ({ ...prev, paymentPlan: e.target.value }))}
                required error={!!validationErrors.paymentPlan} helperText={validationErrors.paymentPlan} sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12}}>
              <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData((prev: any) => ({ ...prev, description: e.target.value }))} multiline rows={3}
                sx={{ mb: 2 }} />
            </Grid>

            <Grid size={{ xs: 12}}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Project Highlights</InputLabel>
                <Select multiple value={formData.projectHighlights} onChange={(e) => setFormData((prev: any) => ({ ...prev, projectHighlights: e.target.value }))} input={<OutlinedInput label="ProjectHighlights" />}
                  renderValue={(selected) => (<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{(selected as string[]).map((value) => (<Chip key={value} label={value} size="small" />))}</Box>)}>
                  {["Gated Community", "Eco-Friendly", "Luxury Living", "Affordable Housing", "Smart Home Features", "Waterfront Property", "High-Rise Building", "Low-Rise Building", "Vastu Compliant"].map(highlight => (
                    <MenuItem key={highlight} value={highlight}>{highlight}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="project-images"
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files);
                          for (const file of files) {
                            const uploadResponse = await uploadService.uploadFile(file);
                            if (uploadResponse.success && uploadResponse.data) {
                              const newImage = {
                                url: uploadResponse.data.url,
                                title: file.name.replace(/\.[^/.]+$/, ""),
                                description: "",
                                isPrimary: formData.images.length === 0,
                                uploadedAt: new Date().toISOString()
                              };
                              setFormData((prev: any) => ({ 
                                ...prev, 
                                images: [...prev.images, newImage] 
                              }));
                            }
                          }
                        }
                      }}
                    />
                    <label htmlFor="project-images">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                        Upload Project Images
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.images.map((img, imgIndex) => (
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
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      id="brochure-upload"
                      type="file"
                      onChange={async (e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const uploadResponse = await uploadService.uploadFile(file);
                          if (uploadResponse.success && uploadResponse.data) {
                            const newBrochure = {
                              title: file.name.replace(/\.[^/.]+$/, ""),
                              url: uploadResponse.data.url,
                              type: "PDF Document"
                            };
                            setFormData((prev: any) => ({ 
                              ...prev, 
                              brochureUrls: [...prev.brochureUrls, newBrochure] 
                            }));
                          }
                        }
                      }}
                    />
                    <label htmlFor="brochure-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                        Upload Brochure
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.brochureUrls.map((brochure, brochureIndex) => (
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
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      id="creatives-upload"
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files);
                          for (const file of files) {
                            const uploadResponse = await uploadService.uploadFile(file);
                            if (uploadResponse.success && uploadResponse.data) {
                              const isVideo = file.type.startsWith('video/');
                              const newCreative = {
                                type: isVideo ? "video" as "image" | "video" | "3d-tour" : "image" as "image" | "video" | "3d-tour",
                                url: uploadResponse.data.url,
                                title: file.name.replace(/\.[^/.]+$/, ""),
                                description: "",
                                thumbnail: isVideo ? "" : uploadResponse.data.url,
                                uploadedAt: new Date().toISOString()
                              };
                              setFormData((prev: any) => ({ 
                                ...prev, 
                                creatives: [...prev.creatives, newCreative] 
                              }));
                            }
                          }
                        }
                      }}
                    />
                    <label htmlFor="creatives-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                        Upload Creatives (Images/Videos)
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.creatives.map((creative, creativeIndex) => (
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
                      accept="video/*"
                      style={{ display: 'none' }}
                      id="videos-upload"
                      type="file"
                      multiple
                      onChange={async (e) => {
                        if (e.target.files) {
                          const files = Array.from(e.target.files);
                          for (const file of files) {
                            const uploadResponse = await uploadService.uploadFile(file);
                            if (uploadResponse.success && uploadResponse.data) {
                              const newVideo = {
                                url: uploadResponse.data.url,
                                title: file.name.replace(/\.[^/.]+$/, ""),
                                description: "",
                                thumbnail: "",
                                type: "direct" as "youtube" | "vimeo" | "direct",
                                uploadedAt: new Date().toISOString()
                              };
                              setFormData((prev: any) => ({ 
                                ...prev, 
                                videos: [...prev.videos, newVideo] 
                              }));
                            }
                          }
                        }
                      }}
                    />
                    <label htmlFor="videos-upload">
                      <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                        Upload Videos
                      </Button>
                    </label>
                    
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {formData.videos.map((video, videoIndex) => (
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
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Tooltip title={!isFormValid ? "Please fill all required fields" : "All required fields are filled"} arrow placement="top">
            <span>
              <Button onClick={handleSubmit} variant="contained" disabled={!isFormValid}>
                {editingProperty ? "Update Property" : "Create Properties"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>

            {/* View Property Dialog */}
      <Dialog 
  open={openViewDialog} 
  onClose={handleCloseViewDialog} 
  maxWidth="lg" 
  fullWidth
  scroll="paper"
  sx={{
    '& .MuiDialog-paper': {
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }
  }}
>
  {/* Enhanced Header with Gradient Overlay */}
  <Box sx={{ 
    position: 'relative',
    height: { xs: 240, md: 240 },
    background: viewingProperty?.images?.length > 0 
      ? `linear-gradient(135deg, rgba(25, 118, 210, 0.95) 0%, rgba(15, 82, 147, 0.85) 100%), url(${viewingProperty.images.find(img => img.isPrimary)?.url || viewingProperty.images[0]?.url})`
      : 'linear-gradient(135deg, #1976d2 0%, #0f5293 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    color: 'white',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    p: { xs: 3, md: 4 }
  }}>
    {/* Top Action Bar */}
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'end', 
      alignItems: 'flex-end',
      mb: 2
    }}>
      <IconButton 
        onClick={handleCloseViewDialog}
        sx={{
          color: 'white',
          backgroundColor: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.25)',
            transform: 'scale(1.1)'
          },
          transition: 'all 0.2s ease'
        }}
      >
        <Clear />
      </IconButton>
    </Box>

    {/* Header Content */}
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'flex-end', 
      justifyContent: 'space-between', 
      flexWrap: 'wrap', 
      gap: 3,
      mt: 'auto'
    }}>
      <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
        <Typography variant="h2" fontWeight={800} sx={{ 
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          textShadow: '0 4px 20px rgba(0,0,0,0.4)',
          lineHeight: 1.1,
          mb: 2
        }}>
          {viewingProperty?.projectName}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Business sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>
              {viewingProperty?.builderName}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
            <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
              {viewingProperty?.location}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        textAlign: { xs: 'left', md: 'right' },
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 4,
        p: 3,
        minWidth: { xs: '100%', md: 280 }
      }}>
        <Typography variant="h3" fontWeight={800} sx={{ 
          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'flex-start', md: 'flex-end' },
          fontSize: { xs: '2rem', md: '2.5rem' }
        }}>
          {/* <CurrencyRupee sx={{ fontSize: '2rem', mr: 0.5 }} /> */}
          {viewingProperty?.price || 'Contact for Price'}
        </Typography>
        {/* <Typography variant="body1" sx={{ 
          opacity: 0.9, 
          mt: 1,
          background: 'rgba(255,255,255,0.2)',
          borderRadius: 2,
          px: 2,
          py: 0.5,
          display: 'inline-block'
        }}>
          {viewingProperty?.paymentPlan}
        </Typography> */}
      </Box>
    </Box>
  </Box>

  <DialogContent sx={{ p: 0 }}>
    {/* Quick Actions Bar */}
    <Paper sx={{ 
      p: 3, 
      borderRadius: 0,
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Quick Stats */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CloudUpload color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {viewingProperty?.images?.length || 0} Images
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayArrow color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {viewingProperty?.videos?.length || 0} Videos
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description color="primary" />
            <Typography variant="body2" fontWeight={600}>
              {viewingProperty?.brochureUrls?.length || 0} Brochures
            </Typography>
          </Box>
        </Box>
        
        {/* Download All Button */}
        {(viewingProperty?.brochureUrls?.length > 0 || viewingProperty?.images?.length > 0) && (
          <Button
            variant="contained"
            startIcon={<CloudDownload />}
            onClick={() => handleDownloadAllMedia(viewingProperty)}
            sx={{ 
              borderRadius: 3,
              px: 3,
              py: 1,
              fontWeight: 600,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                transform: 'translateY(-1px)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            Download All Media
          </Button>
        )}
      </Box>
    </Paper>

    {/* Main Content */}
    <Box sx={{ p: { xs: 3, md: 4 } }}>
      <Grid container spacing={4}>
        {/* Left Column - Property Details */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Description Card */}
          <Card sx={{ 
            mb: 4, 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'visible'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                pb: 2,
                borderBottom: '2px solid',
                borderColor: 'primary.100'
              }}>
                <Description sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
                  Project Overview
                </Typography>
              </Box>
              
              <Typography variant="body1" sx={{ 
                color: 'text.secondary', 
                lineHeight: 1.8,
                fontSize: '1.1rem',
                mb: 4
              }}>
                {viewingProperty?.description}
              </Typography>

              {/* Highlights Grid */}
              <Grid container spacing={3}>
                {viewingProperty?.status && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50', height: '100%' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
                        🏗️ Project Status
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(Array.isArray(viewingProperty.status) ? viewingProperty.status : viewingProperty.status.split(',')).map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {item.trim()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {viewingProperty?.nearby && (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'success.50', height: '100%' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', mb: 2 }}>
                        📍 Nearby Locations
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(Array.isArray(viewingProperty.nearby) ? viewingProperty.nearby : viewingProperty.nearby.split(',')).map((item, index) => (
                          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {item.trim()}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}

                {viewingProperty?.projectHighlights && (
                  <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                      <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                        ⭐ Project Highlights
                      </Typography>
                      <Grid container spacing={2}>
                        {(Array.isArray(viewingProperty.projectHighlights) ? viewingProperty.projectHighlights : viewingProperty.projectHighlights.split(',')).map((point, index) => (
                          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                {point.trim()}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Side Information */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Location & Map Card */}
          <Card sx={{ 
            mb: 3, 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 0, overflow: 'hidden' }}>
              <Box sx={{ p: 3, pb: 2 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: 'primary.main'
                }}>
                  <LocationOn sx={{ mr: 1.5 }} />
                  Location
                </Typography>
              </Box>

              {viewingProperty?.mapLocation ? (
                <>
                  <Box sx={{ height: 200, position: 'relative' }}>
                    <LeafletMap 
                      location={viewingProperty.mapLocation}
                      propertyName={viewingProperty.projectName}
                    />
                  </Box>
                  
                  <Box sx={{ p: 3, pt: 2 }}>
                    <Paper sx={{ p: 2, borderRadius: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100' }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ color: 'primary.main' }}>
                        📍 Coordinates
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Latitude
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {viewingProperty.mapLocation.lat?.toFixed(6) || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Longitude
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {viewingProperty.mapLocation.lng?.toFixed(6) || 'N/A'}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                </>
              ) : (
                <Paper 
                  sx={{ 
                    height: 200, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    bgcolor: 'grey.50',
                    borderRadius: 0
                  }}
                >
                  <LocationOn sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Location not specified
                  </Typography>
                </Paper>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
                ℹ️ Quick Info
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">Property Type</Typography>
                  <Chip 
                    label={viewingProperty?.parentId === null ? "Main" : "Sub"} 
                    size="small" 
                    color={viewingProperty?.parentId === null ? "primary" : "secondary"}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                  <Typography variant="body2" color="text.secondary">Total Media</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {(viewingProperty?.images?.length || 0) + (viewingProperty?.videos?.length || 0) + (viewingProperty?.brochureUrls?.length || 0)}
                  </Typography>
                </Box>
                
                {viewingProperty?.parentId === null && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                    <Typography variant="body2" color="text.secondary">Sub Properties</Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {viewingProperty?.subPropertyCount || 0}
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Sub Properties Section */}
      {viewingProperty?.parentId === null && (
        <Card sx={{ 
          mt: 4, 
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 3,
              pb: 2,
              borderBottom: '2px solid',
              borderColor: 'primary.100'
            }}>
              <Business sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
                Property Types ({viewingProperty?.subPropertyCount || 0})
              </Typography>
            </Box>
            <SubPropertiesViewer 
              parentId={viewingProperty._id!} 
              onViewSubProperty={handleViewSubProperty} 
            />
          </CardContent>
        </Card>
      )}

      {/* Media Sections */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Images Section */}
        {viewingProperty?.images && viewingProperty.images.length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <CloudUpload sx={{ mr: 1.5 }} />
                    Project Images ({viewingProperty.images.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownloadImages(viewingProperty.images)}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Download All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {viewingProperty.images.map((image, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          border: '2px solid transparent',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                            borderColor: 'primary.main'
                          }
                        }}
                      >
                        <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundImage: `url(${image.url})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              borderRadius: '8px 8px 0 0',
                            }}
                          >
                            {/* Download Button */}
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                '&:hover': {
                                  backgroundColor: 'white',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(image.url, image.title || `image-${index + 1}.jpg`);
                              }}
                              size="small"
                            >
                              <CloudDownload sx={{ fontSize: 16 }} />
                            </IconButton>
                            
                            {image.isPrimary && (
                              <Chip 
                                label="Primary" 
                                size="small" 
                                color="primary" 
                                sx={{ 
                                  position: 'absolute',
                                  top: 8,
                                  left: 8,
                                  height: 20, 
                                  fontSize: '0.65rem',
                                  fontWeight: 600
                                }} 
                              />
                            )}
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Videos Section */}
        {viewingProperty?.videos && viewingProperty.videos.length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <PlayArrow sx={{ mr: 1.5 }} />
                    Videos ({viewingProperty.videos.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownloadVideos(viewingProperty.videos)}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Download All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {viewingProperty.videos.map((video, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Card sx={{ 
                        transition: 'all 0.3s ease', 
                        border: '2px solid transparent',
                        '&:hover': { 
                          transform: 'translateY(-4px)', 
                          boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                          borderColor: 'primary.main'
                        } 
                      }}>
                        <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'grey.100',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px 8px 0 0',
                              cursor: 'pointer',
                              backgroundImage: video.thumbnail ? `url(${video.thumbnail})` : 'none',
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                            onClick={() => window.open(video.url, '_blank')}
                          >
                            {!video.thumbnail && (
                              <PlayArrow sx={{ fontSize: 48, color: 'primary.main' }} />
                            )}
                            
                            <Box sx={{ 
                              position: 'absolute', 
                              inset: 0, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: video.thumbnail ? 'rgba(0,0,0,0.3)' : 'transparent'
                            }}>
                              <PlayArrow sx={{ fontSize: 48, color: 'white', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }} />
                            </Box>
                            
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                backgroundColor: 'rgba(255,255,255,0.95)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                '&:hover': {
                                  backgroundColor: 'white',
                                  transform: 'scale(1.1)'
                                },
                                transition: 'all 0.2s ease'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadFile(video.url, video.title || `video-${index + 1}.mp4`);
                              }}
                            >
                              <CloudDownload />
                            </IconButton>
                          </Box>
                        </Box>
                        
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {video.title || `Video ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {video.type || 'MP4 Video'}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Brochures Section */}
        {viewingProperty?.brochureUrls && viewingProperty.brochureUrls.length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Description sx={{ mr: 1.5 }} />
                    Brochures ({viewingProperty.brochureUrls.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownloadBrochures(viewingProperty.brochureUrls)}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Download All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {viewingProperty.brochureUrls.map((brochure, index) => (
                    <Grid size={{ xs: 12 }} key={index}>
                      <Paper
                        variant="outlined"
                        sx={{ 
                          p: 2, 
                          borderRadius: 3,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                          border: '2px solid',
                          borderColor: 'grey.200',
                          '&:hover': {
                            backgroundColor: 'primary.50',
                            borderColor: 'primary.main',
                            transform: 'translateX(4px)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                          <Description sx={{ color: 'primary.main', mr: 2, fontSize: 32 }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="body1" fontWeight={600} noWrap>
                              {brochure.title || `Brochure ${index + 1}`}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {brochure.type || 'PDF Document'}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          onClick={() => handleDownloadFile(brochure.url, brochure.title || `brochure-${index + 1}.pdf`)}
                          color="primary"
                          sx={{
                            backgroundColor: 'primary.50',
                            '&:hover': {
                              backgroundColor: 'primary.100',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <CloudDownload />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Creatives Section */}
        {viewingProperty?.creatives && viewingProperty.creatives.length > 0 && (
          <Grid size={{ xs: 12, lg: 6 }}>
            <Card sx={{ 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <CloudUpload sx={{ mr: 1.5 }} />
                    Creatives ({viewingProperty.creatives.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownloadCreatives(viewingProperty.creatives)}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Download All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {viewingProperty.creatives.map((creative, index) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={index}>
                      <Card 
                        sx={{ 
                          transition: 'all 0.3s ease',
                          border: '2px solid transparent',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                            borderColor: creative.type === 'image' ? 'primary.main' : 'secondary.main'
                          }
                        }}
                      >
                        {creative.type === 'image' ? (
                          <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(${creative.url})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '8px 8px 0 0'
                              }}
                            >
                              <IconButton
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  '&:hover': {
                                    backgroundColor: 'white',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(creative.url, creative.title || `creative-${index + 1}.jpg`);
                                }}
                                size="small"
                              >
                                <CloudDownload sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        ) : (
                          <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'grey.100',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '8px 8px 0 0'
                              }}
                            >
                              <PlayArrow sx={{ fontSize: 48, color: 'secondary.main' }} />
                              <IconButton
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  '&:hover': {
                                    backgroundColor: 'white',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(creative.url, creative.title || `creative-${index + 1}.mp4`);
                                }}
                                size="small"
                              >
                                <CloudDownload sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        )}
                        
                        <Box sx={{ p: 2 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {creative.title || `Creative ${index + 1}`}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                            {creative.type} • {creative.size || 'N/A'}
                          </Typography>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  </DialogContent>

  <DialogActions sx={{ 
    p: 3, 
    borderTop: '1px solid #e2e8f0', 
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    gap: 2
  }}>
    <Button 
      onClick={handleCloseViewDialog}
      variant="outlined"
      sx={{ 
        borderRadius: 3, 
        fontWeight: 600,
        px: 4,
        py: 1,
        borderWidth: 2,
        '&:hover': {
          borderWidth: 2
        }
      }}
    >
      Close
    </Button>
    <Button 
      onClick={() => { 
        handleCloseViewDialog(); 
        handleOpenDialog(viewingProperty); 
      }} 
      variant="contained" 
      startIcon={<Edit />}
      sx={{ 
        borderRadius: 3, 
        fontWeight: 600,
        px: 4,
        py: 1,
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
        '&:hover': {
          boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
          transform: 'translateY(-1px)'
        },
        transition: 'all 0.2s ease'
      }}
    >
      Edit Property
    </Button>
  </DialogActions>
</Dialog>

      {/* NEW: Sub-Property View Dialog */}
<Dialog 
  open={openSubPropertyDialog} 
  onClose={() => setOpenSubPropertyDialog(false)} 
  maxWidth="lg" 
  fullWidth
  scroll="paper"
  sx={{
    '& .MuiDialog-paper': {
      borderRadius: 3,
      overflow: 'hidden',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    }
  }}
>
  {selectedSubProperty && (
    <>
      {/* Enhanced Header with Gradient Overlay */}
      <Box sx={{ 
        position: 'relative',
        height: { xs: 240, md: 240 },
        background: selectedSubProperty?.propertyImages?.length > 0 
          ? `linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.85) 100%), url(${typeof selectedSubProperty.propertyImages[0] === 'string' ? selectedSubProperty.propertyImages[0] : selectedSubProperty.propertyImages[0]?.url})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        p: { xs: 3, md: 4 }
      }}>
        {/* Top Action Bar */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'end', 
          alignItems: 'flex-end',
          mb: 2
        }}>
          <IconButton 
            onClick={() => setOpenSubPropertyDialog(false)}
            sx={{
              color: 'white',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.25)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <Clear />
          </IconButton>
        </Box>

        {/* Header Content */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: 3,
          mt: 'auto'
        }}>
          <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
            <Typography variant="h2" fontWeight={800} sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              textShadow: '0 4px 20px rgba(0,0,0,0.4)',
              lineHeight: 1.1,
              mb: 2
            }}>
              {selectedSubProperty?.propertyName}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Category sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600, textTransform: 'capitalize' }}>
                  {selectedSubProperty?.propertyType} Property
                </Typography>
              </Box>
              
              {selectedSubProperty?.price && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CurrencyRupee sx={{ mr: 1.5, fontSize: 24, opacity: 0.9 }} />
                  <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 500 }}>
                    {selectedSubProperty.price.toLocaleString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ 
            textAlign: { xs: 'left', md: 'right' },
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 4,
            p: 3,
            minWidth: { xs: '100%', md: 280 }
          }}>
            <Typography variant="h3" fontWeight={800} sx={{ 
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              fontSize: { xs: '2rem', md: '2.5rem' }
            }}>
              {selectedSubProperty?.paymentPlan || 'Flexible Plans'}
            </Typography>
            <Typography variant="body1" sx={{ 
              opacity: 0.9, 
              mt: 1,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 2,
              px: 2,
              py: 0.5,
              display: 'inline-block'
            }}>
              {selectedSubProperty?.propertyType?.charAt(0).toUpperCase() + selectedSubProperty?.propertyType?.slice(1)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Quick Actions Bar */}
        <Paper sx={{ 
          p: 3, 
          borderRadius: 0,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            flexWrap: 'wrap', 
            gap: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Quick Stats */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUpload color="primary" />
                <Typography variant="body2" fontWeight={600}>
                  {selectedSubProperty?.propertyImages?.length || 0} Images
                </Typography>
              </Box>
              
              {selectedSubProperty?.amenities && selectedSubProperty.amenities.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star color="primary" />
                  <Typography variant="body2" fontWeight={600}>
                    {selectedSubProperty.amenities.length} Amenities
                  </Typography>
                </Box>
              )}
            </Box>
            
            {/* Download Button */}
            {selectedSubProperty?.propertyImages?.length > 0 && (
              <Button
                variant="contained"
                startIcon={<CloudDownload />}
                onClick={() => handleDownloadAllMedia(selectedSubProperty)}
                sx={{ 
                  borderRadius: 3,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Download All Images
              </Button>
            )}
          </Box>
        </Paper>

        {/* Main Content */}
        <Box sx={{ p: { xs: 3, md: 4 } }}>
          <Grid container spacing={4}>
            {/* Left Column - Property Details */}
            <Grid size={{ xs: 12, lg: 8 }}>
              {/* Basic Information Card */}
              <Card sx={{ 
                mb: 4, 
                borderRadius: 3, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)',
                overflow: 'visible'
              }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                    pb: 2,
                    borderBottom: '2px solid',
                    borderColor: 'primary.100'
                  }}>
                    <Info sx={{ mr: 2, color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h5" fontWeight={700} sx={{ color: 'primary.main' }}>
                      Property Details
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={3}>
                    {/* Property Type */}
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'primary.50', height: '100%' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ color: 'primary.main', mb: 2 }}>
                          🏠 Property Type
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Category sx={{ color: 'primary.main' }} />
                          <Typography variant="body1" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {selectedSubProperty.propertyType}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>

                    {/* Price */}
                    {selectedSubProperty.price && (
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'success.50', height: '100%' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'success.main', mb: 2 }}>
                            💰 Price
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CurrencyRupee sx={{ color: 'success.main' }} />
                            <Typography variant="body1" fontWeight={600}>
                              {selectedSubProperty.price.toLocaleString()}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {/* Size Information */}
                    {(selectedSubProperty.minSize || selectedSubProperty.maxSize) && (
                      <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'warning.50' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'warning.main', mb: 2 }}>
                            📐 Size Information
                          </Typography>
                          <Grid container spacing={2}>
                            {selectedSubProperty.minSize && (
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                    Minimum Size
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} color="warning.main">
                                    {selectedSubProperty.minSize}
                                  </Typography>
                                  {/* <Typography variant="caption" color="text.secondary">
                                    {selectedSubProperty.sizeUnit}
                                  </Typography> */}
                                </Box>
                              </Grid>
                            )}
                            
                            {selectedSubProperty.maxSize && (
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                    Maximum Size
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} color="warning.main">
                                    {selectedSubProperty.maxSize}
                                  </Typography>
                                  {/* <Typography variant="caption" color="text.secondary">
                                    {selectedSubProperty.sizeUnit}
                                  </Typography> */}
                                </Box>
                              </Grid>
                            )}
                            
                            {selectedSubProperty.sizeUnit && (
                              <Grid size={{ xs: 12, sm: 4 }}>
                                <Box sx={{ textAlign: 'center', p: 2 }}>
                                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                    Size Unit
                                  </Typography>
                                  <Typography variant="h6" fontWeight={700} color="warning.main">
                                    {selectedSubProperty.sizeUnit}
                                  </Typography>
                                </Box>
                              </Grid>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Property Type Specific Details */}
                    {(selectedSubProperty.propertyType === 'residential' || selectedSubProperty.propertyType === 'plot') && (
                      <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'info.50' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'info.main', mb: 2 }}>
                            {selectedSubProperty.propertyType === 'residential' ? '🏡 Residential Details' : '📊 Plot Details'}
                          </Typography>
                          <Grid container spacing={2}>
                            {selectedSubProperty.propertyType === 'residential' && (
                              <>
                                {selectedSubProperty.bedrooms && selectedSubProperty.bedrooms > 0 && (
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                      <Bed sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
                                      <Typography variant="h4" fontWeight={700} color="info.main">
                                        {selectedSubProperty.bedrooms}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Bedrooms
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                                
                                {selectedSubProperty.bathrooms && selectedSubProperty.bathrooms > 0 && (
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                      <Bathtub sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
                                      <Typography variant="h4" fontWeight={700} color="info.main">
                                        {selectedSubProperty.bathrooms}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Bathrooms
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                                
                                {selectedSubProperty.carpetArea && (
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                      <SquareFoot sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
                                      <Typography variant="h4" fontWeight={700} color="info.main">
                                        {selectedSubProperty.carpetArea}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Carpet Area
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                                
                                {selectedSubProperty.builtUpArea && (
                                  <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center', p: 2 }}>
                                      <AreaChart sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
                                      <Typography variant="h4" fontWeight={700} color="info.main">
                                        {selectedSubProperty.builtUpArea}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Built-up Area
                                      </Typography>
                                    </Box>
                                  </Grid>
                                )}
                              </>
                            )}
                            
                            {selectedSubProperty.propertyType === 'plot' && (
                              <>
                                {selectedSubProperty.ownershipType && (
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                                      <AccountBalance sx={{ color: 'info.main' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                          Ownership Type
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                          {selectedSubProperty.ownershipType}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                )}
                                
                                {selectedSubProperty.landType && (
                                  <Grid size={{ xs: 12, md: 6 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                                      <Grass sx={{ color: 'info.main' }} />
                                      <Box>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                          Land Type
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                          {selectedSubProperty.landType}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Grid>
                                )}
                                
                                <Grid size={{ xs: 12, md: 6 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                                    <Fence sx={{ color: 'info.main' }} />
                                    <Box>
                                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                                        Boundary Wall
                                      </Typography>
                                      <Chip 
                                        label={selectedSubProperty.boundaryWall ? 'Yes' : 'No'}
                                        color={selectedSubProperty.boundaryWall ? 'success' : 'default'}
                                        size="small"
                                      />
                                    </Box>
                                  </Box>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        </Paper>
                      </Grid>
                    )}

                    {/* Description */}
                    {selectedSubProperty.propertyDescription && (
                      <Grid size={{ xs: 12 }}>
                        <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'grey.50' }}>
                          <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary', mb: 2 }}>
                            📝 Description
                          </Typography>
                          <Typography variant="body1" sx={{ 
                            color: 'text.secondary', 
                            lineHeight: 1.7,
                            p: 2,
                            background: 'white',
                            borderRadius: 2,
                            borderLeft: '4px solid',
                            borderLeftColor: 'primary.main'
                          }}>
                            {selectedSubProperty.propertyDescription}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Side Information */}
            <Grid size={{ xs: 12, lg: 4 }}>
              {/* Amenities Card */}
              {selectedSubProperty.amenities && selectedSubProperty.amenities.length > 0 && (
                <Card sx={{ 
                  mb: 3, 
                  borderRadius: 3, 
                  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: 'primary.main'
                    }}>
                      <Star sx={{ mr: 1.5 }} />
                      Amenities ({selectedSubProperty.amenities.length})
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2 }}>
                      {selectedSubProperty.amenities.map((amenity, index) => (
                        <Box key={index} sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          p: 1.5,
                          borderRadius: 2,
                          background: 'rgba(102, 126, 234, 0.05)',
                          border: '1px solid rgba(102, 126, 234, 0.1)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)',
                            transform: 'translateX(4px)'
                          }
                        }}>
                          <CheckCircle sx={{ fontSize: '1rem', color: 'success.main' }} />
                          <Typography variant="body2" fontWeight={600}>
                            {amenity}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              )}

              {/* Quick Info Card */}
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main' }}>
                    ℹ️ Quick Info
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Property Type</Typography>
                      <Chip 
                        label={selectedSubProperty.propertyType} 
                        size="small" 
                        color="primary"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                      <Typography variant="body2" color="text.secondary">Total Images</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {selectedSubProperty?.propertyImages?.length || 0}
                      </Typography>
                    </Box>
                    
                    {selectedSubProperty.paymentPlan && (
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                        <Typography variant="body2" color="text.secondary">Payment Plan</Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedSubProperty.paymentPlan}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Images Section */}
          {selectedSubProperty?.propertyImages && selectedSubProperty.propertyImages.length > 0 && (
            <Card sx={{ 
              mt: 4, 
              borderRadius: 3, 
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ 
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <CloudUpload sx={{ mr: 1.5 }} />
                    Property Images ({selectedSubProperty.propertyImages.length})
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<CloudDownload />}
                    onClick={() => handleDownloadImages(selectedSubProperty.propertyImages)}
                    size="small"
                    sx={{ borderRadius: 2 }}
                  >
                    Download All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {selectedSubProperty.propertyImages.map((image, index) => {
                    const imageUrl = typeof image === 'string' ? image : image.url;
                    const imageTitle = typeof image === 'string' 
                      ? `Image ${index + 1}` 
                      : image.title || `Image ${index + 1}`;

                    return (
                      <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '2px solid transparent',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: '0 12px 28px rgba(0,0,0,0.15)',
                              borderColor: 'primary.main'
                            }
                          }}
                        >
                          <Box sx={{ position: 'relative', paddingTop: '75%' }}>
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundImage: `url(${imageUrl})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                borderRadius: '8px 8px 0 0',
                              }}
                            >
                              {/* Download Button */}
                              <IconButton
                                sx={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  '&:hover': {
                                    backgroundColor: 'white',
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s ease'
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownloadFile(imageUrl, imageTitle);
                                }}
                                size="small"
                              >
                                <CloudDownload sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Box>
                          </Box>
                          <Box sx={{ p: 1 }}>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {imageTitle}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid #e2e8f0', 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        gap: 2
      }}>
        <Button 
          onClick={() => setOpenSubPropertyDialog(false)}
          variant="outlined"
          sx={{ 
            borderRadius: 3, 
            fontWeight: 600,
            px: 4,
            py: 1,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Close
        </Button>
        <Button 
          onClick={() => { 
            setOpenSubPropertyDialog(false); 
            handleOpenDialog(selectedSubProperty); 
          }} 
          variant="contained" 
          startIcon={<Edit />}
          sx={{ 
            borderRadius: 3, 
            fontWeight: 600,
            px: 4,
            py: 1,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
              transform: 'translateY(-1px)'
            },
            transition: 'all 0.2s ease'
          }}
        >
          Edit Property
        </Button>
      </DialogActions>
    </>
  )}
</Dialog>
    </Box>
  );
}

