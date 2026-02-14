// src/components/ui/user-dialog/BasicInformation.tsx
import React from "react";
import {
  TextField,
  Box,
  MenuItem,
  Typography,
} from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import {
  GENDER_OPTIONS,
  FIELD_LABELS,
} from "@/fe/modules/user/constants/users";
import NomineeSection from "./NomineeSection";
import RequiredDocuments from "./RequiredDocuments";
import { FIELD_LABELS } from "@/constants/users";

interface BasicInformationProps {
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ editId }) => {
  const { setFieldTouched } = useFormikContext();
  const toDateInputString = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
      return value;
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };

  return (
    <>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 600 }}>
        {FIELD_LABELS.BASIC_INFO}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <PhotoUpload />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="name">
          {({ field, meta, form }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.FULL_NAME}
              size="small"
              autoFocus
              fullWidth
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
              onChange={(e) => {
                form.setFieldTouched(field.name, true, true);
                form.setFieldValue(field.name, e.target.value);
              }}
            />
          )}
        </Field>

        <Field name="email">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.EMAIL}
              size="small"
              fullWidth
<<<<<<< HEAD
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
=======
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
>>>>>>> d489b44 (fix: fixed ui of add/edit user dialog)
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
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
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
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
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
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
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
<<<<<<< HEAD
=======
        <Field name="panNumber">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.PAN_NUMBER}
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={(meta.touched && meta.error) || "Format: ABCDE1234F"}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                const value = e.target.value.toUpperCase().trim();
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({
                    target: { name: field.name, value: value },
                  });
                }
              }}
              inputProps={{
                maxLength: 10,
                style: { textTransform: "uppercase" },
              }}
            />
          )}
        </Field>
>>>>>>> d489b44 (fix: fixed ui of add/edit user dialog)
      </Box>
      <Field name="address">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.ADDRESS}
            size="small"
            fullWidth
            error={!!meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              flex: 1,
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
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
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
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
                '& input[type="date"]': {
                  WebkitAppearance: "none",
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
              size="small"
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
                '& input[type="date"]': {
                  WebkitAppearance: "none",
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
              size="small"
              fullWidth
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                flex: 1,
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

      <RequiredDocuments />
      <NomineeSection />
    </>
  );
};

export default BasicInformation;