import React, { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Box,
  Tabs,
  Tab,
  IconButton,
  Alert,
  FormHelperText,
} from "@mui/material";
import {
  Add,
  Delete,
  Home,
  Business,
  Landscape,
} from "@mui/icons-material";
import ResidentialForm from "./ResidentialForm";
import CommercialForm from "./CommercialForm";
import PlotForm from "./PlotForm";

interface PropertyTypeSelectorProps {
  formData: any;
  setFormData: (data: any) => void;
  validationErrors: any;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  formData,
  setFormData,
  validationErrors,
}) => {
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

export default PropertyTypeSelector;


