import React from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Field, FieldProps } from "formik";

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

interface LeadManagementProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  users: any[];
}

const LeadManagement: React.FC<LeadManagementProps> = ({
  values,
  setFieldValue,
  users,
}) => (
  <>
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
      </Field>

      <Field name="assignedTo">
        {({ field, meta }: FieldProps) => (
          <Autocomplete
            options={users}
            getOptionLabel={(option) => option.name || ""}
            value={users.find((user) => user._id === values.assignedTo) || null}
            onChange={(_, newValue) => {
              setFieldValue("assignedTo", newValue ? newValue._id : "");
            }}
            sx={{ flex: 1 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Assigned To"
                error={meta.touched && !!meta.error}
                helperText={meta.touched && meta.error}
                placeholder="Search and select employee"
                sx={{ bgcolor: "#fff", borderRadius: 1 }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...rest } = props;
              return (
                <Box component="li" key={key} {...rest}>
                  {option.name}
                </Box>
              );
            }}
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
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1, height: 56 }}
            SelectProps={{
              MenuProps: {
                PaperProps: {
                  style: {
                    maxHeight: 300,
                  },
                },
              },
            }}
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
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Next Follow-up"
              value={values.nextFollowUp ? new Date(values.nextFollowUp) : null}
              onChange={(date) => {
                setFieldValue(
                  "nextFollowUp",
                  date ? date.toISOString().split("T")[0] : ""
                );
              }}
              slotProps={{
                textField: {
                  error: meta.touched && !!meta.error,
                  helperText: meta.touched && meta.error,
                  placeholder: "dd/mm/yyyy",
                  sx: { bgcolor: "#fff", borderRadius: 1, flex: 1, height: 56 },
                },
              }}
            />
          </LocalizationProvider>
        )}
      </Field>
    </Box>
  </>
);

export default LeadManagement;
