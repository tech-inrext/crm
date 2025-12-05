/* eslint-disable react/no-unescaped-entities */
// components/PropertyTypeSelector.tsx में complete fix
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
    console.log('Selected property types:', selectedTypes);
    
    const updatedFormData = { ...formData, propertyType: selectedTypes };
    
    // Initialize arrays for each selected type if they don't exist
    if (selectedTypes.includes('residential')) {
      updatedFormData.residentialProperties = updatedFormData.residentialProperties || [{}];
    } else {
      updatedFormData.residentialProperties = [];
    }
    
    if (selectedTypes.includes('commercial')) {
      updatedFormData.commercialProperties = updatedFormData.commercialProperties || [{}];
    } else {
      updatedFormData.commercialProperties = [];
    }
    
    if (selectedTypes.includes('plot')) {
      updatedFormData.plotProperties = updatedFormData.plotProperties || [{}];
    } else {
      updatedFormData.plotProperties = [];
    }
    
    setFormData(updatedFormData);
    
    // Set active tab to first selected type
    if (selectedTypes.length > 0) {
      setActiveTab(0);
    }
  };

  const addPropertyOfType = (type: string) => {
    const key = `${type}Properties`;
    const currentProperties = formData[key] || [];
    
    const defaultProperty = {
      propertyName: `${formData.projectName || 'New'} ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      propertyDescription: formData.description || '',
      price: formData.price || 'Contact for price',
      paymentPlan: formData.paymentPlan || '',
      amenities: formData.amenities || [],
      propertyImages: [], 
      floorPlans: [],
      ...(type === 'residential' && {
        bedrooms: 2,
        bathrooms: 2,
        toilet: 1,
        balcony: 1,
        carpetArea: '1000',
        builtUpArea: '1200',
        minSize: '1000',
        maxSize: '2000',
        sizeUnit: 'sq.ft.'
      }),
      ...(type === 'commercial' && {
        carpetArea: '2000',
        builtUpArea: '2500',
        minSize: '1000',
        maxSize: '5000',
        sizeUnit: 'sq.ft.'
      }),
      ...(type === 'plot' && {
        ownershipType: 'Freehold',
        landType: 'Residential Plot',
        approvedBy: '',
        boundaryWall: false,
        minSize: '1000',
        maxSize: '5000',
        sizeUnit: 'sq.ft.'
      })
    };

    setFormData((prev: any) => ({ 
      ...prev, 
      [key]: [...currentProperties, defaultProperty] 
    }));
    
    // Set active tab to the type we just added to
    const typeIndex = formData.propertyType.indexOf(type);
    if (typeIndex !== -1) {
      setActiveTab(typeIndex);
    }
  };

  const removePropertyOfType = (type: string, index: number) => {
    const key = `${type}Properties`;
    const currentProperties = formData[key] || [];
    
    // Don't remove if it's the last property of this type
    if (currentProperties.length <= 1) {
      alert(`You must have at least one ${type} property when ${type} type is selected.`);
      return;
    }
    
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
                    <Chip 
                      key={value} 
                      label={value} 
                      size="small" 
                      color={value === 'residential' ? 'secondary' : value === 'commercial' ? 'warning' : 'info'} 
                    />
                  ))}
                </Box>
              )}
            >
              <MenuItem value="project">
                <Box sx={{ display: 'flex', alignItems: 'center' }}><Home sx={{ mr: 1 }} />Project Only (No Sub-properties)</Box>
              </MenuItem>
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
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)} 
              variant="scrollable"
              scrollButtons="auto"
            >
              {selectedTypes.map((type, index) => (
                <Tab 
                  key={type} 
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {type === 'residential' && <Home sx={{ mr: 1, fontSize: 16 }} />}
                      {type === 'commercial' && <Business sx={{ mr: 1, fontSize: 16 }} />}
                      {type === 'plot' && <Landscape sx={{ mr: 1, fontSize: 16 }} />}
                      {type === 'project' && <Home sx={{ mr: 1, fontSize: 16 }} />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                      {formData[`${type}Properties`] && (
                        <Chip 
                          label={formData[`${type}Properties`].length} 
                          size="small" 
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }} 
                        />
                      )}
                    </Box>
                  } 
                />
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
                      type === 'commercial' ? 'Commercial Properties' : 
                      type === 'plot' ? 'Plot Properties' : 'Project Details'}
                    </Typography>
                    {type !== 'project' && (
                      <Button 
                        variant="outlined" 
                        startIcon={<Add />} 
                        onClick={() => addPropertyOfType(type)}
                      >
                        Add {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Button>
                    )}
                  </Box>

                  {type === 'project' ? (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      <Typography variant="body2">
                        When creating only a project (no sub-properties), all property details will be stored at the project level.
                        You can add residential, commercial, or plot properties later if needed.
                      </Typography>
                    </Alert>
                  ) : (
                    (formData[`${type}Properties`] || []).map((_: any, index: number) => (
                      <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid #e0e0e0' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="subtitle1">
                            {type.charAt(0).toUpperCase() + type.slice(1)} Property #{index + 1}
                          </Typography>
                          {(formData[`${type}Properties`] || []).length > 1 && (
                            <IconButton 
                              onClick={() => removePropertyOfType(type, index)} 
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          )}
                        </Box>

                        {type === 'residential' && (
                          <ResidentialForm 
                            formData={formData} 
                            setFormData={setFormData} 
                            validationErrors={validationErrors} 
                            index={index} 
                          />
                        )}
                        {type === 'commercial' && (
                          <CommercialForm 
                            formData={formData} 
                            setFormData={setFormData} 
                            validationErrors={validationErrors} 
                            index={index} 
                          />
                        )}
                        {type === 'plot' && (
                          <PlotForm 
                            formData={formData} 
                            setFormData={setFormData} 
                            validationErrors={validationErrors} 
                            index={index} 
                          />
                        )}
                      </Paper>
                    ))
                  )}
                </Box>
              )}
            </div>
          ))}
        </Box>
      )}

      {selectedTypes.length > 1 && selectedTypes.includes('project') && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> When 'Project' is selected with other property types, a main project will be created 
            with all selected property types as sub-properties. Each property type will have its own section.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default PropertyTypeSelector;

