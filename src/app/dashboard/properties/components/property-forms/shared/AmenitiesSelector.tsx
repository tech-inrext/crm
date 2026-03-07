"use client";

import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  MenuItem,
  Box,
  Chip,
} from "@mui/material";

interface AmenitiesSelectorProps {
  value: string[];
  onChange: (amenities: string[]) => void;
  label?: string;
  amenitiesList: string[];
}

const AmenitiesSelector: React.FC<AmenitiesSelectorProps> = ({
  value,
  onChange,
  label = "Amenities",
  amenitiesList
}) => {
  return (
    <FormControl fullWidth sx={{ mb: 2 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        value={value}
        onChange={(e) => onChange(e.target.value as string[])}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {(selected as string[]).map((value) => (
              <Chip key={value} label={value} size="small" />
            ))}
          </Box>
        )}
      >
        {amenitiesList.map((amenity) => (
          <MenuItem key={amenity} value={amenity}>
            {amenity}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default AmenitiesSelector;