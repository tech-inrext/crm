import React from "react";
import {
  Box,
  TextField,
  Typography,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Field, FieldProps } from "formik";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "follow-up", label: "Follow-Up" },
  { value: "call back", label: "Call Back" },
  { value: "not connected", label: "Not Connected" },
  { value: "details shared", label: "Details Shared" },
  { value: "site visit done", label: "Site Visit Done" },
  { value: "closed", label: "Closed" },
  { value: "not interested", label: "Not Interested" },
  // { value: "", label: "No Status" }, // optional placeholder for empty
];

const sourceOptions = [
  { value: "Website", label: "Website" },
  { value: "Referral", label: "Referral" },
  { value: "Raw Data", label: "Raw Data" },
  { value: "Social Media", label: "Social Media" },
  { value: "Google", label: "Google" },
  { value: "Activity", label: "Activity" },
  { value: "Direct Call", label: "Direct Call" },
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
            getOptionKey={(option) => option._id || option.id}
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
                <Box
                  component="li"
                  key={option._id || option.id || key}
                  {...rest}
                >
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
            <DateTimePicker
              label="Next Follow-up"
              value={values.nextFollowUp ? new Date(values.nextFollowUp) : null}
              onChange={(date) => {
                setFieldValue("nextFollowUp", date ? date.toISOString() : "");
              }}
              slotProps={{
                textField: {
                  error: meta.touched && !!meta.error,
                  helperText: meta.touched && meta.error,
                  placeholder: "dd/mm/yyyy hh:mm",
                  sx: { bgcolor: "#fff", borderRadius: 1, flex: 1, height: 56 },
                },
              }}
              format="dd/MM/yyyy HH:mm"
            />
          </LocalizationProvider>
        )}
      </Field>
    </Box>
  </>
);

export default LeadManagement;
