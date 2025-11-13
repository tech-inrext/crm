import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Grid,
  Chip,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Card,
  CardContent,
  Tooltip,
} from "@mui/material";
import {
  Business,
  CloudUpload,
  Description,
  Delete,
  StarBorder,
} from "@mui/icons-material";
import { toast } from "sonner";

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

interface CommercialFormProps {
  formData: any;
  setFormData: (data: any) => void;
  validationErrors: any;
  index: number;
}

const CommercialForm: React.FC<CommercialFormProps> = ({
  formData,
  setFormData,
  validationErrors,
  index,
}) => {
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

export default CommercialForm;

