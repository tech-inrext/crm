"use client";

import React, { useState } from "react";
import {
  Grid,
  Typography,
  Paper,
  Box,
} from "@mui/material";
import { Home } from "@mui/icons-material";
import { toast } from "sonner";
import { uploadService } from "@/services/uploadService";
import AmenitiesSelector from "../shared/AmenitiesSelector";
import BasicDetails from "./BasicDetails";
import RoomSpecifications from "./RoomSpecifications";
import SizeDetails from "./SizeDetails";
import PropertyImages from "./PropertyImages";
import FloorPlans from "./FloorPlans";

interface ResidentialFormProps {
  formData: any;
  setFormData: (data: any) => void;
  validationErrors: any;
  index: number;
}

const ResidentialForm: React.FC<ResidentialFormProps> = ({
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

        const newResidential = [...(formData.residentialProperties || [])];
        if (!newResidential[index]) newResidential[index] = {};

        if (type === 'propertyImages') {
          newResidential[index].propertyImages = [
            ...(newResidential[index].propertyImages || []),
            ...newFiles
          ];
        } else {
          newResidential[index].floorPlans = [
            ...(newResidential[index].floorPlans || []),
            ...newFiles
          ];
        }

        setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));

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
    const newResidential = [...(formData.residentialProperties || [])];
    if (!newResidential[index]) return;

    if (type === 'propertyImages') {
      newResidential[index].propertyImages = newResidential[index].propertyImages?.filter((_: any, i: number) => i !== fileIndex) || [];
    } else {
      newResidential[index].floorPlans = newResidential[index].floorPlans?.filter((_: any, i: number) => i !== fileIndex) || [];
    }

    setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
    toast.success('File removed successfully');
  };

  const setPrimaryImage = (fileIndex: number) => {
    const newResidential = [...(formData.residentialProperties || [])];
    if (!newResidential[index]?.propertyImages) return;

    newResidential[index].propertyImages = newResidential[index].propertyImages.map((img: any, i: number) => ({
      ...img,
      isPrimary: i === fileIndex
    }));

    setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
    toast.success('Primary image updated');
  };

  const updateProperty = (field: string, value: any) => {
    const newResidential = [...(formData.residentialProperties || [])];
    if (!newResidential[index]) newResidential[index] = {};
    newResidential[index][field] = value;
    setFormData((prev: any) => ({ ...prev, residentialProperties: newResidential }));
  };

  const currentProperty = formData.residentialProperties?.[index] || {};

  const residentialAmenities = [
    "24/7 security staff", "CCTV surveillance", "Video door phone and intercom", "Smart lock and smart access control systems", 
    "Gated community and controlled entry", "Fire safety (alarm, extinguisher)", "Swimming pool", "Gymnasium / fitness center", 
    "Jogging track / walking paths", "Clubhouse or community hall", "Landscaped garden and green spaces", "Rooftop lounge or terrace garden", 
    "Playground / children's play area", "Pet-friendly zones / dog park", "Party room / multipurpose hall", "Covered parking and garage", 
    "Visitor / guest parking", "Bike parking or storage", "Electric vehicle charging stations", "Proximity to public transport", 
    "High-speed internet and cable TV provision", "Building Wi-Fi in common areas", "Smart home automation (lighting, climate control)", 
    "Online rent payment and maintenance requests", "Automated package room / lockers for deliveries", "Spa / wellness center", 
    "Indoor games room (billiards, table tennis)", "Co-working / office space", "Community events and social spaces", "Elder's sitting area", 
    "Valet trash service", "Storage facilities", "Library / reading lounge", "Solar power or solar lighting", "Rainwater harvesting", 
    "Waste segregation and recycling"
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
          <Home sx={{ mr: 1 }} />
          Residential Property #{index + 1}
        </Typography>
      </Grid>

      <BasicDetails
        currentProperty={currentProperty}
        index={index}
        formData={formData}
        setFormData={setFormData}
      />

      <RoomSpecifications
        currentProperty={currentProperty}
        index={index}
        formData={formData}
        setFormData={setFormData}
      />

      <SizeDetails
        currentProperty={currentProperty}
        index={index}
        formData={formData}
        setFormData={setFormData}
      />

      <Grid size={{ xs: 12 }}>
        <AmenitiesSelector
          value={currentProperty.amenities || []}
          onChange={(amenities) => updateProperty('amenities', amenities)}
          amenitiesList={residentialAmenities}
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
        <FloorPlans
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

export default ResidentialForm;