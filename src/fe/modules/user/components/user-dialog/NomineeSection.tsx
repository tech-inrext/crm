import React from "react";
import {
  Box,
  MenuItem,
  TextField,
  Typography,
} from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import {
  FIELD_LABELS,
  GENDER_OPTIONS,
} from "@/fe/modules/user/constants/users";

const NomineeSection: React.FC = () => {
  const { setFieldTouched } = useFormikContext();
  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
        {FIELD_LABELS.NOMINEE_DETAILS}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <Field name="nominee.name">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.NOMINEE_FULL_NAME}
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
            />
          )}
        </Field>

        <Field name="nominee.relation">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.NOMINEE_RELATION}
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
            />
          )}
        </Field>

        <Field name="nominee.phone">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.NOMINEE_PHONE}
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                const v = (e.target as HTMLInputElement).value.replace(
                  /\D/g,
                  "",
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

        <Field name="nominee.occupation">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.NOMINEE_OCCUPATION}
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
            />
          )}
        </Field>
      </Box>
    </>
  );
};

export default NomineeSection;
