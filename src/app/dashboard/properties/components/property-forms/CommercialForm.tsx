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
import { uploadService } from "@/services/uploadService";

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
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

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
      if (fileArray.length === 0) return;

      const uploadPromises = fileArray.map(async (file, fileIndex) => {
        const fileId = `${type}-${index}-${fileIndex}-${Date.now()}`;
        
        try {
          // Validate file size (200MB max)
          uploadService.validateFileSize(file, 200);
          
          // Update progress
          setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));
          
          // Upload to S3
          const uploadResponse = await uploadService.uploadFile(file);
          
          // Update progress to 100%
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
          
          if (uploadResponse.success && uploadResponse.data) {
            const newFile = {
              url: uploadResponse.data.url, // S3 URL
              title: uploadResponse.data.originalName?.replace(/\.[^/.]+$/, "") || `Image ${fileIndex + 1}`,
              description: "",
              isPrimary: false,
              uploadedAt: new Date().toISOString(),
              fileSize: uploadResponse.data.fileSize,
              fileType: uploadResponse.data.fileType,
              originalName: uploadResponse.data.originalName,
              ...(type === 'floorPlans' && { 
                type: mapFloorPlanType(file.type)
              })
            };
            
            return { success: true, file: newFile };
          } else {
            return { success: false, error: uploadResponse.message };
          }
        } catch (error: any) {
          console.error(`Upload failed for ${file.name}:`, error);
          return { success: false, error: error.message };
        } finally {
          // Remove progress after 1 second
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        const newFiles = successfulUploads.map(result => result.file);
        
        const newCommercial = [...(formData.commercialProperties || [])];
        if (!newCommercial[index]) newCommercial[index] = {};
        
        if (type === 'propertyImages') {
          newCommercial[index].propertyImages = [
            ...(newCommercial[index].propertyImages || []),
            ...newFiles
          ];
        } else {
          newCommercial[index].floorPlans = [
            ...(newCommercial[index].floorPlans || []),
            ...newFiles
          ];
        }

        setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
        
        // Show success message
        if (successfulUploads.length > 0) {
          toast.success(`Successfully uploaded ${successfulUploads.length} file(s) to S3`);
        }
      }

      // Show error messages for failed uploads
      if (failedUploads.length > 0) {
        failedUploads.forEach(result => {
          toast.error(`Upload failed: ${result.error}`);
        });
      }

    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
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

  // Display upload progress
  const renderUploadProgress = () => {
    const entries = Object.entries(uploadProgress);
    if (entries.length === 0) return null;

    return (
      <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'warning.main', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Upload Progress:
        </Typography>
        {entries.map(([fileId, progress]) => (
          <Box key={fileId} sx={{ mb: 1 }}>
            <Typography variant="caption" display="block">
              {fileId.split('-')[1]} - {progress}%
            </Typography>
            <Box sx={{ height: 8, bgcolor: 'grey.200', borderRadius: 4, overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  height: '100%', 
                  bgcolor: 'warning.main', 
                  width: `${progress}%`,
                  transition: 'width 0.3s ease'
                }} 
              />
            </Box>
          </Box>
        ))}
      </Box>
    );
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

      <Grid size={{ xs: 12, md: 4 }}>
        <TextField fullWidth label="Property Type" value={currentProperty.propertyName || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            newCommercial[index].propertyName = e.target.value;
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
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
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField 
          fullWidth 
          label="Floor" 
          type="number"
          value={currentProperty.floors || ''}
          onChange={(e) => {
            const newCommercial = [...(formData.commercialProperties || [])];
            if (!newCommercial[index]) newCommercial[index] = {};
            const value = e.target.value;
            // Handle empty value as undefined
            newCommercial[index].floors = value === '' ? undefined : parseInt(value);
            setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
          }}
          InputProps={{
            inputProps: { 
              min: 0,
              step: 1
            }
          }}
          helperText="Optional - Number of floor"
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
              "City / Locality / Sector / Street Address", "Landmark / Nearby Roads / Connectivity", 
              "Distance from Metro Station / Bus Stop / Airport / Railway Station", 
              "Development Authority / Approved By (YEIDA / DDA / HUDA / RERA No.)", 
              "Road Width in Front (e.g., 24m, 60m, etc.)", 
              "Parking Availability (Basement / Open / Reserved / Visitor Parking)", 
              "Building Type: (Standalone / Mall / IT Park / Business Center / Industrial Estate)", 
              "Power Backup (Full / Partial / None)", "Air Conditioning (Central / Split / Window / VRV System)", 
              "Lift / Elevator (Passenger / Service)", "Fire Safety Systems (Sprinklers / Smoke Detectors / Extinguishers /Alarm)", 
              "Earthquake Resistance", "Power Load / Electricity Connection (in kVA or kW)", 
              "Washrooms (Common / Attached / Separate for Male & Female)", "Pantry / Cafeteria Area", 
              "Security Cabin or Reception Area", "24x7 Security / CCTV Surveillance", "Intercom Facility", "Access Control / Biometric Entry", 
              "Wi-Fi Connectivity / Internet Ready", "Maintenance Staff", "Housekeeping Services", "Centralized Air Conditioning (for corporate offices)", 
              "Escalators (in malls/shopping complexes)", "Backup Generator", "Conference Room / Meeting Room", "Lounge / Waiting Area", 
              "ATM / Banking Facilities within Premises", "Cafeteria / Food Court", "High-Speed Elevators", "Visitor Management System", "Rainwater Harvesting", 
              "Waste Disposal System", "Power Backup for Common Areas", "Fire Exit & Emergency Lighting", "Wheelchair / Handicap Access", "Wide Road Access", 
              "Landscaped Area / Green Zone", "Visibility from Main Road", "Corner Property Advantage", "Signage / Branding Opportunity", "Ample Street Lighting", 
              "Loading/Unloading Area (for warehouses or showrooms)", "Truck Entry / Dock Facility (for industrial units)", "Nearby Commercial Hubs / Corporate Offices", "Public Transport Accessibility"
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
            Commercial Property Images (S3 Storage)
            {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
              <Chip 
                label={`${currentProperty.propertyImages.length} uploaded`} 
                size="small" 
                color="warning" 
                sx={{ ml: 2 }} 
              />
            )}
          </Typography>
          
          {renderUploadProgress()}
          
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
              {uploading === 'propertyImages' ? 'Uploading to S3...' : 'Upload Commercial Images to S3'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Images will be uploaded directly to Amazon S3 cloud storage for better performance.
          </Typography>
          
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
                        {image.url && !image.url.startsWith('data:') && (
                          <Typography variant="caption" color="success.main" display="block">
                            ✓ S3 Storage
                          </Typography>
                        )}
                        {image.url && image.url.startsWith('data:') && (
                          <Typography variant="caption" color="warning.main" display="block">
                            ⚠ Base64 (needs re-upload)
                          </Typography>
                        )}
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
            Commercial Floor Plans (S3 Storage)
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
              {uploading === 'floorPlans' ? 'Uploading to S3...' : 'Upload Floor Plans to S3'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Floor plans will be uploaded directly to Amazon S3 cloud storage.
          </Typography>
          
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
                        {plan.url && !plan.url.startsWith('data:') && (
                          <Typography variant="caption" color="success.main" display="block">
                            ✓ S3 Storage
                          </Typography>
                        )}
                        {plan.url && plan.url.startsWith('data:') && (
                          <Typography variant="caption" color="warning.main" display="block">
                            ⚠ Base64 (needs re-upload)
                          </Typography>
                        )}
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
