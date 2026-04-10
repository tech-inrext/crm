"use client";

import React from "react";
import VendorFormFields from "./VendorFormFields";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  CloseIcon,
  Divider
} from "@/components/ui/Component";

interface VendorBookingFormProps {
  disabled?: boolean;
  bookingId?: string | null;
  onSubmit?: (formData: any) => void;
  onClose?: () => void;
}

const VendorBookingForm: React.FC<VendorBookingFormProps> = ({
  disabled,
  bookingId,
  onSubmit,
  onClose,
}) => {
  const validationSchema = Yup.object()
    .shape({
      cabOwner: Yup.string()
        .trim()
        .min(3, "Please provide the cab owner's full name (minimum 3 characters).")
        .required("Cab owner's name is required."),
      driverName: Yup.string()
        .trim()
        .min(3, "Please provide the driver's full name (minimum 3 characters).")
        .required("Driver name is required."),
      aadharNumber: Yup.string()
        .nullable()
        .transform((v) => (v ? String(v).replace(/\D/g, "") : ""))
        .test(
          "aadhar-length",
          "Aadhar number must contain 12 digits.",
          (val) => !val || val.length >= 12
        ),
      dlNumber: Yup.string()
        .nullable()
        .transform((v) => (v ? String(v) : ""))
        .test(
          "dl-length",
          "Driver's license must contain 10 alphanumeric characters.",
          (val) => !val || String(val).replace(/[^a-zA-Z0-9]/g, "").length >= 10
        ),
      pickupPoint: Yup.string()
        .trim()
        .min(3, "Please enter a valid pickup location (minimum 3 characters).")
        .required("Pickup point is required."),
      dropPoint: Yup.string()
        .trim()
        .min(3, "Please enter a valid drop location (minimum 3 characters).")
        .required("Drop point is required."),
      startKm: Yup.number()
        .typeError("Please enter the start odometer reading as a number.")
        .required("Start kilometers is required."),
      endKm: Yup.number()
        .typeError("Please enter the end odometer reading as a number.")
        .required("End kilometers is required."),
      fare: Yup.number()
        .nullable()
        .transform((v) => (v === "" ? null : Number(v))),
    })
    .test(
      "end-gte-start",
      "End kilometers must be greater than or equal to start kilometers.",
      function (values) {
        const { startKm, endKm } = values as any;
        if (startKm === undefined || endKm === undefined) return true;
        const s = Number(startKm);
        const e = Number(endKm);
        if (Number.isNaN(s) || Number.isNaN(e)) return true;
        return e >= s;
      }
    );

  const initialValues = {
    cabOwner: "",
    driverName: "",
    aadharNumber: "",
    dlNumber: "",
    startKm: "",
    endKm: "",
    odometerStart: null as File | string | null,
    odometerEnd: null as File | string | null,
    fare: "",
    pickupPoint: "",
    dropPoint: "",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "background.paper" }}>
        <Box>
          <Typography variant="h6" fontWeight={700} color="text.primary" sx={{ lineHeight: 1.2 }}>
            Cab Vendor Details
          </Typography>
          {bookingId && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", letterSpacing: "0.02em" }}>
              Booking ID: {bookingId}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" disabled={disabled} sx={{ color: "text.secondary" }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      
      <Divider />

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        validateOnBlur={true}
        validateOnChange={true}
        onSubmit={(values, { setSubmitting }) => {
          const totalKm = (() => {
            const isNumericString = (v: any) =>
              typeof v === "string" &&
              v.trim() !== "" &&
              !Number.isNaN(Number(v));

            if (
              isNumericString(values.odometerStart) &&
              isNumericString(values.odometerEnd)
            ) {
              return Math.max(
                Number(values.odometerEnd) - Number(values.odometerStart),
                0
              );
            }
            if (values.startKm !== "" && values.endKm !== "") {
              return Math.max(Number(values.endKm) - Number(values.startKm), 0);
            }
            return 0;
          })();

          if (onSubmit) {
            onSubmit({
              cabOwner: values.cabOwner,
              driverName: values.driverName,
              aadharNumber: values.aadharNumber,
              dlNumber: values.dlNumber,
              startKm: values.startKm,
              endKm: values.endKm,
              odometerStartPreview:
                values.odometerStart && typeof values.odometerStart !== "string"
                  ? null
                  : values.odometerStart,
              odometerEndPreview:
                values.odometerEnd && typeof values.odometerEnd !== "string"
                  ? null
                  : values.odometerEnd,
              odometerStartFile:
                values.odometerStart instanceof File
                  ? values.odometerStart
                  : null,
              odometerEndFile:
                values.odometerEnd instanceof File ? values.odometerEnd : null,
              fare: values.fare ? Number(values.fare) : null,
              pickupPoint: values.pickupPoint,
              dropPoint: values.dropPoint,
              totalKm,
            });
          }

          setSubmitting(false);
        }}
      >
        {({ values }) => {
          const totalKm = (() => {
            if (values.startKm !== "" && values.endKm !== "") {
              return Math.max(Number(values.endKm) - Number(values.startKm), 0);
            }
            return 0;
          })();

          return (
            <Form>
              <Box sx={{ px: 3, py: 3, maxHeight: "calc(90vh - 120px)", overflowY: "auto" }}>
                <VendorFormFields
                  disabled={disabled}
                  totalKm={totalKm}
                />
              </Box>

              <Box sx={{ px: 3, py: 2.5, display: "flex", gap: 2, justifyContent: "flex-end", bgcolor: "#fcfcfc" }}>
                <Button
                  variant="outlined"
                  onClick={onClose}
                  disabled={disabled}
                  sx={{ textTransform: "none", px: 3, borderRadius: 1.5, borderColor: "divider", color: "text.secondary" }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={disabled}
                  sx={{ textTransform: "none", px: 4, borderRadius: 1.5, boxShadow: "none", "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" } }}
                >
                  Submit Form
                </Button>
              </Box>
            </Form>
          );
        }}
      </Formik>
    </Box>
  );
};

export default VendorBookingForm;
