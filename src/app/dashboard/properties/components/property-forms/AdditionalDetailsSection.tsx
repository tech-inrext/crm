import React, { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Box,
  Alert,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from "@mui/material";
import {
  LocationOn,
} from "@mui/icons-material";
import { toast } from "sonner";
import LeafletMap from "../../LeafletMap";
import { useDebounce } from "@/hooks/useDebounce";

interface AdditionalDetailsSectionProps {
  formData: any;
  setFormData: (data: any) => void;
  validationErrors: any;
}

const AdditionalDetailsSection: React.FC<AdditionalDetailsSectionProps> = ({
  formData,
  setFormData,
  validationErrors,
}) => {
  const [geocoding, setGeocoding] = useState(false);

  const geocodeAddress = async (address: string) => {
    // Ensure address is a string and has minimum length
    if (!address || typeof address !== 'string' || address.trim().length < 3) return;
    
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

  // Use debounce with proper typing
  const debouncedGeocode = useDebounce<string>(geocodeAddress, 1000);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const address = e.target.value;
    setFormData((prev: any) => ({ ...prev, location: address }));
    
    // Ensure address is a string before calling trim
    if (address && typeof address === 'string' && address.trim().length > 5) {
      debouncedGeocode(address);
    }
  };

  const handleManualGeocode = () => {
    const location = formData.location;
    if (location && typeof location === 'string' && location.trim().length > 3) {
      geocodeAddress(location);
    } else {
      toast.warning('Please enter a valid address first');
    }
  };

  // Safe check for map location
  const hasValidMapLocation = formData.mapLocation && 
    typeof formData.mapLocation.lat === 'number' && 
    typeof formData.mapLocation.lng === 'number' && 
    !isNaN(formData.mapLocation.lat) && 
    !isNaN(formData.mapLocation.lng) &&
    formData.mapLocation.lat !== 0 && 
    formData.mapLocation.lng !== 0;

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
              label="Location " 
              value={formData.location || ''} 
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
              mapLocation: { 
                ...prev.mapLocation, 
                lat: e.target.value ? parseFloat(e.target.value) || 0 : 0 
              }
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
              mapLocation: { 
                ...prev.mapLocation, 
                lng: e.target.value ? parseFloat(e.target.value) || 0 : 0 
              }
            }))}
            sx={{ mb: 2 }}
            helperText="Automatically filled from address"
          />
        </Grid>

        {hasValidMapLocation && (
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

export default AdditionalDetailsSection;

