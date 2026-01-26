import React, { useState, useEffect } from "react";
import {
  TextField,
  Box,
  MenuItem,
  Typography,
  IconButton,
} from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import { GENDER_OPTIONS, FIELD_LABELS } from "@/constants/users";
import NomineeSection from "./NomineeSection";
import RequiredDocuments from "./RequiredDocuments";
import UploadFileIcon from "@/components/ui/Component/UploadFile";
import CloseIcon from "@/components/ui/Component/CloseIcon";
import { CameraAlt } from "@mui/icons-material";

const genderOptions = GENDER_OPTIONS.map((gender) => ({
  value: gender,
  label: gender,
}));

interface BasicInformationProps {
  editId: string | null;
}

/* -------------------- Local File Preview Component -------------------- */
const LocalFilePreview: React.FC<{ file: File; alt?: string }> = ({
  file,
  alt,
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setObjectUrl(null);
    };
  }, [file]);

  if (!objectUrl) return null;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={objectUrl}
        alt={alt || file.name}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "top",
          borderRadius: "50%",
        }}
      />
    </Box>
  );
};

/* -------------------- Photo Upload Component (Profile Style) -------------------- */
const PhotoUpload: React.FC = () => {
  const { setFieldTouched } = useFormikContext();
  const [localError, setLocalError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Field name="photoFile">
      {({ form, meta }: FieldProps & { form?: any }) => {
        const fileValue = form?.values?.photoFile || null;
        const photoUrl = form?.values?.photo || null;

        const isFile =
          fileValue &&
          typeof fileValue === "object" &&
          fileValue instanceof File;
        const isUrl = typeof photoUrl === "string" && photoUrl.trim() !== "";

        const previewIsImage = (v: string) =>
          /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(v);

        return (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="photo-upload"
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (!f) return;
                const maxBytes = 50 * 1024 * 1024; // 50 MB
                if (f.size > maxBytes) {
                  if (form && typeof form.setFieldError === "function") {
                    form.setFieldError(
                      "photoFile",
                      "Photo must be less than 50MB",
                    );
                  }
                  setLocalError("Photo must be less than 50MB");
                  e.target.value = "";
                } else {
                  // ✅ Valid file
                  form?.setFieldValue("photoFile", f);
                  form?.setFieldValue("photo", "");
                  form?.setFieldError("photoFile", undefined);
                  setLocalError(null);
                  setFieldTouched("photoFile", true, true);
                }
              }}
            />

            {/* Profile Photo Container */}
            <Box
              sx={{
                position: "relative",
                width: 120,
                height: 120,
                margin: "0 auto 16px auto",
              }}
            >
              {/* CIRCULAR IMAGE CONTAINER */}
              <Box
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => document.getElementById("photo-upload")?.click()}
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  cursor: "pointer",
                  border: "3px solid",
                  borderColor: isUrl || isFile ? "primary.main" : "grey.300",
                  backgroundColor: isUrl || isFile ? "transparent" : "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "scale(1.02)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                }}
              >
                {/* IMAGE / PLACEHOLDER */}
                {isUrl && previewIsImage(photoUrl) ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                ) : isFile && fileValue?.type.startsWith("image/") ? (
                  <img
                    src={URL.createObjectURL(fileValue)}
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "top",
                    }}
                  />
                ) : (
                  <Box sx={{ textAlign: "center", color: "grey.600" }}>
                    <CameraAlt sx={{ fontSize: "2.2rem" }} />
                    <Typography sx={{ mt: 1, fontSize: "0.75rem" }}>
                      Click to upload photo
                    </Typography>
                  </Box>
                )}

                {/* HOVER OVERLAY */}
                {isHovered && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "0.75rem",
                      fontWeight: 500,
                    }}
                  >
                    {isUrl || isFile ? "Change Photo" : "Upload Photo"}
                  </Box>
                )}
              </Box>

              {/* REMOVE BUTTON (FULLY VISIBLE) */}
              {(isUrl || isFile) && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    form?.setFieldValue("photoFile", null);
                    form?.setFieldValue("photo", "");
                  }}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 1,
                    zIndex: 20,
                    width: 28,
                    height: 28,
                    bgcolor: "white",
                    color: "grey.900",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                    "&:hover": {
                      bgcolor: "white",
                      color: "error.main",
                      transform: "scale(1.1)",
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* File Info */}
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
                textAlign: "center",
              }}
            >
              JPG, PNG or WEBP (Max. 1MB)
            </Typography>

            {/* 🔔 Error message (local or Formik) */}
            {(localError || (meta?.touched && meta?.error)) && (
              <Typography
                color="error"
                sx={{ fontSize: 12, mt: 0.5, textAlign: "center" }}
              >
                {localError || meta.error}
              </Typography>
            )}
          </Box>
        );
      }}
    </Field>
  );
};

/* -------------------- Main Component (Original Layout Preserved) -------------------- */
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
      <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
        {FIELD_LABELS.BASIC_INFO}
      </Typography>

      {/* Photo Upload Section - Center Aligned */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 2,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <PhotoUpload />
        </Box>
      </Box>

      {/* Basic Information Fields - Original Layout */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
          mt: 2,
        }}
      >
        <Box sx={{ flex: 1 }}>
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
        </Box>

        <Box sx={{ flex: 1 }}>
          <Field name="email">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                label={FIELD_LABELS.EMAIL}
                fullWidth
                margin="normal"
                error={Boolean(meta.touched && meta.error)}
                helperText={meta.touched && meta.error}
                sx={{ bgcolor: "#fff", borderRadius: 1 }}
              />
            )}
          </Field>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
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
      </Box>

      {/* Basic fields continued: Specialization / fatherName */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="specialization">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.SPECIALIZATION}
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
        <Field name="age">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.AGE}
              type="number"
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

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="panNumber">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={`${FIELD_LABELS.PAN_NUMBER}`}
              fullWidth
              margin="normal"
              required
              error={!!meta.touched && !!meta.error}
              helperText={
                meta.touched && meta.error
                  ? meta.error
                  : "Required. Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)"
              }
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                const value = e.target.value.toUpperCase();
                if ((field as any).onChange) {
                  (field as any).onChange({
                    target: { name: field.name, value: value },
                  });
                }
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
