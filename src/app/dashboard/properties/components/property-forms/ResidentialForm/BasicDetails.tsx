"use client";

import React from "react";
import { Grid, TextField } from "@mui/material";

interface BasicDetailsProps {
  currentProperty: any;
  index: number;
  formData: any;
  setFormData: (data: any) => void;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({
  currentProperty,
  index,
  formData,
  setFormData
}) => {
  const updateProperty = (field: string, value: any) => {
    const newResidential = [...(formData.residentialProperties || [])];
    if (!newResidential[index]) newResidential[index] = {};
    newResidential[index][field] = value;
    setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
  };

  return (
    <>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Property Type"
          value={currentProperty.propertyName || ''}
          onChange={(e) => updateProperty('propertyName', e.target.value)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Price"
          value={currentProperty.price || ''}
          onChange={(e) => updateProperty('price', e.target.value)}
          placeholder="Leave empty to inherit from main project"
          helperText={formData.parentId ? "Leave empty to automatically use main project price" : "Enter price for this residential property"}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Floor"
          type="number"
          value={currentProperty.floors || ''}
          onChange={(e) => updateProperty('floors', e.target.value === '' ? undefined : parseInt(e.target.value))}
          InputProps={{
            inputProps: { min: 0, step: 1 }
          }}
          helperText="Optional - Number of floor"
        />
      </Grid>
      
      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Property Description"
          value={currentProperty.propertyDescription || ''}
          onChange={(e) => updateProperty('propertyDescription', e.target.value)}
          multiline
          rows={2}
        />
      </Grid>
    </>
  );
};

export default BasicDetails;