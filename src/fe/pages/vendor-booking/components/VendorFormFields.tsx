"use client";

import React, { useState } from "react";
import { useFormikContext } from "formik";
import Image from "next/image";
import { 
  TextField, 
  Box, 
  Typography, 
  Grid,
  Button
} from "@/components/ui/Component";
import { inputSx, formSectionTitleSx } from "./styles";

interface Values {
  cabOwner: string;
  driverName: string;
  aadharNumber: string;
  dlNumber: string;
  startKm: string | number;
  endKm: string | number;
  odometerStart: File | string | null;
  odometerEnd: File | string | null;
  fare: string | number | null;
  pickupPoint: string;
  dropPoint: string;
}

interface Props {
  disabled?: boolean;
  totalKm?: number | string;
}

const VendorFormFields: React.FC<Props> = ({
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
  } = useFormikContext<Values>();

  const [odometerStartLocalError, setOdometerStartLocalError] = useState<string | null>(null);
  const [odometerEndLocalError, setOdometerEndLocalError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

  const handleFileChange = (name: "odometerStart" | "odometerEnd", file: File | null) => {
    const setError = name === "odometerStart" ? setOdometerStartLocalError : setOdometerEndLocalError;
    setFieldTouched(name, true, false);
    
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setFieldValue(name, null);
        setError("File size must be 1 MB or smaller.");
      } else {
        setFieldValue(name, file);
        setError(null);
      }
    } else {
      setFieldValue(name, null);
      setError(null);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* SECTION: Owner & Driver */}
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
                  height: 40, 
                  justifyContent: "space-between", 
                  px: 1.5, 
                  textTransform: "none",
                  borderColor: (odometerStartLocalError || (touched.odometerStart && errors.odometerStart)) ? "error.main" : "divider",
                  color: "text.primary",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  "&:hover": {
                    background: "rgba(25, 118, 210, 0.08)",
                    borderColor: "primary.main",
                    color: "primary.main",
                  }
                }}
              >
                <Typography variant="body2" noWrap sx={{ maxWidth: "70%", opacity: values.odometerStart ? 1 : 0.6 }}>
                  {values.odometerStart
                    ? typeof values.odometerStart === "string"
                      ? "Odometer Start Image"
                      : (values.odometerStart as File).name
                    : "Upload Odometer Start"}
                </Typography>
                <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>
                  CHOOSE
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange("odometerStart", e.target.files?.[0] || null)}
                />
              </Button>
              {(odometerStartLocalError || (touched.odometerStart && errors.odometerStart)) && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block", ml: 1 }}>
                  {odometerStartLocalError || errors.odometerStart}
                </Typography>
              )}
              {values.odometerStart && (
                <Box sx={{ mt: 1, position: "relative", width: 60, height: 40 }}>
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
                    height: 40, 
                    justifyContent: "space-between", 
                    px: 1.5, 
                    textTransform: "none",
                    borderColor: (odometerEndLocalError || (touched.odometerEnd && errors.odometerEnd)) ? "error.main" : "divider",
                    color: "text.primary",
                    fontSize: "0.875rem",
                    fontWeight: 400,
                    "&:hover": { 
                        borderColor: "primary.main",
                        bgcolor: "rgba(25, 118, 210, 0.04)",
                        color: "text.primary"
                    }
                }}
              >
                <Typography variant="body2" noWrap sx={{ maxWidth: "70%", opacity: values.odometerEnd ? 1 : 0.6 }}>
                  {values.odometerEnd
                    ? typeof values.odometerEnd === "string"
                      ? "Odometer End Image"
                      : (values.odometerEnd as File).name
                    : "Upload Odometer End"}
                </Typography>
                <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 600 }}>
                  CHOOSE
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange("odometerEnd", e.target.files?.[0] || null)}
                />
              </Button>
              {(odometerEndLocalError || (touched.odometerEnd && errors.odometerEnd)) && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block", ml: 1 }}>
                  {odometerEndLocalError || errors.odometerEnd}
                </Typography>
              )}
              {values.odometerEnd && (
                <Box sx={{ mt: 1, position: "relative", width: 60, height: 40 }}>
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
              sx={{
                ...inputSx,
                "& .MuiInputBase-root": {
                  ...inputSx["& .MuiInputBase-root"],
                  bgcolor: "rgba(25, 118, 210, 0.04)",
                },
                "& .MuiInputBase-input": {
                  ...inputSx["& .MuiInputBase-input"],
                  color: "primary.main",
                  fontWeight: 700,
                }
              }}
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
