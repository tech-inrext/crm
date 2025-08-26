import React from "react";
import { TextField, Box, MenuItem, Typography } from "@mui/material";
import { Field, FieldProps } from "formik";
import { GENDER_OPTIONS, FIELD_LABELS } from "@/constants/vendors";

const genderOptions = GENDER_OPTIONS.map((gender) => ({
  value: gender,
  label: gender,
}));

interface BasicInformationProps {
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ editId }) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
        {FIELD_LABELS?.BASIC_INFO || "Basic Information"}
      </Typography>

      <Field name="name">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS?.FULL_NAME || "Full Name"}
            autoFocus
            fullWidth
            margin="normal"
            error={!!meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
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
              label={FIELD_LABELS?.EMAIL || "Email"}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              InputProps={{ readOnly: !!editId }}
            />
          )}
        </Field>
        <Field name="phone">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS?.PHONE || "Phone"}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              InputProps={{ readOnly: !!editId }}
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
        <Field name="address">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS?.ADDRESS || "Address"}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            />
          )}
        </Field>
        <Field name="gender">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS?.GENDER || "Gender"}
              select
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>
      </Box>
    </>
  );
};

export default BasicInformation;
