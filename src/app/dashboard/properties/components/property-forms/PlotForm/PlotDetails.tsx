"use client";

import React from "react";
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

interface PlotDetailsProps {
  currentProperty: any;
  index: number;
  formData: any;
  setFormData: (data: any) => void;
}

const PlotDetails: React.FC<PlotDetailsProps> = ({
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
        <FormControl fullWidth>
          <InputLabel>Ownership Type</InputLabel>
          <Select
            value={currentProperty.ownershipType || "Freehold"}
            onChange={(e) => updateProperty('ownershipType', e.target.value)}
            label="Ownership Type"
          >
            <MenuItem value="Freehold">Freehold</MenuItem>
            <MenuItem value="Leasehold">Leasehold</MenuItem>
            <MenuItem value="GPA">GPA</MenuItem>
            <MenuItem value="Power of Attorney">Power of Attorney</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Land Type</InputLabel>
          <Select
            value={currentProperty.landType || "Residential Plot"}
            onChange={(e) => updateProperty('landType', e.target.value)}
            label="Land Type"
          >
            <MenuItem value="Residential Plot">Residential Plot</MenuItem>
            <MenuItem value="Commercial Plot">Commercial Plot</MenuItem>
            <MenuItem value="Farm Land">Farm Land</MenuItem>
            <MenuItem value="Industrial Plot">Industrial Plot</MenuItem>
            <MenuItem value="Mixed Use">Mixed Use</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Approved By"
          value={currentProperty.approvedBy || ''}
          onChange={(e) => updateProperty('approvedBy', e.target.value)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth>
          <InputLabel>Boundary Wall</InputLabel>
          <Select
            value={currentProperty.boundaryWall?.toString() || "false"}
            onChange={(e) => updateProperty('boundaryWall', e.target.value === 'true')}
            label="Boundary Wall"
          >
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      
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
    </>
  );
};

export default PlotDetails;