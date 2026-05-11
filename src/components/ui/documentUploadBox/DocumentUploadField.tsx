"use client";

import React, { memo, useMemo, useRef, useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Typography, Dialog, Button, Stack } from "@mui/material";
import { Close, Description, Visibility, Download } from "@mui/icons-material";
import { Field, FieldProps, FormikProps } from "formik";
import { previewIsImage } from "@/fe/pages/user/utils";
import ImagePreview from "./ImagePreview";
import { documentUploadStyles as styles } from "./styles";

/**
 * Inner component to handle preview logic and hooks correctly
 */
const DocumentUploadInner = memo<{
  id: string;
  label: string;
  fieldName: string;
  form: FormikProps<any>;
  meta: any;
}>(({ id, label, fieldName, form, meta }) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const fileValue = form.values[fieldName] ?? null;
  const urlField = fieldName.replace(/File$/, "Url");
  const urlValue: string = form.values[urlField] ?? "";

  const { isFile, isUrl, isImageFile, hasPreview } = useMemo(
    () => ({
      isFile: fileValue instanceof File,
      isUrl: urlValue.trim() !== "",
      isImageFile: fileValue instanceof File && fileValue.type.startsWith("image/"),
      hasPreview: fileValue instanceof File || urlValue.trim() !== "",
    }),
    [fileValue, urlValue],
  );

  useEffect(() => {
    if (fileValue instanceof File && fileValue.type.startsWith("image/")) {
      const url = URL.createObjectURL(fileValue);
      setLocalPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [fileValue]);

  const hasError = meta.touched && Boolean(meta.error);
  const finalPreviewUrl = isUrl ? urlValue : localPreviewUrl;

  const handleDownload = async () => {
    if (!finalPreviewUrl) return;

    try {
      // Fetch the file to handle cross-origin download attribute restrictions
      const response = await fetch(finalPreviewUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = isFile ? fileValue.name : `${label.replace(/\s+/g, "_")}_${id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the temporary blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Download failed, falling back to direct link:", error);
      // Fallback: just try to open in a new tab if fetch fails (e.g. CORS)
      window.open(finalPreviewUrl, "_blank");
    }
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="subtitle2" sx={styles.label}>
        {label}
      </Typography>

      <input
        accept="image/*,application/pdf"
        type="file"
        style={{ display: "none" }}
        id={id}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            form.setFieldValue(fieldName, file);
            form.setFieldValue(urlField, "");
            form.setFieldError(fieldName, undefined);
          }
        }}
      />

      <Box
        component="label"
        htmlFor={id}
        sx={styles.uploadBox(hasError, hasPreview)}
      >
        {hasPreview ? (
          <>
            {isUrl ? (
              previewIsImage(urlValue) ? (
                <Box sx={styles.previewContainer}>
                  <img src={urlValue} alt={label} style={styles.previewImage} />
                </Box>
              ) : (
                <Box sx={styles.previewBox}>
                  <Description sx={styles.previewIcon} />
                  <Typography variant="caption" sx={styles.previewCaption}>
                    {label}
                  </Typography>
                </Box>
              )
            ) : isImageFile ? (
              <ImagePreview file={fileValue} />
            ) : (
              <Box sx={styles.fileNameBox}>
                <Description sx={styles.previewIcon} />
                <Typography variant="caption" sx={styles.fileNameCaption}>
                  {fileValue.name}
                </Typography>
              </Box>
            )}

            <Tooltip title="Remove file">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.setFieldValue(fieldName, null);
                  form.setFieldValue(urlField, "");
                  form.setFieldError(fieldName, undefined);
                }}
                sx={styles.removeButton}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="View Document">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsPreviewOpen(true);
                }}
                sx={styles.viewButton}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Box sx={styles.emptyStateBox}>
            <Description sx={styles.emptyStateIcon} />
            <Typography variant="caption" sx={styles.emptyStateText}>
              Click to
              <br />
              upload
            </Typography>
          </Box>
        )}
      </Box>

      {hasError && (
        <Typography color="error" variant="caption" sx={styles.errorMessage}>
          {meta.error}
        </Typography>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        sx={styles.previewDialog}
        maxWidth="md"
        fullWidth
      >
        <Box sx={styles.previewHeader}>
          <Typography variant="subtitle1" fontWeight={600}>
            {label} Preview
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<Download />}
              onClick={handleDownload}
              variant="outlined"
            >
              Download
            </Button>
            <IconButton size="small" onClick={() => setIsPreviewOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </Box>
        <Box sx={{ p: 2, textAlign: "center", bgcolor: "#f8f9fa", minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {finalPreviewUrl ? (
            <img
              src={finalPreviewUrl}
              alt={label}
              style={styles.fullPreviewImage}
            />
          ) : (
            <Box sx={{ p: 5 }}>
              <Description sx={{ fontSize: 60, color: "text.disabled" }} />
              <Typography color="text.secondary" mt={2}>
                Full preview not available for this file type
              </Typography>
            </Box>
          )}
        </Box>
      </Dialog>
    </Box>
  );
});

DocumentUploadInner.displayName = "DocumentUploadInner";

/**
 * DocumentUploadField Component
 * Renders a single document upload field with dashed border design
 */
const DocumentUploadField = memo<{
  id: string;
  label: string;
  fieldName: string;
}>(({ id, label, fieldName }) => {
  return (
    <Field name={fieldName}>
      {({ form, meta }: FieldProps) => (
        <DocumentUploadInner
          id={id}
          label={label}
          fieldName={fieldName}
          form={form}
          meta={meta}
        />
      )}
    </Field>
  );
});

DocumentUploadField.displayName = "DocumentUploadField";

export default DocumentUploadField;
