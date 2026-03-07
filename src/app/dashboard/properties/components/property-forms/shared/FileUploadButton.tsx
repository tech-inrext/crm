"use client";

import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface FileUploadButtonProps {
  type: 'propertyImages' | 'floorPlans';
  index: number;
  uploading: string | null;
  handleFileUpload: (files: FileList, type: 'propertyImages' | 'floorPlans') => Promise<void>;
  label: string;
  color: 'primary' | 'secondary' | 'warning' | 'info' | 'success';
  accept?: string;
}

const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  type,
  index,
  uploading,
  handleFileUpload,
  label,
  color,
  accept = "image/*"
}) => {
  const inputId = `${type}-${index}`;

  return (
    <>
      <input
        accept={accept}
        style={{ display: 'none' }}
        id={inputId}
        type="file"
        multiple
        onChange={(e) => e.target.files && handleFileUpload(e.target.files, type)}
        disabled={uploading === type}
      />
      <label htmlFor={inputId}>
        <Button
          variant="contained"
          component="span"
          color={color}
          startIcon={uploading === type ? <CircularProgress size={20} /> : <CloudUpload />}
          fullWidth
          disabled={uploading === type}
          sx={{ mb: 2 }}
        >
          {uploading === type ? 'Uploading to S3...' : label}
        </Button>
      </label>
    </>
  );
};

export default FileUploadButton;