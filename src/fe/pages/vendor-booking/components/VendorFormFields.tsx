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
    setFieldError,
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
        setFieldError(name, "File size must be 1 MB or smaller.");
        setError("File size must be 1 MB or smaller.");
      } else {
        setFieldValue(name, file);
        setFieldError(name, undefined as any);
        setError(null);
      }
    } else {
      setFieldValue(name, null);
      setFieldError(name, undefined as any);
      setError(null);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Cab Owner Name"
          name="cabOwner"
          value={values.cabOwner}
          onChange={handleChange}
          onBlur={() => setFieldTouched("cabOwner", true)}
          error={touched.cabOwner && !!errors.cabOwner}
          helperText={touched.cabOwner && errors.cabOwner}
          disabled={disabled}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Driver Name"
          name="driverName"
          value={values.driverName}
          onChange={handleChange}
          onBlur={() => setFieldTouched("driverName", true)}
          error={touched.driverName && !!errors.driverName}
          helperText={touched.driverName && errors.driverName}
          disabled={disabled}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Aadhar Number (Driver)"
          name="aadharNumber"
          value={values.aadharNumber}
          onChange={(e) => setFieldValue("aadharNumber", e.target.value.replace(/\D/g, ""))}
          onBlur={() => setFieldTouched("aadharNumber", true)}
          error={touched.aadharNumber && !!errors.aadharNumber}
          helperText={touched.aadharNumber && errors.aadharNumber}
          disabled={disabled}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="DL Number (Driver)"
          name="dlNumber"
          value={values.dlNumber}
          onChange={handleChange}
          onBlur={() => setFieldTouched("dlNumber", true)}
          error={touched.dlNumber && !!errors.dlNumber}
          helperText={touched.dlNumber && errors.dlNumber}
          disabled={disabled}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Pickup Point"
          name="pickupPoint"
          value={values.pickupPoint}
          onChange={handleChange}
          onBlur={() => setFieldTouched("pickupPoint", true)}
          error={touched.pickupPoint && !!errors.pickupPoint}
          helperText={touched.pickupPoint && errors.pickupPoint}
          disabled={disabled}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Drop Point"
          name="dropPoint"
          value={values.dropPoint}
          onChange={handleChange}
          onBlur={() => setFieldTouched("dropPoint", true)}
          error={touched.dropPoint && !!errors.dropPoint}
          helperText={touched.dropPoint && errors.dropPoint}
          disabled={disabled}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Start Kilometers"
          name="startKm"
          value={values.startKm}
          onChange={handleChange}
          onBlur={() => setFieldTouched("startKm", true)}
          error={touched.startKm && !!errors.startKm}
          helperText={touched.startKm && errors.startKm}
          disabled={disabled}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Box>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block" }}>
            Odometer Start Image (Max 1 MB)
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            disabled={disabled}
            sx={{ height: 56, justifyContent: "flex-start", px: 2, textTransform: "none" }}
          >
            {values.odometerStart
              ? typeof values.odometerStart === "string"
                ? "Image Uploaded"
                : (values.odometerStart as File).name
              : "Choose File"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleFileChange("odometerStart", e.target.files?.[0] || null)}
            />
          </Button>
          {(odometerStartLocalError || (touched.odometerStart && errors.odometerStart)) && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
              {odometerStartLocalError || errors.odometerStart}
            </Typography>
          )}
          {values.odometerStart && (
            <Box sx={{ mt: 1, position: "relative", width: 120, height: 80 }}>
              <Image
                src={typeof values.odometerStart === "string" ? values.odometerStart : URL.createObjectURL(values.odometerStart)}
                alt="odometer start"
                fill
                className="object-cover rounded border"
              />
            </Box>
          )}
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="End Kilometers"
          name="endKm"
          value={values.endKm}
          onChange={handleChange}
          onBlur={() => setFieldTouched("endKm", true)}
          error={touched.endKm && !!errors.endKm}
          helperText={touched.endKm && errors.endKm}
          disabled={disabled}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Box>
          <Typography variant="caption" color="textSecondary" sx={{ mb: 1, display: "block" }}>
            Odometer End Image (Max 1 MB)
          </Typography>
          <Button
            variant="outlined"
            component="label"
            fullWidth
            disabled={disabled}
            sx={{ height: 56, justifyContent: "flex-start", px: 2, textTransform: "none" }}
          >
            {values.odometerEnd
              ? typeof values.odometerEnd === "string"
                ? "Image Uploaded"
                : (values.odometerEnd as File).name
              : "Choose File"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleFileChange("odometerEnd", e.target.files?.[0] || null)}
            />
          </Button>
          {(odometerEndLocalError || (touched.odometerEnd && errors.odometerEnd)) && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
              {odometerEndLocalError || errors.odometerEnd}
            </Typography>
          )}
          {values.odometerEnd && (
            <Box sx={{ mt: 1, position: "relative", width: 120, height: 80 }}>
              <Image
                src={typeof values.odometerEnd === "string" ? values.odometerEnd : URL.createObjectURL(values.odometerEnd)}
                alt="odometer end"
                fill
                className="object-cover rounded border"
              />
            </Box>
          )}
        </Box>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Total Kilometers"
          value={totalKm ?? ""}
          disabled
          InputProps={{ readOnly: true }}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          type="number"
          label="Fare"
          name="fare"
          value={values.fare}
          onChange={handleChange}
          onBlur={() => setFieldTouched("fare", true)}
          error={touched.fare && !!errors.fare}
          helperText={touched.fare && errors.fare}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

export default VendorFormFields;
