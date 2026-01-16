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

interface PlotLayoutsProps {
  currentProperty: any;
  index: number;
  uploading: string | null;
  uploadProgress: { [key: string]: number };
  handleFileUpload: (files: FileList, type: 'propertyImages' | 'floorPlans') => Promise<void>;
  removeFile: (type: 'propertyImages' | 'floorPlans', fileIndex: number) => void;
}

const PlotLayouts: React.FC<PlotLayoutsProps> = ({
  currentProperty,
  index,
  uploading,
  uploadProgress,
  handleFileUpload,
  removeFile
}) => {
  return (
    <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
        <Description sx={{ mr: 1 }} />
        Plot Layouts & Plans (S3 Storage)
        {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
          <Chip
            label={`${currentProperty.floorPlans.length} uploaded`}
            size="small"
            color="info"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      <UploadProgress uploadProgress={uploadProgress} color="info" />

      <FileUploadButton
        type="floorPlans"
        index={index}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        label="Upload Plot Layouts to S3"
        color="info"
        accept="image/*,.pdf"
      />

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Layouts & plans will be uploaded directly to Amazon S3 cloud storage.
      </Typography>

      {currentProperty.floorPlans && currentProperty.floorPlans.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Uploaded Layouts & Plans
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
                  color="info"
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Paper>
  );
};

export default PlotLayouts;