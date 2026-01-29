// src/components/ui/user-dialog/PhotoUpload.tsx
import React, { useState } from "react";
import { Box, Typography, IconButton } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { CameraAlt } from "@mui/icons-material";
import CloseIcon from "@/components/ui/Component/CloseIcon";

const PhotoUpload: React.FC = () => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Field name="photoFile">
      {({ form, meta }: FieldProps & { form?: any }) => {
        const fileValue = form?.values?.photoFile || null;
        const photoUrl = form?.values?.photo || null;
        const isFile = fileValue instanceof File;
        const isUrl = typeof photoUrl === "string" && photoUrl.trim() !== "";
        const previewIsImage = (v: string) => /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(v);

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          
          const maxBytes = 50 * 1024 * 1024;
          if (file.size > maxBytes) {
            form?.setFieldError("photoFile", "Photo must be less than 50MB");
            setLocalError("Photo must be less than 50MB");
            e.target.value = "";
          } else {
            form?.setFieldValue("photoFile", file);
            form?.setFieldValue("photo", "");
            form?.setFieldError("photoFile", undefined);
            setLocalError(null);
          }
        };

        const handleRemove = (e: React.MouseEvent) => {
          e.stopPropagation();
          form?.setFieldValue("photoFile", null);
          form?.setFieldValue("photo", "");
        };

        return (
          <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="photo-upload"
              type="file"
              onChange={handleFileChange}
            />

            <Box sx={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px auto" }}>
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
                ) : isFile ? (
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

              {(isUrl || isFile) && (
                <IconButton
                  onClick={handleRemove}
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

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: "0.75rem",
                textAlign: "center",
              }}
            >
              JPG, PNG or WEBP (Max. 50MB)
            </Typography>

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

export default PhotoUpload;