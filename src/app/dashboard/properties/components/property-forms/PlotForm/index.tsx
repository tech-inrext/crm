"use client";

import React, { useState } from "react";
import {
  Grid,
  Typography,
} from "@mui/material";
import { Landscape } from "@mui/icons-material";
import { toast } from "sonner";
import { uploadService } from "@/services/uploadService";
import AmenitiesSelector from "../shared/AmenitiesSelector";
import BasicDetails from "./BasicDetails";
import PlotDetails from "./PlotDetails";
import PropertyImages from "./PropertyImages";
import PlotLayouts from "./PlotLayouts";

interface PlotFormProps {
  formData: any;
  setFormData: (data: any) => void;
  validationErrors: any;
  index: number;
}

const PlotForm: React.FC<PlotFormProps> = ({
  formData,
  setFormData,
  validationErrors,
  index,
}) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const mapFloorPlanType = (fileType: string) => {
    if (!fileType) return '2d';
    if (fileType.includes('pdf')) return 'pdf';
    if (fileType.includes('image')) return 'image';
    return '2d';
  };

  const handleFileUpload = async (files: FileList, type: 'propertyImages' | 'floorPlans') => {
    setUploading(type);
    try {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      const uploadPromises = fileArray.map(async (file, fileIndex) => {
        const fileId = `${type}-${index}-${fileIndex}-${Date.now()}`;

        try {
          uploadService.validateFileSize(file, 200);
          setUploadProgress(prev => ({ ...prev, [fileId]: 10 }));

          const uploadResponse = await uploadService.uploadFile(file);
          setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

          if (uploadResponse.success && uploadResponse.data) {
            const newFile = {
              url: uploadResponse.data.url,
              title: uploadResponse.data.originalName?.replace(/\.[^/.]+$/, "") || `Image ${fileIndex + 1}`,
              description: "",
              isPrimary: false,
              uploadedAt: new Date().toISOString(),
              fileSize: uploadResponse.data.fileSize,
              fileType: uploadResponse.data.fileType,
              originalName: uploadResponse.data.originalName,
              ...(type === 'floorPlans' && {
                type: mapFloorPlanType(file.type)
              })
            };

            return { success: true, file: newFile };
          } else {
            return { success: false, error: uploadResponse.message };
          }
        } catch (error: any) {
          console.error(`Upload failed for ${file.name}:`, error);
          return { success: false, error: error.message };
        } finally {
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result.success);
      const failedUploads = results.filter(result => !result.success);

      if (successfulUploads.length > 0) {
        const newFiles = successfulUploads.map(result => result.file);

        const newPlot = [...(formData.plotProperties || [])];
        if (!newPlot[index]) newPlot[index] = {};

        if (type === 'propertyImages') {
          newPlot[index].propertyImages = [
            ...(newPlot[index].propertyImages || []),
            ...newFiles
          ];
        } else {
          newPlot[index].floorPlans = [
            ...(newPlot[index].floorPlans || []),
            ...newFiles
          ];
        }

        setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));

        if (successfulUploads.length > 0) {
          toast.success(`Successfully uploaded ${successfulUploads.length} file(s) to S3`);
        }
      }

      if (failedUploads.length > 0) {
        failedUploads.forEach(result => {
          toast.error(`Upload failed: ${result.error}`);
        });
      }

    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(null);
    }
  };

  const removeFile = (type: 'propertyImages' | 'floorPlans', fileIndex: number) => {
    const newPlot = [...(formData.plotProperties || [])];
    if (!newPlot[index]) return;

    if (type === 'propertyImages') {
      newPlot[index].propertyImages = newPlot[index].propertyImages?.filter((_: any, i: number) => i !== fileIndex) || [];
    } else {
      newPlot[index].floorPlans = newPlot[index].floorPlans?.filter((_: any, i: number) => i !== fileIndex) || [];
    }

    setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
    toast.success('File removed successfully');
  };

  const setPrimaryImage = (fileIndex: number) => {
    const newPlot = [...(formData.plotProperties || [])];
    if (!newPlot[index]?.propertyImages) return;

    newPlot[index].propertyImages = newPlot[index].propertyImages.map((img: any, i: number) => ({
      ...img,
      isPrimary: i === fileIndex
    }));

    setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
    toast.success('Primary image updated');
  };

  const updateProperty = (field: string, value: any) => {
    const newPlot = [...(formData.plotProperties || [])];
    if (!newPlot[index]) newPlot[index] = {};
    newPlot[index][field] = value;
    setFormData((prev: any) => ({ ...prev, plotProperties: newPlot }));
  };

  const currentProperty = formData.plotProperties?.[index] || {};

  const plotAmenities = [
    "Boundary Wall", "Gate", "Security", "Road Access", "Water Supply", "Electricity",
    "Drainage", "Street Lights", "Park", "Community Center"
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'info.main', display: 'flex', alignItems: 'center' }}>
          <Landscape sx={{ mr: 1 }} />
          Plot #{index + 1}
        </Typography>
      </Grid>

      <BasicDetails
        currentProperty={currentProperty}
        index={index}
        formData={formData}
        setFormData={setFormData}
      />

      <PlotDetails
        currentProperty={currentProperty}
        index={index}
        formData={formData}
        setFormData={setFormData}
      />

      <Grid size={{ xs: 12 }}>
        <AmenitiesSelector
          value={currentProperty.amenities || []}
          onChange={(amenities) => updateProperty('amenities', amenities)}
          amenitiesList={plotAmenities}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <PropertyImages
          currentProperty={currentProperty}
          index={index}
          uploading={uploading}
          uploadProgress={uploadProgress}
          handleFileUpload={handleFileUpload}
          setPrimaryImage={setPrimaryImage}
          removeFile={removeFile}
        />
      </Grid>

      <Grid size={{ xs: 12 }}>
        <PlotLayouts
          currentProperty={currentProperty}
          index={index}
          uploading={uploading}
          uploadProgress={uploadProgress}
          handleFileUpload={handleFileUpload}
          removeFile={removeFile}
        />
      </Grid>
    </Grid>
  );
};

export default PlotForm;