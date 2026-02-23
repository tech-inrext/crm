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
        const previewIsImage = (v: string) =>
          /\.(jpe?g|png|gif|webp|avif|svg)$/i.test(v);

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
          <Box className="flex flex-col flex-1">
            <input
              accept="image/*"
              className="hidden"
              id="photo-upload"
              type="file"
              onChange={handleFileChange}
            />

            <Box className="relative w-20 h-20 mx-auto mb-3">
              <Box
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => document.getElementById("photo-upload")?.click()}
                className={`w-full h-full rounded-full overflow-hidden cursor-pointer border-4 ${
                  isUrl || isFile
                    ? "border-primary bg-transparent"
                    : "border-gray-300 bg-gray-100"
                } flex items-center justify-center transition-all duration-300 ease-in-out hover:border-primary hover:scale-105 hover:shadow-md`}
              >
                {isUrl && previewIsImage(photoUrl) ? (
                  <img
                    src={photoUrl}
                    alt="Profile"
                    className="w-full h-full object-cover object-top"
                  />
                ) : isFile ? (
                  <img
                    src={URL.createObjectURL(fileValue)}
                    alt="Profile"
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <Box className="text-center text-gray-600">
                    <CameraAlt className="text-[1.5rem]" />
                    <Typography className="mt-1.5 text-xs">
                      Click to upload
                    </Typography>
                  </Box>
                )}

                {isHovered && (
                  <Box className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white text-xs font-medium">
                    {isUrl || isFile ? "Change Photo" : "Upload Photo"}
                  </Box>
                )}
              </Box>

              {(isUrl || isFile) && (
                <IconButton
                  onClick={handleRemove}
                  size="small"
                  className="absolute top-0 right-1 z-20 w-7 h-7 bg-white text-gray-900 shadow-md hover:bg-white hover:text-red-500 transform transition-transform duration-150 hover:scale-110"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Typography
              variant="caption"
              className="text-center text-[0.7rem] text-gray-500"
            >
              JPG, PNG or WEBP (Max. 50MB)
            </Typography>

            {(localError || (meta?.touched && meta?.error)) && (
              <Typography className="text-red-600 text-[12px] mt-1 text-center">
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
