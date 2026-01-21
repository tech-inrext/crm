"use client";

import React from "react";
import { Grid, TextField } from "@mui/material";

interface SizeDetailsProps {
  currentProperty: any;
  index: number;
  formData: any;
  setFormData: (data: any) => void;
}

const SizeDetails: React.FC<SizeDetailsProps> = ({
  currentProperty,
  index,
  formData,
  setFormData
}) => {
  const updateProperty = (field: string, value: any) => {
    const newCommercial = [...(formData.commercialProperties || [])];
    if (!newCommercial[index]) newCommercial[index] = {};
    newCommercial[index][field] = value;
    setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
  };

  return (
    <>
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Size Unit"
          value={currentProperty.sizeUnit || 'sq.ft.'}
          onChange={(e) => updateProperty('sizeUnit', e.target.value)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Minimum Size"
          value={currentProperty.minSize || ''}
          onChange={(e) => updateProperty('minSize', e.target.value)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 4 }}>
        <TextField
          fullWidth
          label="Maximum Size"
          value={currentProperty.maxSize || ''}
          onChange={(e) => updateProperty('maxSize', e.target.value)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Carpet Area"
          value={currentProperty.carpetArea || ''}
          onChange={(e) => updateProperty('carpetArea', e.target.value)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Built-up Area"
          value={currentProperty.builtUpArea || ''}
          onChange={(e) => updateProperty('builtUpArea', e.target.value)}
        />
      </Grid>
    </>
  );
};

export default SizeDetails;