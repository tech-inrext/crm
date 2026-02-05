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
    const newPlot = [...(formData.plotProperties || [])];
    if (!newPlot[index]) newPlot[index] = {};
    newPlot[index][field] = value;
    setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
  };

  return (
    <>
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Property Type"
          value={currentProperty.propertyName || ''}
          onChange={(e) => updateProperty('propertyName', e.target.value)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Price"
          value={currentProperty.price || ''}
          onChange={(e) => updateProperty('price', e.target.value)}
          placeholder="Leave empty to inherit from main project"
          helperText={formData.parentId ? "Leave empty to automatically use main project price" : "Enter price for this plot"}
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