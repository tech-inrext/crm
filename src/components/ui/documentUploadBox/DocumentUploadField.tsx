"use client";

import React, { memo, useMemo, useRef } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { Close, Description } from "@mui/icons-material";
import { Field, FieldProps } from "formik";
import { previewIsImage } from "@/fe/pages/user/utils";
import ImagePreview from "./ImagePreview";
import { documentUploadStyles as styles } from "./styles";

/**
 * DocumentUploadField Component
 * Renders a single document upload field with dashed border design
 */
const DocumentUploadField = memo<{
  id: string;
  label: string;
  fieldName: string;
}>(({ id, label, fieldName }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Field name={fieldName}>
      {({ form, meta }: FieldProps) => {
        const fileValue = form.values[fieldName] ?? null;
        const urlField = fieldName.replace(/File$/, "Url");
        const urlValue: string = form.values[urlField] ?? "";

        const { isFile, isUrl, isImageFile, hasPreview } = useMemo(
          () => ({
            isFile: fileValue instanceof File,
            isUrl: urlValue.trim() !== "",
            isImageFile:
              fileValue instanceof File && fileValue.type.startsWith("image/"),
            hasPreview: fileValue instanceof File || urlValue.trim() !== "",
          }),
          [fileValue, urlValue],
        );

        const hasError = meta.touched && Boolean(meta.error);

        return (
          <Box sx={styles.container}>
            <Typography variant="subtitle2" sx={styles.label}>
              {label}
            </Typography>

            <input
              ref={inputRef}
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
                        <img
                          src={urlValue}
                          alt={label}
                          style={styles.previewImage}
                        />
                      </Box>
                    ) : (
                      <Box sx={styles.previewBox}>
                        <Description sx={styles.previewIcon} />
                        <Typography
                          variant="caption"
                          sx={styles.previewCaption}
                        >
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
              <Typography
                color="error"
                variant="caption"
                sx={styles.errorMessage}
              >
                {meta.error}
              </Typography>
            )}
          </Box>
        );
      }}
    </Field>
  );
});

DocumentUploadField.displayName = "DocumentUploadField";

export default DocumentUploadField;
