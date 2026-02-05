"use client";

import React, { useState } from "react";
import {
  Grid,
  Typography,
} from "@mui/material";
import { Business } from "@mui/icons-material";
import { toast } from "sonner";
import { uploadService } from "@/services/uploadService";
import AmenitiesSelector from "../shared/AmenitiesSelector";
import BasicDetails from "./BasicDetails";
import SizeDetails from "./SizeDetails";
import PropertyImages from "./PropertyImages";
import FloorPlans from "./FloorPlans";

interface CommercialFormProps {
  formData: any;
  setFormData: (data: any) => void;
  validationErrors: any;
  index: number;
}

const CommercialForm: React.FC<CommercialFormProps> = ({
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

        const newCommercial = [...(formData.commercialProperties || [])];
        if (!newCommercial[index]) newCommercial[index] = {};

        if (type === 'propertyImages') {
          newCommercial[index].propertyImages = [
            ...(newCommercial[index].propertyImages || []),
            ...newFiles
          ];
        } else {
          newCommercial[index].floorPlans = [
            ...(newCommercial[index].floorPlans || []),
            ...newFiles
          ];
        }

        setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));

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
    const newCommercial = [...(formData.commercialProperties || [])];
    if (!newCommercial[index]) return;

    if (type === 'propertyImages') {
      newCommercial[index].propertyImages = newCommercial[index].propertyImages?.filter((_: any, i: number) => i !== fileIndex) || [];
    } else {
      newCommercial[index].floorPlans = newCommercial[index].floorPlans?.filter((_: any, i: number) => i !== fileIndex) || [];
    }

    setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
    toast.success('File removed successfully');
  };

  const setPrimaryImage = (fileIndex: number) => {
    const newCommercial = [...(formData.commercialProperties || [])];
    if (!newCommercial[index]?.propertyImages) return;

    newCommercial[index].propertyImages = newCommercial[index].propertyImages.map((img: any, i: number) => ({
      ...img,
      isPrimary: i === fileIndex
    }));

    setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
    toast.success('Primary image updated');
  };

  const updateProperty = (field: string, value: any) => {
    const newCommercial = [...(formData.commercialProperties || [])];
    if (!newCommercial[index]) newCommercial[index] = {};
    newCommercial[index][field] = value;
    setFormData((prev: any) => ({ ...prev, commercialProperties: newCommercial }));
  };

  const currentProperty = formData.commercialProperties?.[index] || {};

  const commercialAmenities = [
    "City / Locality / Sector / Street Address", "Landmark / Nearby Roads / Connectivity",
    "Distance from Metro Station / Bus Stop / Airport / Railway Station",
    "Development Authority / Approved By (YEIDA / DDA / HUDA / RERA No.)",
    "Road Width in Front (e.g., 24m, 60m, etc.)",
    "Parking Availability (Basement / Open / Reserved / Visitor Parking)",
    "Building Type: (Standalone / Mall / IT Park / Business Center / Industrial Estate)",
    "Power Backup (Full / Partial / None)", "Air Conditioning (Central / Split / Window / VRV System)",
    "Lift / Elevator (Passenger / Service)", "Fire Safety Systems (Sprinklers / Smoke Detectors / Extinguishers /Alarm)",
    "Earthquake Resistance", "Power Load / Electricity Connection (in kVA or kW)",
    "Washrooms (Common / Attached / Separate for Male & Female)", "Pantry / Cafeteria Area",
    "Security Cabin or Reception Area", "24x7 Security / CCTV Surveillance", "Intercom Facility", "Access Control / Biometric Entry",
    "Wi-Fi Connectivity / Internet Ready", "Maintenance Staff", "Housekeeping Services", "Centralized Air Conditioning (for corporate offices)",
    "Escalators (in malls/shopping complexes)", "Backup Generator", "Conference Room / Meeting Room", "Lounge / Waiting Area",
    "ATM / Banking Facilities within Premises", "Cafeteria / Food Court", "High-Speed Elevators", "Visitor Management System", "Rainwater Harvesting",
    "Waste Disposal System", "Power Backup for Common Areas", "Fire Exit & Emergency Lighting", "Wheelchair / Handicap Access", "Wide Road Access",
    "Landscaped Area / Green Zone", "Visibility from Main Road", "Corner Property Advantage", "Signage / Branding Opportunity", "Ample Street Lighting",
    "Loading/Unloading Area (for warehouses or showrooms)", "Truck Entry / Dock Facility (for industrial units)", "Nearby Commercial Hubs / Corporate Offices", "Public Transport Accessibility"
  ];

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'warning.main', display: 'flex', alignItems: 'center' }}>
          <Business sx={{ mr: 1 }} />
          Commercial Property #{index + 1}
        </Typography>
      </Grid>

      <BasicDetails
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
          amenitiesList={commercialAmenities}
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

export default CommercialForm;