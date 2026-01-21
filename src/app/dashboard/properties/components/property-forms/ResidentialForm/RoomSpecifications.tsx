"use client";

import React from "react";
import { Grid, TextField } from "@mui/material";

interface RoomSpecificationsProps {
  currentProperty: any;
  index: number;
  formData: any;
  setFormData: (data: any) => void;
}

const RoomSpecifications: React.FC<RoomSpecificationsProps> = ({
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
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          fullWidth
          label="Bedrooms"
          type="number"
          value={currentProperty.bedrooms || 0}
          onChange={(e) => updateProperty('bedrooms', parseInt(e.target.value) || 0)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          fullWidth
          label="Bathrooms"
          type="number"
          value={currentProperty.bathrooms || 0}
          onChange={(e) => updateProperty('bathrooms', parseInt(e.target.value) || 0)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          fullWidth
          label="Toilets"
          type="number"
          value={currentProperty.toilet || 0}
          onChange={(e) => updateProperty('toilet', parseInt(e.target.value) || 0)}
        />
      </Grid>
      
      <Grid size={{ xs: 12, md: 3 }}>
        <TextField
          fullWidth
          label="Balcony"
          type="number"
          value={currentProperty.balcony || 0}
          onChange={(e) => updateProperty('balcony', parseInt(e.target.value) || 0)}
        />
      </Grid>
    </>
  );
};

export default RoomSpecifications;