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
  Home,
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

interface ResidentialFormProps {
  formData: any;
  setFormData: (data: any) => void;
  validationErrors: any;
  index: number;
}

const ResidentialForm: React.FC<ResidentialFormProps> = ({
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
              "24/7 security staff", "CCTV surveillance", "Video door phone and intercom", "Smart lock and smart access control systems", "Gated community and controlled entry", "Fire safety (alarm, extinguisher)",
              "Swimming pool", "Gymnasium / fitness center", "Jogging track / walking paths", "Clubhouse or community hall", "Landscaped garden and green spaces", "Rooftop lounge or terrace garden", "Playground / children’s play area", 
              "Pet-friendly zones / dog park", "Party room / multipurpose hall", "Covered parking and garage", "Visitor / guest parking", "Bike parking or storage", "Electric vehicle charging stations", "Proximity to public transport", 
              "High-speed internet and cable TV provision", "Building Wi-Fi in common areas", "Smart home automation (lighting, climate control)", "Online rent payment and maintenance requests", "Automated package room / lockers for deliveries", 
              "Spa / wellness center", "Indoor games room (billiards, table tennis)", "Co-working / office space", "Community events and social spaces", "Elder’s sitting area", "Valet trash service", "Storage facilities", "Library / reading lounge", 
              "Solar power or solar lighting", "Rainwater harvesting", "Waste segregation and recycling"
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

export default ResidentialForm;

