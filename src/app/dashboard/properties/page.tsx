/* eslint-disable react/no-unescaped-entities */
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  MenuItem,
  OutlinedInput,
  FormControl,
  InputLabel,
  Select,
  Collapse,
  Tooltip,
  Card,
  CardContent,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  LocationOn,
  Photo,
  VideoLibrary,
  Description,
  Download,
  ArrowBack,
  ArrowForward,
  Search,
  Remove,
  CloudUpload,
  FilterList,
  ExpandMore,
  ExpandLess,
  Clear,
  MyLocation,
  Home,
  Business,
} from "@mui/icons-material";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Toaster, toast } from 'sonner';

// Leaflet imports for map
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import your services
import { propertyService, type Property, type PropertyType } from '@/services/propertyService';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom draggable marker icon
const createDraggableIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #1976d2;
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        position: relative;
        cursor: move;
      ">
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: rotate(45deg) translate(-30%, -30%);
          color: white;
          font-size: 16px;
        "></div>
      </div>
    `,
    className: 'draggable-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Location Marker Component
const LocationMarker = ({ 
  position, 
  onPositionChange,
  isEditMode 
}: { 
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
  isEditMode: boolean;
}) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(position);

  useEffect(() => {
    setMarkerPosition(position);
  }, [position]);

  const map = useMapEvents({
    click(e) {
      if (isEditMode) {
        const newPosition: [number, number] = [e.latlng.lat, e.latlng.lng];
        setMarkerPosition(newPosition);
        onPositionChange(newPosition[0], newPosition[1]);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  const handleDragEnd = (e: any) => {
    if (isEditMode) {
      const marker = e.target;
      const newPosition = marker.getLatLng();
      setMarkerPosition([newPosition.lat, newPosition.lng]);
      onPositionChange(newPosition.lat, newPosition.lng);
    }
  };

  return markerPosition ? (
    <Marker
      position={markerPosition}
      icon={createDraggableIcon()}
      draggable={isEditMode}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    >
      <Popup>
        <Typography variant="subtitle2" gutterBottom>
          Property Location
        </Typography>
        <Typography variant="body2">
          Lat: {markerPosition[0].toFixed(6)}
          <br />
          Lng: {markerPosition[1].toFixed(6)}
        </Typography>
        {isEditMode && (
          <Typography variant="caption" color="text.secondary">
            Drag to adjust or click elsewhere on map
          </Typography>
        )}
      </Popup>
    </Marker>
  ) : null;
};

// Enhanced Draggable Map Component
const DraggablePropertyMap = ({ 
  lat, 
  lng, 
  onLocationChange,
  isEditMode = false 
}: { 
  lat: number; 
  lng: number; 
  onLocationChange: (lat: number, lng: number) => void;
  isEditMode?: boolean;
}) => {
  const [map, setMap] = useState<any>(null);
  const defaultPosition: [number, number] = [20.5937, 78.9629];

  const handlePositionChange = (newLat: number, newLng: number) => {
    onLocationChange(newLat, newLng);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationChange(latitude, longitude);
          if (map) {
            map.flyTo([latitude, longitude], 15);
          }
        },
        (error) => {
          toast.error('Unable to get current location');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser');
    }
  };

  return (
    <Box sx={{ 
      height: '300px', 
      position: 'relative',
      borderRadius: '15px',
      overflow: 'hidden',
      border: '1px solid #e0e0e0'
    }}>
      {isEditMode && (
        <Box sx={{
          position: 'absolute',
          top: 10,
          right: 10,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Tooltip title="Use Current Location">
            <IconButton
              onClick={getCurrentLocation}
              sx={{
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                }
              }}
            >
              <MyLocation fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {isEditMode && (!lat || !lng) && (
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '8px 12px',
          zIndex: 1000,
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          Click on the map to set property location
        </Box>
      )}
      
      <MapContainer
        center={lat && lng ? [lat, lng] : defaultPosition}
        zoom={lat && lng ? 15 : 5}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        whenCreated={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationMarker 
          position={lat && lng ? [lat, lng] : defaultPosition}
          onPositionChange={handlePositionChange}
          isEditMode={isEditMode}
        />
      </MapContainer>
      
      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderTop: '1px solid #e0e0e0',
        fontSize: '0.75rem'
      }}>
        <Grid container spacing={1} alignItems="center">
          <Grid size={{ xs: 12, sm: 5 }}>
            <Typography variant="body2" noWrap>
              <strong>Latitude:</strong> {(lat || defaultPosition[0]).toFixed(6)}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <Typography variant="body2" noWrap>
              <strong>Longitude:</strong> {(lng || defaultPosition[1]).toFixed(6)}
            </Typography>
          </Grid>
          {isEditMode && (
            <Grid size={{ xs: 12, sm: 2 }}>
              <Button 
                size="small" 
                variant="outlined"
                onClick={() => onLocationChange(defaultPosition[0], defaultPosition[1])}
                fullWidth
              >
                Reset
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

// Location Search Component with CORS Proxy Fix
const LocationSearch = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address: string) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Using CORS proxy to fix the CORS error
      const proxyUrl = 'https://corsproxy.io/?';
      const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
      
      const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setSearchResults(data);
    } catch (error: any) {
      console.error('Error searching location:', error);
      
      // Fallback: Try alternative CORS proxy
      try {
        const fallbackProxyUrl = 'https://api.allorigins.win/raw?url=';
        const targetUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`;
        
        const fallbackResponse = await fetch(fallbackProxyUrl + encodeURIComponent(targetUrl));
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          setSearchResults(fallbackData);
        } else {
          throw new Error('Fallback also failed');
        }
      } catch (fallbackError) {
        console.error('Fallback geocoding also failed:', fallbackError);
        toast.error('Location service temporarily unavailable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResultSelect = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const address = result.display_name;
    
    onLocationSelect(lat, lng, address);
    setSearchQuery(address);
    setSearchResults([]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchLocation(searchQuery);
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        fullWidth
        label="Search Location"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Enter address, city, or landmark..."
        InputProps={{
          endAdornment: loading ? <CircularProgress size={20} /> : null,
        }}
        sx={{ mb: 2 }}
      />
      
      {searchResults.length > 0 && (
        <Paper sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          maxHeight: 200,
          overflow: 'auto',
          mt: 0.5,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <List dense>
            {searchResults.map((result, index) => (
              <ListItem 
                key={index}
                button
                onClick={() => handleResultSelect(result)}
                sx={{
                  borderBottom: '1px solid #f0f0f0',
                  '&:last-child': { borderBottom: 'none' },
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <LocationOn sx={{ mr: 1, color: 'primary.main', fontSize: '1rem' }} />
                <ListItemText 
                  primary={result.display_name}
                  secondary={`Lat: ${parseFloat(result.lat).toFixed(4)}, Lng: ${parseFloat(result.lon).toFixed(4)}`}
                  primaryTypographyProps={{ fontSize: '0.875rem' }}
                  secondaryTypographyProps={{ fontSize: '0.75rem' }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// File upload service using Base64
const uploadService = {
  uploadFile: async (file: File): Promise<{ success: boolean; data?: { url: string; fileName: string }; message?: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve({
          success: true,
          data: {
            url: base64,
            fileName: file.name
          }
        });
      };
      
      reader.onerror = () => {
        resolve({
          success: false,
          message: 'Failed to read file'
        });
      };
      
      reader.readAsDataURL(file);
    });
  },
};

// PropertyMap Component
const PropertyMap = ({ lat, lng, projectName }: { lat: number; lng: number; projectName: string }) => {
  if (!lat || !lng) {
    return (
      <Box sx={{ 
        height: '250px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '15px'
      }}>
        <Typography variant="body2" color="text.secondary">
          Location not available
        </Typography>
      </Box>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: '250px', width: '100%', borderRadius: '15px' }}
      scrollWheelZoom={false}
      className="property-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          <strong>{projectName}</strong>
          <br />
          Latitude: {lat.toFixed(6)}
          <br />
          Longitude: {lng.toFixed(6)}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

// Image Carousel Component
const ImageCarousel = ({ images, projectName }: { images: any[], projectName: string }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <Box sx={{ 
        height: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '15px'
      }}>
        <Typography variant="body1" color="text.secondary">
          No images available
        </Typography>
      </Box>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <Box sx={{ 
        height: '400px', 
        position: 'relative',
        borderRadius: '15px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5'
      }}>
        <img
          src={images[currentIndex]?.url}
          alt={images[currentIndex]?.title || `${projectName} Image ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Property+Image';
          }}
        />
        
        {images.length > 1 && (
          <>
            <IconButton
              onClick={prevImage}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <IconButton
              onClick={nextImage}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)',
                }
              }}
            >
              <ArrowForward />
            </IconButton>
          </>
        )}

        {images.length > 1 && (
          <Box sx={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            backgroundColor: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem'
          }}>
            {currentIndex + 1} / {images.length}
          </Box>
        )}
      </Box>
    </Box>
  );
};

// File Upload Component
const FileUploadSection = ({ 
  title, 
  accept, 
  onFileUpload, 
  uploading,
  description 
}: { 
  title: string;
  accept: string;
  onFileUpload: (file: File) => void;
  uploading: boolean;
  description: string;
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    onFileUpload(files[0]);
    event.target.value = '';
  };

  return (
    <Box sx={{ mb: 2, p: 2, border: '1px dashed #e0e0e0', borderRadius: '8px', backgroundColor: '#fafafa' }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
        {title}
      </Typography>
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          disabled={uploading}
          sx={{
            width: '150px',
            borderRadius: '8px',
            textTransform: 'none',
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#115293',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            }
          }}
        >
          Choose File
          <input
            type="file"
            hidden
            accept={accept}
            onChange={handleFileChange}
          />
        </Button>
        <Typography variant="caption" color="text.secondary">
          {description}
        </Typography>
        {uploading && (
          <Box display="flex" alignItems="center" gap={1}>
            <CircularProgress size={16} />
            <Typography variant="caption">Uploading...</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

// Property Type Form Component
const PropertyTypeForm = ({
  propertyType,
  index,
  onChange,
  onRemove
}: {
  propertyType: PropertyType;
  index: number;
  onChange: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
}) => {
  const isResidential = propertyType.propertyType === 'residential';
  const isCommercial = propertyType.propertyType === 'commercial';
  
  // Upload states for this specific property type
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingFloorPlans, setUploadingFloorPlans] = useState(false);

  // Handle image upload for this property type
  const handleImageUpload = async (file: File) => {
    setUploadingImages(true);

    try {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        const uploadedImage = {
          url: uploadResponse.data.url,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          isPrimary: (propertyType.images || []).length === 0,
          uploadedAt: new Date()
        };

        const updatedImages = [...(propertyType.images || []), uploadedImage];
        onChange(index, 'images', updatedImages);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle floor plan upload for this property type
  const handleFloorPlanUpload = async (file: File) => {
    setUploadingFloorPlans(true);

    try {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Floor plan size should be less than 5MB');
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        const uploadedFloorPlan = {
          url: uploadResponse.data.url,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          isPrimary: (propertyType.floorPlan || []).length === 0,
          uploadedAt: new Date()
        };

        const updatedFloorPlans = [...(propertyType.floorPlan || []), uploadedFloorPlan];
        onChange(index, 'floorPlan', updatedFloorPlans);
        toast.success('Floor plan uploaded successfully');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Floor plan upload error:', error);
      toast.error(error.message || 'Failed to upload floor plan');
    } finally {
      setUploadingFloorPlans(false);
    }
  };

  // Remove image from this property type
  const removeImage = (imageIndex: number) => {
    const updatedImages = (propertyType.images || []).filter((_, i) => i !== imageIndex);
    onChange(index, 'images', updatedImages);
  };

  // Remove floor plan from this property type
  const removeFloorPlan = (floorPlanIndex: number) => {
    const updatedFloorPlans = (propertyType.floorPlan || []).filter((_, i) => i !== floorPlanIndex);
    onChange(index, 'floorPlan', updatedFloorPlans);
  };

  // Set primary image for this property type
  const setPrimaryImage = (imageIndex: number) => {
    const updatedImages = (propertyType.images || []).map((img, i) => ({
      ...img,
      isPrimary: i === imageIndex
    }));
    onChange(index, 'images', updatedImages);
  };

  // Set primary floor plan for this property type
  const setPrimaryFloorPlan = (floorPlanIndex: number) => {
    const updatedFloorPlans = (propertyType.floorPlan || []).map((plan, i) => ({
      ...plan,
      isPrimary: i === floorPlanIndex
    }));
    onChange(index, 'floorPlan', updatedFloorPlans);
  };

  return (
    <Paper sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0', borderRadius: '15px' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isResidential ? '🏠 Residential' : '🏢 Commercial'} Type {index + 1}
        </Typography>
        <IconButton onClick={() => onRemove(index)} color="error" size="small">
          <Delete />
        </IconButton>
      </Box>

      <Grid container spacing={2}>
        {/* Property Type */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Property Type *</InputLabel>
            <Select
              value={propertyType.propertyType}
              onChange={(e) => onChange(index, 'propertyType', e.target.value)}
              label="Property Type *"
            >
              <MenuItem value="residential">
                <Home sx={{ mr: 1 }} />
                Residential
              </MenuItem>
              <MenuItem value="commercial">
                <Business sx={{ mr: 1 }} />
                Commercial
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Price */}
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            label="Price *"
            value={propertyType.price}
            onChange={(e) => onChange(index, 'price', e.target.value)}
            placeholder="e.g., ₹1.2 Cr onwards"
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Payment Plan */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Payment Plan *"
            value={propertyType.paymentPlan}
            onChange={(e) => onChange(index, 'paymentPlan', e.target.value)}
            placeholder="e.g., 20:80, Construction Linked"
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Description */}
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            label="Description"
            value={propertyType.description}
            onChange={(e) => onChange(index, 'description', e.target.value)}
            multiline
            rows={2}
            placeholder="Describe this property type..."
            sx={{ mb: 2 }}
          />
        </Grid>

        {/* Common Area Fields for Both Types */}
        {(isResidential || isCommercial) && (
          <>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                required
                label="Carpet Area"
                value={propertyType.carpetArea || ''}
                onChange={(e) => onChange(index, 'carpetArea', e.target.value)}
                placeholder="e.g., 1200 sq.ft."
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Built-up Area"
                value={propertyType.builtUpArea || ''}
                onChange={(e) => onChange(index, 'builtUpArea', e.target.value)}
                placeholder="e.g., 1400 sq.ft."
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Loading Area"
                value={propertyType.loadingArea || ''}
                onChange={(e) => onChange(index, 'loadingArea', e.target.value)}
                placeholder="e.g., 1800 sq.ft."
                sx={{ mb: 2 }}
              />
            </Grid>
          </>
        )}

        {/* Residential Specific Fields */}
        {isResidential && (
          <>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Bedrooms *"
                type="number"
                value={propertyType.bedrooms || ''}
                onChange={(e) => onChange(index, 'bedrooms', parseInt(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Bathrooms *"
                type="number"
                value={propertyType.bathrooms || ''}
                onChange={(e) => onChange(index, 'bathrooms', parseInt(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Toilets *"
                type="number"
                value={propertyType.toilet || ''}
                onChange={(e) => onChange(index, 'toilet', parseInt(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Balcony *"
                type="number"
                value={propertyType.balcony || ''}
                onChange={(e) => onChange(index, 'balcony', parseInt(e.target.value) || 0)}
                sx={{ mb: 2 }}
              />
            </Grid>
          </>
        )}

        {/* Features */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Features</InputLabel>
            <Select
              multiple
              value={propertyType.features || []}
              onChange={(e) => onChange(index, 'features', e.target.value)}
              input={<OutlinedInput label="Features" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="Swimming Pool">Swimming Pool</MenuItem>
              <MenuItem value="Gym">Gym</MenuItem>
              <MenuItem value="Clubhouse">Clubhouse</MenuItem>
              <MenuItem value="Children's Play Area">Children's Play Area</MenuItem>
              <MenuItem value="24/7 Security">24/7 Security</MenuItem>
              <MenuItem value="Power Backup">Power Backup</MenuItem>
              <MenuItem value="Landscaped Gardens">Landscaped Gardens</MenuItem>
              <MenuItem value="Jogging Track">Jogging Track</MenuItem>
              <MenuItem value="Sports Facilities">Sports Facilities</MenuItem>
              <MenuItem value="Parking">Parking</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Amenities */}
        <Grid size={{ xs: 12, md: 6 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Amenities</InputLabel>
            <Select
              multiple
              value={propertyType.amenities || []}
              onChange={(e) => onChange(index, 'amenities', e.target.value)}
              input={<OutlinedInput label="Amenities" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map((value) => (
                    <Chip key={value} label={value} size="small" color="primary" />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="Wi-Fi Connectivity">Wi-Fi Connectivity</MenuItem>
              <MenuItem value="Cafeteria">Cafeteria</MenuItem>
              <MenuItem value="Community Hall">Community Hall</MenuItem>
              <MenuItem value="Yoga/Meditation Area">Yoga/Meditation Area</MenuItem>
              <MenuItem value="Convenience Store">Convenience Store</MenuItem>
              <MenuItem value="ATM">ATM</MenuItem>
              <MenuItem value="Salon/Spa">Salon/Spa</MenuItem>
              <MenuItem value="Pet Area">Pet Area</MenuItem>
              <MenuItem value="Garbage Disposal">Garbage Disposal</MenuItem>
              <MenuItem value="Water Supply">Water Supply</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Images Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
            Property Type Images
          </Typography>
          
          <FileUploadSection
            title="Upload Property Type Images"
            accept="image/*"
            onFileUpload={handleImageUpload}
            uploading={uploadingImages}
            description="JPEG, PNG, GIF, WebP (Max 5MB)"
          />

          {(propertyType.images || []).length > 0 && (
            <Paper sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: '10px', mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Images ({(propertyType.images || []).length})
              </Typography>
              <Grid container spacing={1}>
                {(propertyType.images || []).map((image, imageIndex) => (
                  <Grid size={{ xs: 6, md: 4, lg: 3 }} key={imageIndex}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        position: 'relative',
                        border: image.isPrimary ? '2px solid #1976d2' : '1px solid #e0e0e0'
                      }}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <img
                          src={image.url}
                          alt={image.title}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x80?text=Image';
                          }}
                        />
                        <Typography variant="caption" display="block" noWrap title={image.title}>
                          {image.title}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                          {!image.isPrimary && (
                            <Button
                              size="small"
                              onClick={() => setPrimaryImage(imageIndex)}
                              sx={{ minWidth: 'auto', p: 0.5 }}
                            >
                              Set Primary
                            </Button>
                          )}
                          {image.isPrimary && (
                            <Chip 
                              label="Primary" 
                              size="small" 
                              color="primary" 
                              sx={{ height: 20, fontSize: '0.6rem' }}
                            />
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => removeImage(imageIndex)}
                            color="error"
                            sx={{ p: 0.5 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Grid>

        {/* Floor Plans Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
            Floor Plans
          </Typography>
          
          <FileUploadSection
            title="Upload Floor Plans"
            accept="image/*"
            onFileUpload={handleFloorPlanUpload}
            uploading={uploadingFloorPlans}
            description="JPEG, PNG, GIF, WebP (Max 5MB)"
          />

          {(propertyType.floorPlan || []).length > 0 && (
            <Paper sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: '10px', mt: 1 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Uploaded Floor Plans ({(propertyType.floorPlan || []).length})
              </Typography>
              <Grid container spacing={1}>
                {(propertyType.floorPlan || []).map((floorPlan, floorPlanIndex) => (
                  <Grid size={{ xs: 6, md: 4, lg: 3 }} key={floorPlanIndex}>
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        position: 'relative',
                        border: floorPlan.isPrimary ? '2px solid #1976d2' : '1px solid #e0e0e0'
                      }}
                    >
                      <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                        <img
                          src={floorPlan.url}
                          alt={floorPlan.title}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x80?text=Floor+Plan';
                          }}
                        />
                        <Typography variant="caption" display="block" noWrap title={floorPlan.title}>
                          {floorPlan.title}
                        </Typography>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                          {!floorPlan.isPrimary && (
                            <Button
                              size="small"
                              onClick={() => setPrimaryFloorPlan(floorPlanIndex)}
                              sx={{ minWidth: 'auto', p: 0.5 }}
                            >
                              Set Primary
                            </Button>
                          )}
                          {floorPlan.isPrimary && (
                            <Chip 
                              label="Primary" 
                              size="small" 
                              color="primary" 
                              sx={{ height: 20, fontSize: '0.6rem' }}
                            />
                          )}
                          <IconButton 
                            size="small" 
                            onClick={() => removeFloorPlan(floorPlanIndex)}
                            color="error"
                            sx={{ p: 0.5 }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};


// Filter types and main component
interface FilterState {
  status: string[];
  features: string[];
  amenities: string[];
  priceRange: {
    min: string;
    max: string;
  };
  builderName: string;
  location: string;
  propertyType: string[];
}

interface ValidationErrors {
  projectName?: string;
  builderName?: string;
  description?: string;
  location?: string;
  propertyTypes?: string;
  status?: string;
  mapLocation?: string;
  [key: string]: string | undefined;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    features: [],
    amenities: [],
    priceRange: {
      min: "",
      max: "",
    },
    builderName: "",
    location: "",
    propertyType: [],
  });
  
  const [showFilters, setShowFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'image' | 'brochure' | 'creative' | 'video' | null>(null);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Updated form data structure
  const [formData, setFormData] = useState({
    projectName: "",
    builderName: "",
    description: "",
    location: "",
    propertyTypes: [] as PropertyType[],
    status: [] as string[],
    nearby: [] as string[],
    projectHighlights: [] as string[],
    mapLocation: { lat: 0, lng: 0 },
    images: [] as { url: string; title?: string; description?: string; isPrimary?: boolean }[],
    brochureUrls: [] as { title: string; url: string; type: string }[],
    creatives: [] as { title: string; url: string; type: string }[],
    videoFiles: [] as { title: string; url: string; type: string }[]
  });
  
  // Form input states
  const [newNearby, setNewNearby] = useState("");
  const [newProjectHighlight, setNewProjectHighlight] = useState("");

  // Filter options
  const statusOptions = [
    "Ready to Move",
    "Under Construction",
    "New Launch",
    "Pre Launch",
    "Sold Out",
    "Coming Soon"
  ];

  const featureOptions = [
    "Swimming Pool",
    "Gym",
    "Clubhouse",
    "Children's Play Area",
    "24/7 Security",
    "Power Backup",
    "Landscaped Gardens",
    "Jogging Track",
    "Sports Facilities",
    "Parking"
  ];

  const amenityOptions = [
    "Wi-Fi Connectivity",
    "Cafeteria",
    "Community Hall",
    "Yoga/Meditation Area",
    "Convenience Store",
    "ATM",
    "Salon/Spa",
    "Pet Area",
    "Garbage Disposal",
    "Water Supply"
  ];

  const propertyTypeOptions = [
    "Residential",
    "Commercial"
  ];

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.propertyType.length > 0) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (filters.builderName) count++;
    if (filters.location) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Apply filters when debounced search term or filters change
  useEffect(() => {
    applyFilters();
  }, [debouncedSearchTerm, properties, filters]);

  // Check form validity whenever formData changes
  useEffect(() => {
    const checkFormValidity = () => {
      const valid = (
        formData.projectName?.trim().length >= 2 &&
        formData.projectName?.trim().length <= 200 &&
        formData.builderName?.trim().length >= 2 &&
        formData.builderName?.trim().length <= 100 &&
        formData.description?.trim().length >= 10 &&
        formData.description?.trim().length <= 2000 &&
        formData.location?.trim().length > 0 &&
        formData.propertyTypes.length > 0 &&
        formData.status.length > 0 &&
        (!formData.mapLocation.lat || 
         !formData.mapLocation.lng || 
         (formData.mapLocation.lat >= -90 && 
          formData.mapLocation.lat <= 90 && 
          formData.mapLocation.lng >= -180 && 
          formData.mapLocation.lng <= 180))
      );
      setIsFormValid(valid);
    };

    checkFormValidity();
  }, [formData]);

  const loadProperties = async (search = "") => {
    try {
      setLoading(true);
      const response = await propertyService.getAllProperties(search);
      if (response.success) {
        setProperties(response.data);
      } else {
        throw new Error(response.message || "Failed to load properties");
      }
    } catch (error: any) {
      console.error('Error loading properties:', error);
      toast.error(error.message || "Failed to load properties");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...properties];

    if (debouncedSearchTerm) {
      filtered = filtered.filter(property =>
        property.projectName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.builderName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.location?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        property.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    if (filters.status.length > 0) {
      filtered = filtered.filter(property =>
        property.status?.some(status => filters.status.includes(status))
      );
    }

    if (filters.propertyType.length > 0) {
      filtered = filtered.filter(property =>
        property.propertyTypes?.some(type => 
          filters.propertyType.includes(type.propertyType === 'residential' ? 'Residential' : 'Commercial')
        )
      );
    }

    if (filters.builderName) {
      filtered = filtered.filter(property =>
        property.builderName?.toLowerCase().includes(filters.builderName.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  };

  // Filter handlers
  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handlePriceRangeChange = (field: 'min' | 'max') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [field]: e.target.value
      }
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      status: [],
      features: [],
      amenities: [],
      propertyType: [],
      priceRange: {
        min: "",
        max: "",
      },
      builderName: "",
      location: "",
    });
    setSearchTerm("");
  };

  const removeFilter = (filterType: keyof FilterState, value?: string) => {
    if (value) {
      setFilters(prev => ({
        ...prev,
        [filterType]: (prev[filterType] as string[]).filter(item => item !== value)
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [filterType]: Array.isArray(prev[filterType]) ? [] : ""
      }));
    }
  };

  // Search handler with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    applyFilters();
  };

  // File upload handlers
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('image');

    try {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP)');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        const uploadedImage = {
          url: uploadResponse.data.url,
          title: file.name.replace(/\.[^/.]+$/, ""),
          description: "",
          isPrimary: formData.images.length === 0
        };

        setFormData(prev => ({
          ...prev,
          images: [...prev.images, uploadedImage]
        }));

        toast.success('Image uploaded successfully');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleBrochureUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('brochure');

    try {
      const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validDocTypes.includes(file.type)) {
        toast.error('Please select a PDF or Word document');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        const uploadedBrochure = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: uploadResponse.data.url,
          type: "PDF Document"
        };

        setFormData(prev => ({
          ...prev,
          brochureUrls: [...prev.brochureUrls, uploadedBrochure]
        }));

        toast.success('Brochure uploaded successfully');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Brochure upload error:', error);
      toast.error(error.message || 'Failed to upload brochure');
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleCreativeUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('creative');

    try {
      const validCreativeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf'];
      if (!validCreativeTypes.includes(file.type)) {
        toast.error('Please select a valid image or PDF file');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        const uploadedCreative = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: uploadResponse.data.url,
          type: file.type.includes('image') ? 'Image' : 'PDF Document'
        };

        setFormData(prev => ({
          ...prev,
          creatives: [...prev.creatives, uploadedCreative]
        }));

        toast.success('Creative asset uploaded successfully');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Creative upload error:', error);
      toast.error(error.message || 'Failed to upload creative asset');
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setUploadingType('video');

    try {
      const validVideoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/quicktime'];
      if (!validVideoTypes.includes(file.type)) {
        toast.error('Please select a valid video file (MP4, MOV, AVI, MKV)');
        return;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error('Video size should be less than 50MB');
        return;
      }

      const uploadResponse = await uploadService.uploadFile(file);
      
      if (uploadResponse.success && uploadResponse.data) {
        const uploadedVideo = {
          title: file.name.replace(/\.[^/.]+$/, ""),
          url: uploadResponse.data.url,
          type: "Video File"
        };

        setFormData(prev => ({
          ...prev,
          videoFiles: [...prev.videoFiles, uploadedVideo]
        }));

        toast.success('Video uploaded successfully');
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast.error(error.message || 'Failed to upload video');
    } finally {
      setUploading(false);
      setUploadingType(null);
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!formData.projectName?.trim()) {
      errors.projectName = "Project name is required";
    } else if (formData.projectName.trim().length < 2) {
      errors.projectName = "Project name must be at least 2 characters";
    } else if (formData.projectName.trim().length > 200) {
      errors.projectName = "Project name cannot exceed 200 characters";
    }

    if (!formData.builderName?.trim()) {
      errors.builderName = "Builder name is required";
    } else if (formData.builderName.trim().length < 2) {
      errors.builderName = "Builder name must be at least 2 characters";
    } else if (formData.builderName.trim().length > 100) {
      errors.builderName = "Builder name cannot exceed 100 characters";
    }

    if (!formData.description?.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      errors.description = "Description must be at least 10 characters";
    } else if (formData.description.trim().length > 2000) {
      errors.description = "Description cannot exceed 2000 characters";
    }

    if (!formData.location?.trim()) {
      errors.location = "Location is required";
    }

    if (formData.propertyTypes.length === 0) {
      errors.propertyTypes = "At least one property type is required";
    } else {
      formData.propertyTypes.forEach((type, index) => {
        if (!type.price?.trim()) {
          errors[`propertyType_${index}_price`] = `Price is required for property type ${index + 1}`;
        }
        if (!type.paymentPlan?.trim()) {
          errors[`propertyType_${index}_paymentPlan`] = `Payment plan is required for property type ${index + 1}`;
        }
        if (type.propertyType === 'residential') {
          if (type.bedrooms === undefined || type.bedrooms < 0) {
            errors[`propertyType_${index}_bedrooms`] = `Bedrooms are required for residential property type ${index + 1}`;
          }
        }
        if (type.propertyType === 'commercial') {
          if (!type.carpetArea?.trim()) {
            errors[`propertyType_${index}_carpetArea`] = `Carpet area is required for commercial property type ${index + 1}`;
          }
        }
      });
    }

    if (formData.status.length === 0) {
      errors.status = "At least one status is required";
    }

    if ((formData.mapLocation.lat && !formData.mapLocation.lng) || 
        (!formData.mapLocation.lat && formData.mapLocation.lng)) {
      errors.mapLocation = "Both latitude and longitude are required for map location";
    }

    if (formData.mapLocation.lat && formData.mapLocation.lng) {
      if (formData.mapLocation.lat < -90 || formData.mapLocation.lat > 90) {
        errors.mapLocation = "Latitude must be between -90 and 90";
      }
      if (formData.mapLocation.lng < -180 || formData.mapLocation.lng > 180) {
        errors.mapLocation = "Longitude must be between -180 and 180";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Input change handler with validation clearing
  const handleInputChangeWithValidation = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (validationErrors[field as keyof ValidationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Function to get validation messages for tooltip
  const getValidationMessages = (): string[] => {
    const messages: string[] = [];
    
    if (!formData.projectName?.trim() || formData.projectName.trim().length < 2) {
      messages.push("• Project name (min 2 characters)");
    }
    
    if (!formData.builderName?.trim() || formData.builderName.trim().length < 2) {
      messages.push("• Builder name (min 2 characters)");
    }
    
    if (!formData.description?.trim() || formData.description.trim().length < 10) {
      messages.push("• Description (min 10 characters)");
    }
    
    if (!formData.location?.trim()) {
      messages.push("• Location");
    }
    
    if (formData.propertyTypes.length === 0) {
      messages.push("• At least one property type");
    }
    
    if (formData.status.length === 0) {
      messages.push("• At least one status");
    }
    
    return messages;
  };

  // Add new property type
  const addPropertyType = (type: 'residential' | 'commercial') => {
    const baseType: PropertyType = {
      propertyType: type,
      description: "",
      price: "",
      paymentPlan: "",
      features: [],
      amenities: [],
      images: [],
      floorPlan: [],
      isActive: true
    };

    const specificFields = type === 'residential' 
      ? { bedrooms: 0, bathrooms: 0, toilet: 0, balcony: 0 }
      : { carpetArea: "", builtUpArea: "", loadingArea: "" };

    const newPropertyType = { ...baseType, ...specificFields };
    
    setFormData(prev => ({
      ...prev,
      propertyTypes: [...prev.propertyTypes, newPropertyType]
    }));

    if (validationErrors.propertyTypes) {
      setValidationErrors(prev => ({ ...prev, propertyTypes: undefined }));
    }
  };

  // Update property type
  const updatePropertyType = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.map((type, i) => 
        i === index ? { ...type, [field]: value } : type
      )
    }));

    // Clear validation error for this field
    const errorKey = `propertyType_${index}_${field}`;
    if (validationErrors[errorKey]) {
      setValidationErrors(prev => ({
        ...prev,
        [errorKey]: undefined
      }));
    }
  };

  // Remove property type
  const removePropertyType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      propertyTypes: prev.propertyTypes.filter((_, i) => i !== index)
    }));
  };

  const handleOpenDialog = (property: Property | null = null) => {
    if (property) {
      setEditingProperty(property);
      setFormData({
        projectName: property.projectName || "",
        builderName: property.builderName || "",
        description: property.description || "",
        location: property.location || "",
        propertyTypes: property.propertyTypes || [],
        status: property.status || [],
        nearby: property.nearby || [],
        projectHighlights: property.projectHighlights || [],
        mapLocation: property.mapLocation || { lat: 0, lng: 0 },
        images: property.images || [],
        brochureUrls: property.brochureUrls || [],
        creatives: property.creatives || [],
        videoFiles: property.videoFiles || []
      });
    } else {
      setEditingProperty(null);
      setFormData({
        projectName: "",
        builderName: "",
        description: "",
        location: "",
        propertyTypes: [],
        status: [],
        nearby: [],
        projectHighlights: [],
        mapLocation: { lat: 0, lng: 0 },
        images: [],
        brochureUrls: [],
        creatives: [],
        videoFiles: []
      });
    }
    setValidationErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingProperty(null);
    setNewNearby("");
    setNewProjectHighlight("");
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

  // Download handlers
  const handleDownloadBrochure = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.pdf`
        : `${propertyName.replace(/\s+/g, '_')}_Brochure_${index + 1}.pdf`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Brochure download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleDownloadCreative = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const extension = url.split('.').pop() || 'jpg';
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        : `${propertyName.replace(/\s+/g, '_')}_Creative_${index + 1}.${extension}`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Creative asset download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleDownloadImage = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const extension = url.split('.').pop() || 'jpg';
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        : `${propertyName.replace(/\s+/g, '_')}_Image_${index + 1}.${extension}`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Image download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleDownloadVideo = (url: string, propertyName: string, index: number, title?: string) => {
    try {
      const link = document.createElement('a');
      link.href = url;
      const extension = url.split('.').pop() || 'mp4';
      const fileName = title 
        ? `${propertyName.replace(/\s+/g, '_')}_${title.replace(/[^a-z0-9]/gi, '_')}.${extension}`
        : `${propertyName.replace(/\s+/g, '_')}_Video_${index + 1}.${extension}`;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Video download started");
    } catch (error) {
      toast.error("Download failed");
    }
  };

  const handleDownloadAllBrochures = (property: Property) => {
    if (property.brochureUrls && property.brochureUrls.length > 0) {
      property.brochureUrls.forEach((brochure: any, index: number) => {
        setTimeout(() => handleDownloadBrochure(brochure.url, property.projectName, index, brochure.title), index * 500);
      });
      toast.success(`Downloading ${property.brochureUrls.length} brochures`);
    }
  };

  const handleDownloadAllCreatives = (property: Property) => {
    if (property.creatives && property.creatives.length > 0) {
      property.creatives.forEach((creative: any, index: number) => {
        setTimeout(() => handleDownloadCreative(creative.url, property.projectName, index, creative.title), index * 500);
      });
      toast.success(`Downloading ${property.creatives.length} creative assets`);
    }
  };

  const handleDownloadAllImages = (property: Property) => {
    if (property.images && property.images.length > 0) {
      property.images.forEach((image: any, index: number) => {
        setTimeout(() => handleDownloadImage(image.url, property.projectName, index, image.title), index * 500);
      });
      toast.success(`Downloading ${property.images.length} images`);
    }
  };

  const handleDownloadAllVideos = (property: Property) => {
    if (property.videoFiles && property.videoFiles.length > 0) {
      property.videoFiles.forEach((video: any, index: number) => {
        setTimeout(() => handleDownloadVideo(video.url, property.projectName, index, video.title), index * 500);
      });
      toast.success(`Downloading ${property.videoFiles.length} videos`);
    }
  };

  // Form handlers
  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleMapLocationChange = (field: 'lat' | 'lng') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      mapLocation: { ...prev.mapLocation, [field]: value }
    }));
    if (validationErrors.mapLocation) {
      setValidationErrors(prev => ({ ...prev, mapLocation: undefined }));
    }
  };

  // Handle map location change from draggable map
  const handleMapLocationUpdate = (lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      mapLocation: { lat, lng }
    }));
    if (validationErrors.mapLocation) {
      setValidationErrors(prev => ({ ...prev, mapLocation: undefined }));
    }
  };

  // Handle location search selection
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setFormData(prev => ({
      ...prev,
      location: address,
      mapLocation: { lat, lng }
    }));
    if (validationErrors.location) {
      setValidationErrors(prev => ({ ...prev, location: undefined }));
    }
    if (validationErrors.mapLocation) {
      setValidationErrors(prev => ({ ...prev, mapLocation: undefined }));
    }
  };

  // Array field handlers
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const setPrimaryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => ({ ...img, isPrimary: i === index }))
    }));
  };

  const removeBrochureUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      brochureUrls: prev.brochureUrls.filter((_, i) => i !== index)
    }));
  };

  const removeCreative = (index: number) => {
    setFormData(prev => ({
      ...prev,
      creatives: prev.creatives.filter((_, i) => i !== index)
    }));
  };

  const removeVideoFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videoFiles: prev.videoFiles.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    try {
      const toastId = toast.loading(editingProperty ? "Updating property..." : "Creating property...");
      
      if (editingProperty && editingProperty._id) {
        await propertyService.updateProperty(editingProperty._id, formData);
        toast.success("Property updated successfully", { id: toastId });
      } else {
        await propertyService.createProperty(formData);
        toast.success("Property added successfully", { id: toastId });
      }
      
      handleCloseDialog();
      loadProperties();
      
    } catch (error: any) {
      console.error('Error saving property:', error);
      toast.error(error.message || "Failed to save property");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const toastId = toast.loading("Deleting property...");
      
      await propertyService.deleteProperty(id);
      
      toast.success("Property deleted successfully", { id: toastId });
      loadProperties();
      
    } catch (error: any) {
      console.error('Error deleting property:', error);
      toast.error(error.message || "Failed to delete property");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading properties...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            fontSize: '14px',
          },
          duration: 3000,
        }}
      />

      {/* Header */}
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 3,
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: '15px'
        }}
      >
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Grid item xs={12} md="auto">
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ textAlign: { xs: "center", md: "left" }, mb: { xs: 2, md: 0 } }}
            >
              Properties
            </Typography>
          </Grid>

          <Grid
            item
            xs={12}
            md
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            gap={1}
            alignItems="center"
            justifyContent={{ xs: "center", md: "flex-end" }}
            sx={{ maxWidth: "100%" }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search properties by name, builder, location..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "25px",
                  backgroundColor: "white",
                },
              }}
            />

            <Grid item sx={{ width: { xs: '100%', sm: 'auto' }, display: 'flex', flexWrap: 'wrap', gap: 1,  justifyContent: { xs: 'center', md: 'flex-end' } }}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: "8px",
                  whiteSpace: "nowrap",
                  position: 'relative',
                }}
              >
                Filters
                {activeFiltersCount > 0 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      backgroundColor: '#1976d2',
                      color: 'white',
                      borderRadius: '50%',
                      width: 20,
                      height: 20,
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {activeFiltersCount}
                  </Box>
                )}
              </Button>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  backgroundColor: "#1976d2",
                  borderRadius: "8px",
                  px: 3,
                  whiteSpace: "nowrap",
                  "&:hover": { backgroundColor: "#115293" },
                }}
              >
                Add Property
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {(searchTerm || activeFiltersCount > 0) && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, textAlign: { xs: "center", md: "left" } }}
          >
            Found {filteredProperties.length} property
            {filteredProperties.length !== 1 ? "ies" : ""} 
            {searchTerm && ` matching "${searchTerm}"`}
            {activeFiltersCount > 0 && ` with ${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied`}
          </Typography>
        )}

        {(filters.status.length > 0 || filters.propertyType.length > 0 || 
          filters.priceRange.min || filters.priceRange.max || filters.builderName || filters.location) && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {filters.status.map((status, index) => (
              <Chip
                key={status}
                label={`Status: ${status}`}
                onDelete={() => removeFilter('status', status)}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {filters.propertyType.map((type, index) => (
              <Chip
                key={type}
                label={`Type: ${type}`}
                onDelete={() => removeFilter('propertyType', type)}
                size="small"
                color="secondary"
                variant="outlined"
              />
            ))}
            {(filters.priceRange.min || filters.priceRange.max) && (
              <Chip
                label={`Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}`}
                onDelete={() => removeFilter('priceRange')}
                size="small"
                color="warning"
                variant="outlined"
              />
            )}
            {filters.builderName && (
              <Chip
                label={`Builder: ${filters.builderName}`}
                onDelete={() => removeFilter('builderName')}
                size="small"
                color="info"
                variant="outlined"
              />
            )}
            {filters.location && (
              <Chip
                label={`Location: ${filters.location}`}
                onDelete={() => removeFilter('location')}
                size="small"
                color="error"
                variant="outlined"
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Filters Panel */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: '15px', border: '1px solid #e0e0e0' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', fontWeight: 600 }}>
              <FilterList sx={{ mr: 1 }} />
              Filter Properties
            </Typography>
            <Button
              startIcon={<Clear />}
              onClick={clearAllFilters}
              size="small"
              sx={{ borderRadius: '8px' }}
            >
              Clear All
            </Button>
          </Box>
          
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  multiple
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  input={<OutlinedInput label="Status" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Property Type</InputLabel>
                <Select
                  multiple
                  value={filters.propertyType}
                  onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                  input={<OutlinedInput label="Property Type" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {propertyTypeOptions.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box display="flex" gap={2}>
                <TextField
                  fullWidth
                  label="Min Price"
                  value={filters.priceRange.min}
                  onChange={handlePriceRangeChange('min')}
                  placeholder="0"
                />
                <TextField
                  fullWidth
                  label="Max Price"
                  value={filters.priceRange.max}
                  onChange={handlePriceRangeChange('max')}
                  placeholder="No limit"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Builder Name"
                value={filters.builderName}
                onChange={(e) => handleFilterChange('builderName', e.target.value)}
                placeholder="Search by builder..."
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Search by location..."
              />
            </Grid>
          </Grid>
        </Paper>
      </Collapse>

      {/* Properties Grid */}
      <Grid container spacing={3}>
        {filteredProperties.map((property) => {
          const primaryImage = property.images?.find(img => img.isPrimary) || property.images?.[0];
          const priceRange = property.propertyTypes?.map(type => type.price).join(' - ');
        
          return (
            <Grid size={{ xs: 12, sm: 6, md: 6, lg: 4 }} key={property._id}>
              <Paper
                onClick={() => handleViewProperty(property)} 
                sx={{ 
                  p: 2, 
                  height: "15rem", 
                  transition: "transform 0.2s", 
                  "&:hover": { transform: "translateY(-4px)" },
                  backgroundImage: primaryImage ? `url(${primaryImage.url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    borderRadius: 'inherit',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between', 
                  cursor: 'pointer',
                  borderRadius: '15px'
                }}
              >
                <Box display="flex" justifyContent="flex-end" alignItems="flex-start">
                  <Box>
                    <IconButton size="small" onClick={() => handleViewProperty(property)} sx={{ color: 'white' }} title="Preview Property">
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenDialog(property); }} sx={{ color: 'white' }} title="Edit Property">
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(property._id!); }} sx={{ color: 'white' }} title="Delete Property">
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Box 
                  position="absolute" 
                  zIndex={1} 
                  sx={{ 
                    color: 'white',
                    textAlign: 'center', 
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    bottom: '10px', 
                    left: 0,
                    right: 0,
                    width: '100%'
                  }}
                >
                  <Typography variant="h6" fontWeight={600} sx={{ color: 'white' }}>
                    {property.projectName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }} gutterBottom>
                    by {property.builderName}
                  </Typography>
                  {priceRange && (
                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                      <CurrencyRupeeIcon sx={{ fontSize: '1rem', verticalAlign: 'middle' }} />
                      {priceRange}
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* Show message when no results found */}
      {filteredProperties.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 2, borderRadius: '15px' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {searchTerm || activeFiltersCount > 0 
              ? 'No properties found matching your search criteria.' 
              : 'No properties found.'}
          </Typography>
          {(searchTerm || activeFiltersCount > 0) && (
            <Button 
              variant="contained" 
              onClick={clearAllFilters}
              sx={{ mt: 2 }}
            >
              Clear Search & Filters
            </Button>
          )}
        </Paper>
      )}

      {/* View Property Dialog */}
      <Dialog open={openViewDialog} onClose={handleCloseViewDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h5" fontWeight={600}>
                {viewingProperty?.projectName}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                by {viewingProperty?.builderName}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            <Grid display={"flex"} flexWrap={'wrap'} gap={'1.5rem'} maxHeight={'100%'}>
              <Grid size={{ xs: 12, lg: 8 }}>
              {viewingProperty?.images && viewingProperty.images.length > 0 && (
                <Grid size={{ xs: 12, md: 12 }}>
                  <ImageCarousel 
                      images={viewingProperty.images} 
                      projectName={viewingProperty.projectName}
                    />
                </Grid>
              )}
              </Grid>
              <Grid size={{ xs: 12, lg: 4 }}>
                <Paper sx={{ p: 2, height: '100%', borderRadius: '15px' }}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                  
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOn fontSize="small" color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2">{viewingProperty?.location}</Typography>
                  </Box>
                  
                  <Typography variant="body2" paragraph>
                    {viewingProperty?.description}
                  </Typography>
                  
                  {viewingProperty?.nearby && viewingProperty.nearby.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>Nearby Places</Typography>
                      <Box display="flex" flexWrap="wrap" gap={0.5}>
                        {viewingProperty.nearby.map((place: string, index: number) => (
                          <Chip key={index} label={place} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
            
            {/* Property Types */}
            {viewingProperty?.propertyTypes && viewingProperty.propertyTypes.length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, borderRadius: '15px' }}>
                  <Typography variant="h6" gutterBottom>Property Types</Typography>
                  <Grid container spacing={2}>
                    {viewingProperty.propertyTypes.map((type, index) => (
                      <Grid size={{ xs: 12, md: 6 }} key={index}>
                        <Card variant="outlined" sx={{ borderRadius: '10px' }}>
                          <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {type.propertyType === 'residential' ? '🏠 Residential' : '🏢 Commercial'}
                              </Typography>
                              <Chip 
                                label={type.price} 
                                color="primary" 
                                size="small"
                                icon={<CurrencyRupeeIcon />}
                              />
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {type.description}
                            </Typography>
                            
                            <Typography variant="body2" gutterBottom>
                              <strong>Payment Plan:</strong> {type.paymentPlan}
                            </Typography>

                            {type.propertyType === 'residential' && (
                              <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
                                <Chip label={`${type.bedrooms} Beds`} size="small" variant="outlined" />
                                <Chip label={`${type.bathrooms} Baths`} size="small" variant="outlined" />
                                <Chip label={`${type.toilet} Toilets`} size="small" variant="outlined" />
                                <Chip label={`${type.balcony} Balcony`} size="small" variant="outlined" />
                              </Box>
                            )}

                            {type.propertyType === 'commercial' && (
                              <Box mb={1}>
                                <Typography variant="body2">
                                  <strong>Carpet Area:</strong> {type.carpetArea}
                                </Typography>
                                {type.builtUpArea && (
                                  <Typography variant="body2">
                                    <strong>Built-up Area:</strong> {type.builtUpArea}
                                  </Typography>
                                )}
                                {type.loadingArea && (
                                  <Typography variant="body2">
                                    <strong>Loading Area:</strong> {type.loadingArea}
                                  </Typography>
                                )}
                              </Box>
                            )}

                            {(type.features?.length > 0 || type.amenities?.length > 0) && (
                              <>
                                {type.features?.length > 0 && (
                                  <Box mb={1}>
                                    <Typography variant="caption" display="block" fontWeight={600}>
                                      Features:
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                      {type.features.slice(0, 3).map((feature, i) => (
                                        <Chip key={i} label={feature} size="small" />
                                      ))}
                                      {type.features.length > 3 && (
                                        <Chip label={`+${type.features.length - 3} more`} size="small" variant="outlined" />
                                      )}
                                    </Box>
                                  </Box>
                                )}
                                
                                {type.amenities?.length > 0 && (
                                  <Box>
                                    <Typography variant="caption" display="block" fontWeight={600}>
                                      Amenities:
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                                      {type.amenities.slice(0, 3).map((amenity, i) => (
                                        <Chip key={i} label={amenity} size="small" color="primary" />
                                      ))}
                                      {type.amenities.length > 3 && (
                                        <Chip label={`+${type.amenities.length - 3} more`} size="small" variant="outlined" />
                                      )}
                                    </Box>
                                  </Box>
                                )}
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, borderRadius: '15px' }}>
                <Typography variant="h6" gutterBottom>Status & Project Highlights</Typography>
                
                {viewingProperty?.status && viewingProperty.status.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Status</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                      {viewingProperty.status.map((statusItem: string, index: number) => (
                        <Chip 
                          key={index}
                          label={statusItem} 
                          size="small" 
                          color={statusItem === "Ready to Move" ? "success" : "warning"}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {viewingProperty?.projectHighlights && viewingProperty.projectHighlights.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Project Highlights</Typography>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {viewingProperty.projectHighlights.map((highlight: string, index: number) => (
                        <Chip 
                          key={index}
                          label={highlight} 
                          size="small" 
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Map Location */}
            {viewingProperty?.mapLocation && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper sx={{ p: 2, borderRadius: '15px' }}>
                  <Typography variant="h6" gutterBottom>Location</Typography>
                  <PropertyMap 
                    lat={viewingProperty.mapLocation.lat} 
                    lng={viewingProperty.mapLocation.lng}
                    projectName={viewingProperty.projectName}
                  />
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      Latitude: {viewingProperty.mapLocation.lat}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Longitude: {viewingProperty.mapLocation.lng}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            )}

            {/* Enhanced Media Assets with Download */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2, borderRadius: '15px' }}>
                <Typography variant="h6" gutterBottom>Media Assets</Typography>
                
                {viewingProperty?.brochureUrls && viewingProperty.brochureUrls.length > 0 && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2">
                        <Description fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Brochures ({viewingProperty.brochureUrls.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleDownloadAllBrochures(viewingProperty)}
                      >
                        Download All
                      </Button>
                    </Box>
                    <List dense>
                      {viewingProperty.brochureUrls.map((brochure: any, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={brochure.title || `Brochure ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {brochure.url.length > 50 ? `${brochure.url.substring(0, 50)}...` : brochure.url}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Type: {brochure.type}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadBrochure(brochure.url, viewingProperty.projectName, index, brochure.title)}
                              title="Download Brochure"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {viewingProperty?.creatives && viewingProperty.creatives.length > 0 && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2">
                        <Photo fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Creative Assets ({viewingProperty.creatives.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleDownloadAllCreatives(viewingProperty)}
                      >
                        Download All
                      </Button>
                    </Box>
                    <List dense>
                      {viewingProperty.creatives.map((creative: any, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={creative.title || `Creative ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {creative.url.length > 50 ? `${creative.url.substring(0, 50)}...` : creative.url}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Type: {creative.type}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadCreative(creative.url, viewingProperty.projectName, index, creative.title)}
                              title="Download Creative"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {viewingProperty?.videoFiles && viewingProperty.videoFiles.length > 0 && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="subtitle2">
                        <VideoLibrary fontSize="small" sx={{ mr: 0.5, verticalAlign: "middle" }} />
                        Uploaded Videos ({viewingProperty.videoFiles.length})
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Download />}
                        onClick={() => handleDownloadAllVideos(viewingProperty)}
                      >
                        Download All
                      </Button>
                    </Box>
                    <List dense>
                      {viewingProperty.videoFiles.map((video: any, index: number) => (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemText 
                            primary={video.title || `Video ${index + 1}`}
                            secondary={
                              <Box>
                                <Typography variant="caption" display="block">
                                  {video.url.length > 50 ? `${video.url.substring(0, 50)}...` : video.url}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Type: {video.type}
                                </Typography>
                              </Box>
                            }
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              size="small" 
                              onClick={() => handleDownloadVideo(video.url, viewingProperty.projectName, index, video.title)}
                              title="Download Video"
                            >
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {(!viewingProperty?.brochureUrls?.length && !viewingProperty?.creatives?.length && !viewingProperty?.videoFiles?.length) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No media assets available
                  </Typography>
                )}
              </Paper>
            </Grid>
            
            {/* Image Gallery with Download Functionality */}
            {viewingProperty?.images && viewingProperty.images.filter((img: any) => !img.isPrimary).length > 0 && (
              <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, borderRadius: '15px' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                      <Photo sx={{ mr: 1, verticalAlign: "middle" }} />
                      Image Gallery ({viewingProperty.images.filter((img: any) => !img.isPrimary).length})
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => handleDownloadAllImages(viewingProperty)}
                      size="small"
                    >
                      Download All Images
                    </Button>
                  </Box>
                  <Grid container spacing={1}>
                    {viewingProperty.images.filter((img: any) => !img.isPrimary).map((image: any, index: number) => (
                      <Grid size={{ xs: 6, md: 3 }} key={index}>
                        <Box position="relative" sx={{ borderRadius: '10px', overflow: 'hidden' }}>
                          <img
                            src={image.url}
                            alt={image.title || `Gallery Image ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '120px',
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150x120?text=Image';
                            }}
                          />
                          <Box
                            position="absolute"
                            top={4}
                            right={4}
                            sx={{
                              opacity: 0,
                              transition: 'opacity 0.2s',
                              '&:hover': { opacity: 1 },
                              '.MuiGrid-root:hover &': { opacity: 1 }
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleDownloadImage(image.url, viewingProperty.projectName, index, image.title)}
                              sx={{
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,0.9)',
                                }
                              }}
                              title="Download Image"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                        {image.title && (
                          <Typography variant="caption" display="block" mt={0.5}>
                            {image.title}
                          </Typography>
                        )}
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => {
            handleCloseViewDialog();
            handleOpenDialog(viewingProperty);
          }} startIcon={<Edit />}>
            Edit Property
          </Button>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Dialog with Enhanced Map */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', color: '#1976d2', borderRadius: '15px 15px 0 0' }}>
          <Typography variant="h5" fontWeight={600}>
            {editingProperty ? "Edit Property" : "Add New Property"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information <Typography component="span" color="error">*</Typography>
              </Typography>
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.projectName}
                onChange={handleInputChangeWithValidation("projectName")}
                required
                error={!!validationErrors.projectName}
                helperText={validationErrors.projectName || "Enter the project name (2-200 characters)"}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Builder Name"
                value={formData.builderName}
                onChange={handleInputChangeWithValidation("builderName")}
                required
                error={!!validationErrors.builderName}
                helperText={validationErrors.builderName || "Enter the builder name (2-100 characters)"}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth sx={{ mb: 2 }} error={!!validationErrors.status}>
                <InputLabel>Status *</InputLabel>
                <Select
                  multiple
                  value={formData.status || []}
                  onChange={(e) => {
                    const selectedStatus = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      status: typeof selectedStatus === "string"
                        ? selectedStatus.split(",")
                        : selectedStatus,
                    }));
                    if (validationErrors.status) {
                      setValidationErrors(prev => ({ ...prev, status: undefined }));
                    }
                  }}
                  input={<OutlinedInput label="Status *" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Ready to Move">Ready to Move</MenuItem>
                  <MenuItem value="Under Construction">Under Construction</MenuItem>
                  <MenuItem value="New Launch">New Launch</MenuItem>
                  <MenuItem value="Pre Launch">Pre Launch</MenuItem>
                  <MenuItem value="Sold Out">Sold Out</MenuItem>
                  <MenuItem value="Coming Soon">Coming Soon</MenuItem>
                </Select>
                {validationErrors.status && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {validationErrors.status}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6  }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Project Highlights</InputLabel>
                <Select
                  multiple
                  value={formData.projectHighlights || []}
                  onChange={(e) => {
                    const selectedProjectHighlights = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      projectHighlights: typeof selectedProjectHighlights === "string"
                        ? selectedProjectHighlights.split(",")
                        : selectedProjectHighlights,
                    }));
                  }}
                  input={<OutlinedInput label="ProjectHighlights" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="Gated Community">Gated Community</MenuItem>
                  <MenuItem value="Eco-Friendly">Eco-Friendly</MenuItem>
                  <MenuItem value="Luxury Living">Luxury Living</MenuItem>
                  <MenuItem value="Affordable Housing">Affordable Housing</MenuItem>
                  <MenuItem value="Smart Home Features">Smart Home Features</MenuItem>
                  <MenuItem value="Waterfront Property">Waterfront Property</MenuItem>
                  <MenuItem value="High-Rise Building">High-Rise Building</MenuItem>
                  <MenuItem value="Low-Rise Building">Low-Rise Building</MenuItem>
                  <MenuItem value="Vastu Compliant">Vastu Compliant</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12}}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleInputChangeWithValidation("description")}
                multiline
                rows={3}
                required
                error={!!validationErrors.description}
                helperText={validationErrors.description || "Enter project description (10-2000 characters)"}
                inputProps={{ maxLength: 2000 }}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Property Types Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 600 }}>
                Property Types <Typography component="span" color="error">*</Typography>
              </Typography>

              <Box display="flex" gap={2} mb={2}>
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={() => addPropertyType('residential')}
                  sx={{ borderRadius: '8px' }}
                >
                  Add Residential Type
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Business />}
                  onClick={() => addPropertyType('commercial')}
                  sx={{ borderRadius: '8px' }}
                >
                  Add Commercial Type
                </Button>
              </Box>

              {formData.propertyTypes.map((propertyType, index) => (
                <PropertyTypeForm
                  key={index}
                  propertyType={propertyType}
                  index={index}
                  onChange={updatePropertyType}
                  onRemove={removePropertyType}
                />
              ))}

              {validationErrors.propertyTypes && (
                <Typography color="error" variant="caption">
                  {validationErrors.propertyTypes}
                </Typography>
              )}
            </Grid>

            {/* Enhanced Location Section with Draggable Map */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 , fontWeight: 600 }}>
                Location <Typography component="span" color="error">*</Typography>
              </Typography>
            </Grid>
            
            {/* Location Search */}
            <Grid size={{ xs: 12 }}>
              <LocationSearch
                onLocationSelect={handleLocationSelect}
              />
            </Grid>

            {/* Interactive Draggable Map */}
            <Grid size={{ xs: 12 }}>
              <DraggablePropertyMap
                lat={formData.mapLocation.lat}
                lng={formData.mapLocation.lng}
                onLocationChange={handleMapLocationUpdate}
                isEditMode={true}
              />
            </Grid>

            {/* Manual Coordinates Input */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2, mb: 1, color: 'text.secondary' }}>
                Or enter coordinates manually:
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Latitude"
                type="number"
                value={formData.mapLocation.lat}
                onChange={handleMapLocationChange('lat')}
                inputProps={{ 
                  step: "any",
                  min: -90,
                  max: 90
                }}
                error={!!validationErrors.mapLocation}
                helperText={validationErrors.mapLocation || "Enter latitude (-90 to 90)"}
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Longitude"
                type="number"
                value={formData.mapLocation.lng}
                onChange={handleMapLocationChange('lng')}
                inputProps={{ 
                  step: "any",
                  min: -180,
                  max: 180
                }}
                error={!!validationErrors.mapLocation}
                helperText="Enter longitude (-180 to 180)"
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {/* Nearby Places */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Nearby Places</InputLabel>
                <Select
                  multiple
                  value={formData.nearby || []}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      nearby: typeof e.target.value === "string"
                        ? e.target.value.split(",")
                        : e.target.value,
                    }))
                  }
                  input={<OutlinedInput label="Nearby Places" />}
                  renderValue={(selected) => (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </div>
                  )}
                >
                  <MenuItem value="School">School</MenuItem>
                  <MenuItem value="Hospital">Hospital</MenuItem>
                  <MenuItem value="Mall">Mall</MenuItem>
                  <MenuItem value="Park">Park</MenuItem>
                  <MenuItem value="Metro Station">Metro Station</MenuItem>
                  <MenuItem value="Bus Stop">Bus Stop</MenuItem>
                  <MenuItem value="Airport">Airport</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* File Uploads Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 , fontWeight: 600 }}>
                File Uploads
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 4}}>
              <FileUploadSection
                title="Upload Property Images"
                accept="image/*"
                onFileUpload={handleImageUpload}
                uploading={uploading && uploadingType === 'image'}
                description="JPEG, PNG, GIF, WebP (Max 5MB)"
              />

              {formData.images.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: '10px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Uploaded Images ({formData.images.length})
                  </Typography>
                  <List dense>
                    {formData.images.map((image, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ mr: 2, flexShrink: 0 }}>
                          <img
                            src={image.url}
                            alt={image.title}
                            style={{
                              width: '60px',
                              height: '60px',
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60x60?text=Image';
                            }}
                          />
                        </Box>
                        <ListItemSecondaryAction>
                          {!image.isPrimary && (
                            <Button
                              size="small"
                              onClick={() => setPrimaryImage(index)}
                              sx={{ mr: 1 }}
                            >
                              Set Primary
                            </Button>
                          )}
                          <IconButton 
                            edge="end" 
                            onClick={() => removeImage(index)}
                            size="small"
                            color="error"
                          />
                            <Delete />
                          </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 4}}>
              <FileUploadSection
                title="Upload Brochures"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onFileUpload={handleBrochureUpload}
                uploading={uploading && uploadingType === 'brochure'}
                description="PDF, Word Documents (Max 10MB)"
              />
              
              {formData.brochureUrls.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: '10px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Brochures ({formData.brochureUrls.length})
                  </Typography>
                  <List dense>
                    {formData.brochureUrls.map((brochure, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Description sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeBrochureUrl(index)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 4}}>
              <FileUploadSection
                title="Upload Creative Assets"
                accept="image/*,.pdf,.doc,.docx"
                onFileUpload={handleCreativeUpload}
                uploading={uploading && uploadingType === 'creative'}
                description="Images, PDF Documents (Max 10MB)"
              />
              
              {formData.creatives.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: '10px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Creative Assets ({formData.creatives.length})
                  </Typography>
                  <List dense>
                    {formData.creatives.map((creative, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <Box sx={{ mr: 2, flexShrink: 0 }}>
                          {creative.type === 'Image' ? (
                            <img
                              src={creative.url}
                              alt={creative.title}
                              style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '4px'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=Creative';
                              }}
                            />
                          ) : (
                            <Description sx={{ fontSize: 40, color: 'primary.main' }} />
                          )}
                        </Box>
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeCreative(index)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FileUploadSection
                title="Upload Video Files"
                accept="video/*,.mp4,.mov,.avi,.mkv"
                onFileUpload={handleVideoUpload}
                uploading={uploading && uploadingType === 'video'}
                description="MP4, MOV, AVI, MKV (Max 50MB)"
              />
              
              {formData.videoFiles.length > 0 && (
                <Paper sx={{ p: 2, backgroundColor: '#fafafa', borderRadius: '10px' }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                    Uploaded Videos ({formData.videoFiles.length})
                  </Typography>
                  <List dense>
                    {formData.videoFiles.map((video, index) => (
                      <ListItem 
                        key={index} 
                        divider
                        sx={{ 
                          backgroundColor: 'white',
                          mb: 1,
                          borderRadius: 1,
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        <VideoLibrary sx={{ mr: 2, color: 'primary.main' }} />
                        <ListItemText
                          primary={video.title}
                          secondary={
                            <Box>
                              <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
                                {video.url.length > 50 ? `${video.url.substring(0, 50)}...` : video.url}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Type: {video.type}
                              </Typography>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={() => removeVideoFile(index)} 
                            size="small"
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0', borderRadius: '0 0 15px 15px' }}>
          <Button 
            onClick={handleCloseDialog} 
            sx={{ 
              borderRadius: '8px',
              px: 3,
              color: '#666',
              borderColor: '#666'
            }}
          >
            Cancel
          </Button>
          
          <Tooltip 
            title={
              !isFormValid ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Please fill all required fields:
                  </Typography>
                  <Box sx={{ maxHeight: '120px', overflow: 'auto' }}>
                    {getValidationMessages().map((msg, index) => (
                      <Typography key={index} variant="body2" sx={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                        {msg}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ) : (
                "All required fields are filled. You can now create the property."
              )
            }
            arrow
            placement="top"
          >
            <span>
              <Button 
                onClick={handleSubmit} 
                variant="contained"
                disabled={!isFormValid}
                sx={{ 
                  borderRadius: '8px',
                  px: 3,
                  backgroundColor: isFormValid ? '#1976d2' : '#e0e0e0',
                  color: isFormValid ? 'white' : '#9e9e9e',
                  "&:hover": isFormValid ? {
                    backgroundColor: '#115293',
                  } : {
                    backgroundColor: '#e0e0e0',
                  },
                  "&.Mui-disabled": {
                    backgroundColor: '#f5f5f5',
                    color: '#bdbdbd',
                    border: '1px solid #e0e0e0'
                  }
                }}
              >
                {editingProperty ? "Update Property" : "Create Property"}
              </Button>
            </span>
          </Tooltip>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


