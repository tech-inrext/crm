"use client";

import React from "react";
import VendorFormFields from "./VendorFormFields";
import { FormikProvider } from "formik";
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  CloseIcon,
  Divider
} from "@/components/ui/Component";
import { useVendorBookingForm } from "../hooks";
import { VendorBookingFormProps } from "../types";

const VendorBookingForm: React.FC<VendorBookingFormProps> = ({
  disabled,
  bookingId,
  onSubmit,
  onClose,
}) => {
  const { formik, totalKm } = useVendorBookingForm({ onSubmit });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
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

      {/* Form Content */}
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: 3, py: 3, maxHeight: "calc(90vh - 120px)", overflowY: "auto", flexGrow: 1 }}>
            <VendorFormFields
              disabled={disabled}
              totalKm={totalKm}
            />
          </Box>

          {/* Footer Actions */}
          <Box sx={{ px: 3, py: 2.5, display: "flex", gap: 2, justifyContent: "flex-end", bgcolor: "#fcfcfc" }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={disabled || formik.isSubmitting}
              sx={{ textTransform: "none", px: 3, borderRadius: 1.5, borderColor: "divider", color: "text.secondary" }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={disabled || formik.isSubmitting}
              sx={{ textTransform: "none", px: 4, borderRadius: 1.5, boxShadow: "none", "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.15)" } }}
            >
              {formik.isSubmitting ? "Submitting..." : "Submit Form"}
            </Button>
          </Box>
        </form>
      </FormikProvider>
    </Box>
  );
};

export default VendorBookingForm;
