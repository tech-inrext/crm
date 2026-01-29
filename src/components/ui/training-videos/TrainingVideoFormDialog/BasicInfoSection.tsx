import React from "react";
import {
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import { TrainingVideoFormData } from "@/types/trainingVideo";
import { CATEGORIES, getCategoryLabel } from "./constants";

interface BasicInfoSectionProps {
  formData: TrainingVideoFormData;
  errors: { [key: string]: string };
  onChange: (field: keyof TrainingVideoFormData) => (event: any) => void;
  isUploading: boolean;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  errors,
  onChange,
  isUploading,
}) => {
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ color: "primary.main" }}>
          Basic Information
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          fullWidth
          label="Video Title *"
          value={formData.title}
          onChange={onChange("title")}
          error={!!errors.title}
          helperText={errors.title}
          disabled={isUploading}
          placeholder="Enter video title"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <FormControl fullWidth error={!!errors.category} disabled={isUploading}>
          <InputLabel>Category *</InputLabel>
          <Select
            value={formData.category}
            label="Category *"
            onChange={onChange("category")}
          >
            {CATEGORIES.map((category) => (
              <MenuItem key={category} value={category}>
                {getCategoryLabel(category)}
              </MenuItem>
            ))}
          </Select>
          {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
        </FormControl>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={formData.description}
          onChange={onChange("description")}
          helperText="Brief description of the video content"
          disabled={isUploading}
          placeholder="Enter video description (optional)"
        />
      </Grid>
    </>
  );
};