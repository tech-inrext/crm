import React from "react";
import { Box, TextField, Typography } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";

interface BasicInformationProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  values,
  setFieldValue,
  editId,
}) => (
  <>
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
      </Field>

      <Field name="phone">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Phone"
            value={values.phone}
            onChange={(e) => {
              const cleanPhone = e.target.value.replace(/\D/g, "").slice(0, 15);
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
              readOnly: Boolean(editId),
            }}
            sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
          />
        )}
      </Field>
    </Box>
  </>
);

export default BasicInformation;
