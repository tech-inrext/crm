import React from "react";
import {
  TextField,
  Box,
  MenuItem,
  Typography,
} from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import { GENDER_OPTIONS, FIELD_LABELS } from "@/constants/users";
import NomineeSection from "./NomineeSection";
import RequiredDocuments from "./RequiredDocuments";

const genderOptions = GENDER_OPTIONS.map((gender) => ({
  value: gender,
  label: gender,
}));

interface BasicInformationProps {
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ editId }) => {
  const { setFieldTouched } = useFormikContext();
  // Convert various date representations to a yyyy-mm-dd string suitable for
  // an HTML date input. This preserves the local date instead of shifting
  // across timezones (which toISOString() alone would do).
  const toDateInputString = (value: any): string => {
    if (!value) return "";
    // already in yyyy-mm-dd form
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
      return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    // adjust to local date by removing timezone offset
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  return (
    <>
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
        {FIELD_LABELS.BASIC_INFO}
      </Typography>

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
              label={FIELD_LABELS.EMAIL}
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
              label={FIELD_LABELS.PHONE}
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

      {/* Basic fields continued: Alt phone / Address */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="altPhone">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.ALT_PHONE}
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
        <Field name="fatherName">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.FATHER_NAME}
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
      </Box>
      <Field name="address">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.ADDRESS}
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
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="gender">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.GENDER}
              select
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>
        <Field name="dateOfBirth">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={toDateInputString(field.value)}
              label={FIELD_LABELS.DATE_OF_BIRTH}
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                height: 56,
                '& input[type="date"]': {
                  height: "56px",
                  fontSize: "16px",
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                  appearance: "none",
                  lineHeight: "normal",
                  padding: "0 14px",
                },
              }}
              onChange={(e) => {
                const v = e.target.value || "";
                if (field.name) setFieldTouched(field.name, true, true);
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
        <Field name="joiningDate">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={toDateInputString(field.value)}
              label={FIELD_LABELS.JOINING_DATE}
              type="date"
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                height: 56,
                '& input[type="date"]': {
                  height: "56px",
                  fontSize: "16px",
                  WebkitAppearance: "none",
                  MozAppearance: "textfield",
                  appearance: "none",
                  lineHeight: "normal",
                  padding: "0 14px",
                },
              }}
              onChange={(e) => {
                const v = e.target.value || "";
                if (field.name) setFieldTouched(field.name, true, true);
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({
                    target: { name: field.name, value: v },
                  });
                }
              }}
            />
          )}
        </Field>
        <Field name="designation">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.DESIGNATION}
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
      </Box>

      <RequiredDocuments />
      <NomineeSection />
    </>
  );
};

export default BasicInformation;
