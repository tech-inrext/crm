"use client";

import React from "react";
import {
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import FileUploadButton from "../shared/FileUploadButton";
import UploadProgress from "../shared/UploadProgress";
import UploadedFileCard from "../shared/UploadedFileCard";

interface PropertyImagesProps {
  currentProperty: any;
  index: number;
  uploading: string | null;
  uploadProgress: { [key: string]: number };
  handleFileUpload: (files: FileList, type: 'propertyImages' | 'floorPlans') => Promise<void>;
  setPrimaryImage: (fileIndex: number) => void;
  removeFile: (type: 'propertyImages' | 'floorPlans', fileIndex: number) => void;
}

const PropertyImages: React.FC<PropertyImagesProps> = ({
  currentProperty,
  index,
  uploading,
  uploadProgress,
  handleFileUpload,
  setPrimaryImage,
  removeFile
}) => {
  return (
    <Paper sx={{ p: 3, mt: 2, border: '1px solid #e0e0e0', borderRadius: '12px', backgroundColor: '#fafafa' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', color: 'info.main' }}>
        <CloudUpload sx={{ mr: 1 }} />
        Plot Images (S3 Storage)
        {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
          <Chip
            label={`${currentProperty.propertyImages.length} uploaded`}
            size="small"
            color="info"
            sx={{ ml: 2 }}
          />
        )}
      </Typography>

      <UploadProgress uploadProgress={uploadProgress} color="info" />

      <FileUploadButton
        type="propertyImages"
        index={index}
        uploading={uploading}
        handleFileUpload={handleFileUpload}
        label="Upload Plot Images to S3"
        color="info"
      />

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Images will be uploaded directly to Amazon S3 cloud storage for better performance.
      </Typography>

      {currentProperty.propertyImages && currentProperty.propertyImages.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
            Uploaded Images
          </Typography>
          <Grid container spacing={2}>
            {currentProperty.propertyImages.map((image: any, imgIndex: number) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={imgIndex}>
                <UploadedFileCard
                  file={image}
                  index={imgIndex}
                  type="propertyImages"
                  onSetPrimary={setPrimaryImage}
                  onRemove={removeFile}
                  showPrimaryOption={true}
                  isPrimary={image.isPrimary}
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

export default PropertyImages;