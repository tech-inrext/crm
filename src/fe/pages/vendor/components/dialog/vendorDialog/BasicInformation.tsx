import React from "react";
import { TextField, Box, Typography } from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import { FIELD_LABELS } from "@/fe/pages/vendor/constants/vendors";

const BasicInformation: React.FC = () => {
  const { setFieldTouched } = useFormikContext();

  return (
    <>
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
        {FIELD_LABELS.BASIC_INFO}
      </Typography>

      {/* Name */}
      <Field name="name">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.FULL_NAME}
            autoFocus
            fullWidth
            margin="normal"
            error={!!meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
            onChange={(e) => {
              setFieldTouched(field.name, true, true);
              field.onChange(e);
            }}
          />
        )}
      </Field>

      {/* Email + Phone */}
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
              label={FIELD_LABELS.EMAIL}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              onChange={(e) => {
                setFieldTouched(field.name, true, true);
                field.onChange(e);
              }}
            />
          )}
        </Field>

        <Field name="phone">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.PHONE}
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              onChange={(e) => {
                setFieldTouched(field.name, true, true);
                const digits = (e.target as HTMLInputElement).value.replace(
                  /\D/g,
                  "",
                );
                field.onChange({ target: { name: field.name, value: digits } });
              }}
            />
          )}
        </Field>
      </Box>

      {/* Address */}
      <Field name="address">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.ADDRESS}
            fullWidth
            margin="normal"
            error={!!meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            sx={{ bgcolor: "#fff", borderRadius: 1 }}
          />
        )}
      </Field>
    </>
  );
};

export default BasicInformation;
