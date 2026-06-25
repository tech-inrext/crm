"use client";

import React from "react";
import { useFormikContext } from "formik";
import Image from "next/image";
import { 
  TextField, 
  Box, 
  Typography, 
  Grid,
  Button
} from "@/components/ui/Component";
import { 
  inputSx, 
  formSectionTitleSx, 
  formContainerSx, 
  fileUploadButtonSx, 
  fileNameSx, 
  chooseTextSx, 
  errorTextSx, 
  imagePreviewBoxSx, 
  totalKmFieldSx 
} from "./styles";
import { VendorBookingFormValues, VendorFormFieldsProps } from "../types";
import { MAX_FILE_SIZE } from "../constants/form";

const VendorFormFields: React.FC<VendorFormFieldsProps> = ({
  disabled,
  totalKm,
}) => {
  const {
    values,
    errors,
    touched,
    handleChange,
    setFieldValue,
    setFieldTouched,
  } = useFormikContext<VendorBookingFormValues>();


  return (
    <Box sx={formContainerSx}>
      <Box>
        <Typography sx={formSectionTitleSx}>Owner & Driver Details</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            fullWidth
            size="small"
            label="Cab Owner Name"
            name="cabOwner"
            value={values.cabOwner}
            onChange={handleChange}
            error={touched.cabOwner && !!errors.cabOwner}
            helperText={touched.cabOwner && errors.cabOwner}
            disabled={disabled}
            required
            sx={inputSx}
          />
          <TextField
            fullWidth
            size="small"
            label="Driver Name"
            name="driverName"
            value={values.driverName}
            onChange={handleChange}
            error={touched.driverName && !!errors.driverName}
            helperText={touched.driverName && errors.driverName}
            disabled={disabled}
            required
            sx={inputSx}
          />
          <TextField
            fullWidth
            size="small"
            label="Aadhar Number (Driver)"
            name="aadharNumber"
            value={values.aadharNumber}
            onChange={(e) => setFieldValue("aadharNumber", e.target.value.replace(/\D/g, ""))}
            error={touched.aadharNumber && !!errors.aadharNumber}
            helperText={touched.aadharNumber && errors.aadharNumber}
            disabled={disabled}
            sx={inputSx}
          />
          <TextField
            fullWidth
            size="small"
            label="DL Number (Driver)"
            name="dlNumber"
            value={values.dlNumber}
            onChange={handleChange}
            error={touched.dlNumber && !!errors.dlNumber}
            helperText={touched.dlNumber && errors.dlNumber}
            disabled={disabled}
            sx={inputSx}
          />
        </div>
      </Box>

      {/* SECTION: Trip Locations */}
      <Box>
        <Typography sx={formSectionTitleSx}>Trip Locations</Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextField
            fullWidth
            size="small"
            label="Pickup Point"
            name="pickupPoint"
            value={values.pickupPoint}
            onChange={handleChange}
            error={touched.pickupPoint && !!errors.pickupPoint}
            helperText={touched.pickupPoint && errors.pickupPoint}
            disabled={disabled}
            required
            sx={inputSx}
          />
          <TextField
            fullWidth
            size="small"
            label="Drop Point"
            name="dropPoint"
            value={values.dropPoint}
            onChange={handleChange}
            error={touched.dropPoint && !!errors.dropPoint}
            helperText={touched.dropPoint && errors.dropPoint}
            disabled={disabled}
            required
            sx={inputSx}
          />
        </div>
      </Box>

      {/* SECTION: Odometer & Fare */}
      <Box>
        <Typography sx={formSectionTitleSx}>Odometer & Fare</Typography>
        <div className="grid grid-cols-1 gap-4">
          
          {/* Odometer Start Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Start Kilometers"
              name="startKm"
              value={values.startKm}
              onChange={handleChange}
              error={touched.startKm && !!errors.startKm}
              helperText={touched.startKm && errors.startKm}
              disabled={disabled}
              required
              sx={inputSx}
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                disabled={disabled}
                sx={{ 
                  ...fileUploadButtonSx,
                  borderColor: (touched.odometerStart && errors.odometerStart) ? "error.main" : "divider",
                }}
              >
                <Typography variant="body2" noWrap sx={{ ...fileNameSx, opacity: values.odometerStart ? 1 : 0.6 }}>
                  {values.odometerStart
                    ? typeof values.odometerStart === "string"
                      ? "Odometer Start Image"
                      : (values.odometerStart as File).name
                    : "Upload Odometer Start"}
                </Typography>
                <Typography variant="caption" sx={chooseTextSx}>
                  CHOOSE
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFieldTouched("odometerStart", true, false);
                    setFieldValue("odometerStart", file);
                  }}
                />
              </Button>
              {(touched.odometerStart && errors.odometerStart) && (
                <Typography variant="caption" color="error" sx={errorTextSx}>
                  {errors.odometerStart}
                </Typography>
              )}
              {values.odometerStart && (
                <Box sx={imagePreviewBoxSx}>
                  <Image
                    src={typeof values.odometerStart === "string" ? values.odometerStart : URL.createObjectURL(values.odometerStart)}
                    alt="odometer start"
                    fill
                    className="object-cover rounded border"
                  />
                </Box>
              )}
            </Box>
          </div>

          {/* Odometer End Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            <TextField
              fullWidth
              size="small"
              type="number"
              label="End Kilometers"
              name="endKm"
              value={values.endKm}
              onChange={handleChange}
              error={touched.endKm && !!errors.endKm}
              helperText={touched.endKm && errors.endKm}
              disabled={disabled}
              required
              sx={inputSx}
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                disabled={disabled}
                sx={{ 
                  ...fileUploadButtonSx,
                  borderColor: (touched.odometerEnd && errors.odometerEnd) ? "error.main" : "divider",
                }}
              >
                <Typography variant="body2" noWrap sx={{ ...fileNameSx, opacity: values.odometerEnd ? 1 : 0.6 }}>
                  {values.odometerEnd
                    ? typeof values.odometerEnd === "string"
                      ? "Odometer End Image"
                      : (values.odometerEnd as File).name
                    : "Upload Odometer End"}
                </Typography>
                <Typography variant="caption" sx={chooseTextSx}>
                  CHOOSE
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setFieldTouched("odometerEnd", true, false);
                    setFieldValue("odometerEnd", file);
                  }}
                />
              </Button>
              {(touched.odometerEnd && errors.odometerEnd) && (
                <Typography variant="caption" color="error" sx={errorTextSx}>
                  {errors.odometerEnd}
                </Typography>
              )}
              {values.odometerEnd && (
                <Box sx={imagePreviewBoxSx}>
                  <Image
                    src={typeof values.odometerEnd === "string" ? values.odometerEnd : URL.createObjectURL(values.odometerEnd)}
                    alt="odometer end"
                    fill
                    className="object-cover rounded border"
                  />
                </Box>
              )}
            </Box>
          </div>

          {/* Summary & Fare Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              fullWidth
              size="small"
              label="Total Kilometers"
              value={totalKm ?? 0}
              InputProps={{ readOnly: true }}
              sx={totalKmFieldSx}
            />
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Fare"
              name="fare"
              value={values.fare}
              onChange={handleChange}
              error={touched.fare && !!errors.fare}
              helperText={touched.fare && errors.fare}
              disabled={disabled}
              sx={inputSx}
            />
          </div>
        </div>
      </Box>
    </Box>
  );
};

export default VendorFormFields;
