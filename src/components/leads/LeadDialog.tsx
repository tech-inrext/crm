import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Box,
  Typography,
  Autocomplete,
} from "@mui/material";
import { Formik, Form, Field, FieldProps, FieldArray } from "formik";
import * as Yup from "yup";
import axios from "axios";

// Updated Lead interface matching the API model
export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  propertyType: string;
  location: string;
  budgetRange: string;
  status: string;
  source: string;
  assignedTo?: string;
  nextFollowUp?: string;
  followUpNotes: Array<{ note: string }>;
}

interface LeadDialogProps {
  open: boolean;
  editId: string | null;
  initialData: LeadFormData;
  saving: boolean;
  onClose: () => void;
  onSave: (values: LeadFormData) => void;
}

// Validation schema for lead form
const leadValidationSchema = Yup.object({
  fullName: Yup.string()

    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  email: Yup.string()
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{10,15}$/, "Phone number must be 10-15 digits only")
    .trim(),
  propertyType: Yup.string().oneOf(
    ["Rent", "Buy", "Sell"],
    "Invalid property type"
  ),
  location: Yup.string()
    .max(200, "Location must be less than 200 characters")
    .trim(),
  budgetRange: Yup.string()
    .max(50, "Budget range must be less than 50 characters")
    .trim(),
  status: Yup.string().oneOf(
    ["New", "Contacted", "Site Visit", "Closed", "Dropped"],
    "Invalid status"
  ),
  source: Yup.string()
    .max(100, "Source must be less than 100 characters")
    .trim(),
  assignedTo: Yup.string().max(
    50,
    "Assigned to must be less than 50 characters"
  ),
  nextFollowUp: Yup.date()
    .min(new Date(), "Follow-up date cannot be in the past")
    .nullable(),
  followUpNotes: Yup.array()
    .of(
      Yup.object().shape({
        note: Yup.string()
          .max(500, "Note must be less than 500 characters")
          .trim(),
        date: Yup.date(),
      })
    )
    .default([]),
});

const propertyTypeOptions = [
  { value: "Rent", label: "Rent" },
  { value: "Buy", label: "Buy" },
  { value: "Sell", label: "Sell" },
];

const statusOptions = [
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Site Visit", label: "Site Visit" },
  { value: "Closed", label: "Closed" },
  { value: "Dropped", label: "Dropped" },
];

const sourceOptions = [
  { value: "Web Form", label: "Web Form" },
  { value: "Phone Call", label: "Phone Call" },
  { value: "Email", label: "Email" },
  { value: "Walk-in", label: "Walk-in" },
  { value: "Referral", label: "Referral" },
  { value: "Social Media", label: "Social Media" },
  { value: "Advertisement", label: "Advertisement" },
  { value: "Other", label: "Other" },
];

const budgetRangeOptions = [
  { value: "<1 Lakh", label: "<1 Lakh" },
  { value: "1 Lakh to 10 Lakh", label: "1 Lakh to 10 Lakh" },
  { value: "10 Lakh to 20 Lakh", label: "10 Lakh to 20 Lakh" },
  { value: "20 Lakh to 30 Lakh", label: "20 Lakh to 30 Lakh" },
  { value: "30 Lakh to 50 Lakh", label: "30 Lakh to 50 Lakh" },
  { value: "50 Lakh to 1 Crore", label: "50 Lakh to 1 Crore" },
  { value: ">1 Crore", label: ">1 Crore" },
];

const LeadDialog: React.FC<LeadDialogProps> = ({
  open,
  editId,
  initialData,
  saving,
  onClose,
  onSave,
}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (open) {
      axios
        .get("/api/v0/employee")
        .then((res) => setUsers(res.data.data || []));
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="lead-dialog-title"
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          height: "auto",
        },
      }}
    >
      <Formik
        initialValues={{
          ...initialData,
          status: initialData.status?.trim() || "New",
        }}
        validationSchema={leadValidationSchema}
        enableReinitialize={true}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          await onSave (values);
          setSubmitting(false);
        }}
      >
        {({ setFieldValue, isValid, values }) => (
          <Form>
            <DialogTitle
              id="lead-dialog-title"
              sx={{ fontWeight: 700, color: "#1976d2", fontSize: 20 }}
            >
              {editId ? "Edit Lead" : "Add Lead"}
            </DialogTitle>
            <DialogContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mt: 1,
                maxHeight: "70vh",
                overflowY: "auto",
                px: 3,
              }}
            >
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                Basic Information
              </Typography>

              <Field name="fullName">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    value={values.fullName}
                    onChange={(e) => setFieldValue("fullName", e.target.value)}
                    autoFocus
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    inputProps={{ "aria-label": "Lead full name" }}
                    sx={{ bgcolor: "#fff", borderRadius: 1 }}
                  />
                )}
              </Field>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Field name="email">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Email"
                      type="email"
                      value={values.email}
                      onChange={(e) => setFieldValue("email", e.target.value)}
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      inputProps={{ "aria-label": "Lead email" }}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    />
                  )}
                </Field>{" "}
                
                <Field name="phone">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Phone"
                      value={values.phone}
                      onChange={(e) => {
                        const cleanPhone = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 15);
                        setFieldValue("phone", cleanPhone);
                      }}
                      required
                      error={meta.touched && !!meta.error}
                      helperText={
                        meta.touched && meta.error
                          ? meta.error
                          : "Enter digits only (10-15 characters)"
                      }
                      placeholder="1234567890"
                      inputProps={{
                        "aria-label": "Lead phone",
                        pattern: "[0-9]*",
                        inputMode: "numeric",
                      }}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    />
                  )}
                </Field>
              </Box>

              <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Property Details
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Field name="propertyType">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Property Type"
                      select
                      value={values.propertyType}
                      onChange={(e) =>
                        setFieldValue("propertyType", e.target.value)
                      }
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      inputProps={{ "aria-label": "Property type" }}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    >
                      <MenuItem value="">Select property type...</MenuItem>
                      {propertyTypeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Field>{" "}
                <Field name="budgetRange">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Budget Range"
                      select
                      value={values.budgetRange}
                      onChange={(e) =>
                        setFieldValue("budgetRange", e.target.value)
                      }
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      inputProps={{ "aria-label": "Budget range" }}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    >
                      <MenuItem value="">Select budget range...</MenuItem>
                      {budgetRangeOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Field>
              </Box>

              <Field name="location">
                {({ field, meta }: FieldProps) => (
                  <TextField
                    {...field}
                    label="Location"
                    value={values.location}
                    onChange={(e) => setFieldValue("location", e.target.value)}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                    placeholder="e.g., Bangalore, Whitefield"
                    inputProps={{ "aria-label": "Property location" }}
                    sx={{ bgcolor: "#fff", borderRadius: 1 }}
                  />
                )}
              </Field>

              <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Lead Management
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Field name="status">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Status"
                      select
                      value={values.status}
                      onChange={(e) => setFieldValue("status", e.target.value)}
                      inputProps={{ "aria-label": "Lead status" }}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    >
                      <MenuItem value="">Select status...</MenuItem>
                      {statusOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Field>{" "}
                <Field name="assignedTo">
                  {({ field, meta }: FieldProps) => (
                    <Autocomplete
                      options={users}
                      getOptionLabel={(option) => option.name || ""}
                      value={
                        users.find((user) => user._id === values.assignedTo) ||
                        null
                      }
                      onChange={(_, newValue) => {
                        setFieldValue(
                          "assignedTo",
                          newValue ? newValue._id : ""
                        );
                      }}
                      sx={{ flex: 1 }} // Move flex styling to Autocomplete wrapper
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Assigned To"
                          error={meta.touched && !!meta.error}
                          helperText={meta.touched && meta.error}
                          placeholder="Search and select employee"
                          sx={{ bgcolor: "#fff", borderRadius: 1 }} // Remove flex from inner TextField
                        />
                      )}
                      renderOption={(props, option) => (
                        <Box component="li" {...props}>
                          {option.name}
                        </Box>
                      )}
                      noOptionsText="No employees found"
                      clearOnBlur
                      selectOnFocus
                    />
                  )}
                </Field>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Field name="source">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Source"
                      select
                      value={values.source}
                      onChange={(e) => setFieldValue("source", e.target.value)}
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      inputProps={{ "aria-label": "Lead source" }}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    >
                      <MenuItem value="">Select source...</MenuItem>
                      {sourceOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                </Field>

                <Field name="nextFollowUp">
                  {({ field, meta }: FieldProps) => (
                    <TextField
                      {...field}
                      label="Next Follow-up"
                      type="date"
                      value={values.nextFollowUp || ""}
                      onChange={(e) =>
                        setFieldValue("nextFollowUp", e.target.value)
                      }
                      error={meta.touched && !!meta.error}
                      helperText={meta.touched && meta.error}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{ "aria-label": "Next follow-up date" }}
                      sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                    />
                  )}
                </Field>
              </Box>

              <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                Notes
              </Typography>

              <FieldArray name="followUpNotes">
                {({ push, remove }) => (
                  <Box>
                    {values.followUpNotes.map((note, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          gap: 2,
                          mb: 2,
                          p: 2,
                          border: "1px solid #e0e0e0",
                          borderRadius: 2,
                          bgcolor: "#fff",
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Field name={`followUpNotes.${index}.note`}>
                            {({ field, meta }: FieldProps) => (
                              <TextField
                                {...field}
                                label="Note"
                                multiline
                                rows={2}
                                value={values.followUpNotes[index]?.note || ""}
                                onChange={(e) =>
                                  setFieldValue(
                                    `followUpNotes.${index}.note`,
                                    e.target.value
                                  )
                                }
                                error={meta.touched && !!meta.error}
                                helperText={meta.touched && meta.error}
                                placeholder="Enter note..."
                                inputProps={{
                                  "aria-label": `note ${index + 1}`,
                                }}
                                sx={{ width: "100%" }}
                              />
                            )}
                          </Field>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center" }}
                        ></Box>
                      </Box>
                    ))}

                    <Button
                      variant="outlined"
                      onClick={() =>
                        push({
                          note: "",
                          date: new Date().toISOString().split("T")[0],
                        })
                      }
                      sx={{ mt: 1 }}
                    >
                      Add a note
                    </Button>
                  </Box>
                )}
              </FieldArray>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={onClose}
                disabled={saving}
                sx={{ fontWeight: 600 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                sx={{ fontWeight: 600, bgcolor: "#1976d2", color: "#fff" }}
              >
                {saving ? <CircularProgress size={20} /> : "Save"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default LeadDialog;
