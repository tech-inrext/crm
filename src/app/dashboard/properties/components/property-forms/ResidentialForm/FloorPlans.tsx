"use client";

import React from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
} from "@mui/material";
import { Description } from "@mui/icons-material";
import FileUploadButton from "../shared/FileUploadButton";
import UploadProgress from "../shared/UploadProgress";
import UploadedFileCard from "../shared/UploadedFileCard";

interface FloorPlansProps {
  currentProperty: any;
  index: number;
  uploading: string | null;
  uploadProgress: { [key: string]: number };
  handleFileUpload: (files: FileList, type: 'propertyImages' | 'floorPlans') => Promise<void>;
  removeFile: (type: 'propertyImages' | 'floorPlans', fileIndex: number) => void;
}

const FloorPlans: React.FC<FloorPlansProps> = ({
  currentProperty,
  index,
  uploading,
  uploadProgress,
  handleFileUpload,
  removeFile
}) => {
  return (
    <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'secondary.main' }}>
        <Description sx={{ mr: 1 }} />
        Floor Plans (S3 Storage)
        {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
          <Chip
            label={`${currentProperty.floorPlans.length} uploaded`}
            size="small"
            color="secondary"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      <UploadProgress uploadProgress={uploadProgress} color="secondary" />

      <FileUploadButton
        type="floorPlans"
        index={index}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        label="Upload Floor Plans to S3"
        color="secondary"
        accept="image/*,.pdf"
      />

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Floor plans will be uploaded directly to Amazon S3 cloud storage.
      </Typography>

      {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Uploaded Floor Plans
          </Typography>
          <Grid container spacing={2}>
            {currentProperty.floorPlans.map((plan: any, planIndex: number) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={planIndex}>
                <UploadedFileCard
                  file={plan}
                  index={planIndex}
                  type="floorPlans"
                  onRemove={removeFile}
                  showPrimaryOption={false}
                  color="secondary"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default FloorPlans;