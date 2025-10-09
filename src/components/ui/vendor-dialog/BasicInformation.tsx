import React from "react";
import { TextField, Box, MenuItem, Typography } from "@mui/material";
import { Field, FieldProps, useFormikContext } from "formik";
import { FIELD_LABELS } from "@/constants/vendors";

interface BasicInformationProps {
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ editId }) => {
  const { setFieldTouched } = useFormikContext();
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
            onChange={(e) => {
              if (field.name) setFieldTouched(field.name, true, true);
              if ((field as any).onChange) (field as any).onChange(e);
            }}
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
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
            />
          )}
        </Field>
        <Field name="phone">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS?.PHONE || "Phone"}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                const v = (e.target as HTMLInputElement).value.replace(
                  /\D/g,
                  ""
                );
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({
                    target: { name: field.name, value: v },
                  });
                }
              }}
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
      </Box>
    </>
  );
};

export default BasicInformation;
