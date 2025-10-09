"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloseIcon from "@mui/icons-material/Close";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/constants/users";
import ForFreelancer from "./ForFreelancer";

/* -------------------- Local File Preview -------------------- */
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
          maxHeight: 100,
          maxWidth: "100%",
          objectFit: "contain",
          borderRadius: 6,
        }}
      />
    </Box>
  );
};

/* -------------------- Upload Box -------------------- */
const UploadBox: React.FC<{
  id: string;
  label: string;
  fieldName: string;
}> = ({ id, label, fieldName }) => {
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <Field name={fieldName}>
      {({ form, meta }: FieldProps & { form?: any }) => {
        const fileValue = form?.values?.[fieldName] || null;
        const urlField = fieldName.replace(/File$/, "Url");
        const urlValue = form?.values?.[urlField] || null;

        const isFile =
          fileValue &&
          typeof fileValue === "object" &&
          fileValue instanceof File;
        const isUrl = typeof urlValue === "string" && urlValue.trim() !== "";

        const previewIsImage = (v: string) =>
          /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(v);

        return (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <Typography sx={{ mb: 1, fontWeight: 600 }}>{label}</Typography>

            <input
              accept="image/*,application/pdf"
              style={{ display: "none" }}
              id={id}
              type="file"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                if (!f) return;

                const maxBytes = 1 * 1024 * 1024; // 1MB limit

                // 🔴 File size validation
                if (f.size > maxBytes) {
                  form?.setFieldValue(fieldName, "");
                  form?.setFieldError(fieldName, "File must be less than 1 MB");
                  setLocalError("File must be less than 1 MB");
                  return;
                }

                // ✅ Valid file
                form?.setFieldValue(fieldName, f);
                form?.setFieldValue(urlField, "");
                form?.setFieldError(fieldName, undefined);
                setLocalError(null);
              }}
            />

            <Box
              onClick={() => document.getElementById(id)?.click()}
              sx={{
                border: "2px dashed rgba(100, 150, 255, 0.7)",
                borderRadius: 1,
                height: 110,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                cursor: "pointer",
                bgcolor: "transparent",
                p: 1,
                position: "relative",
              }}
            >
              {/* 🖼️ Show existing URL or File Preview */}
              {isUrl ? (
                previewIsImage(urlValue) ? (
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
                      src={urlValue}
                      alt={label}
                      style={{
                        maxHeight: 100,
                        maxWidth: "100%",
                        objectFit: "contain",
                        borderRadius: 6,
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: "center" }}>
                    <UploadFileIcon
                      sx={{ fontSize: 28, color: "text.secondary" }}
                    />
                    <Typography sx={{ mt: 1 }}>View uploaded file</Typography>
                  </Box>
                )
              ) : isFile ? (
                fileValue.type && fileValue.type.startsWith("image/") ? (
                  <LocalFilePreview file={fileValue} alt={label} />
                ) : (
                  <Box sx={{ textAlign: "center" }}>
                    <UploadFileIcon
                      sx={{ fontSize: 28, color: "text.secondary" }}
                    />
                    <Typography sx={{ mt: 1 }}>{fileValue.name}</Typography>
                  </Box>
                )
              ) : (
                <Box sx={{ textAlign: "center" }}>
                  <UploadFileIcon
                    sx={{ fontSize: 28, color: "text.secondary" }}
                  />
                  <Typography sx={{ mt: 1 }}>Click to upload</Typography>
                </Box>
              )}

              {(isUrl || isFile) && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    form?.setFieldValue(fieldName, null);
                    form?.setFieldValue(urlField, "");
                    setLocalError(null);
                  }}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    bgcolor: "rgba(255,255,255,0.6)",
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            {/* 🔔 Error message (local or Formik) */}
            {(localError || (meta?.touched && meta?.error)) && (
              <Typography color="error" sx={{ fontSize: 12, mt: 0.5 }}>
                {localError || meta.error}
              </Typography>
            )}
          </Box>
        );
      }}
    </Field>
  );
};

/* -------------------- Main Component -------------------- */
const RequiredDocuments: React.FC = () => {
  return (
    <>
      <ForFreelancer />

      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
        Required Documents
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 1,
          flexDirection: { xs: "column", sm: "row" },
          flexWrap: "wrap",
        }}
      >
        <UploadBox
          id="aadhar-upload"
          label={FIELD_LABELS.AADHAR}
          fieldName="aadharFile"
        />
        <UploadBox
          id="pan-upload"
          label={FIELD_LABELS.PAN}
          fieldName="panFile"
        />
        <UploadBox
          id="bank-upload"
          label={FIELD_LABELS.BANK_PROOF}
          fieldName="bankProofFile"
        />
        <UploadBox
          id="signature-upload"
          label={FIELD_LABELS.SIGNATURE}
          fieldName="signatureFile"
        />
      </Box>
    </>
  );
};

/* ✅ Default Export Fix */
export default RequiredDocuments;
