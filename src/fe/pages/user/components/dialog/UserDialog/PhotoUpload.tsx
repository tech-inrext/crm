import React, { useRef } from "react";
import { IconButton, CloseIcon } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { previewIsImage } from "@/fe/pages/user/utils";
import usePhotoUpload from "@/fe/pages/user/hooks/usePhotoUpload";
import { CameraAlt } from "@mui/icons-material";

const PhotoUpload: React.FC = () => (
  <Field name="photoFile">
    {({ form, meta }: FieldProps) => {
      const fileInputRef = useRef<HTMLInputElement>(null);
      const { handleFileChange, handleRemove } = usePhotoUpload();
      const fileValue: File | null = form.values.photoFile ?? null;
      const photoUrl: string = form.values.photo ?? "";
      const isFile = fileValue instanceof File;
      const isUrl = photoUrl.trim() !== "";
      const hasPhoto = isFile || isUrl;
      const imageSrc = isFile ? URL.createObjectURL(fileValue) : (isUrl && previewIsImage(photoUrl) ? photoUrl : null);

      return (
        <div className="flex flex-col flex-1">
          <input
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            type="file"
            onChange={(e) => handleFileChange(e, form)}
          />

          <div className="relative w-20 h-20 mx-auto mb-3 group">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-full rounded-full overflow-hidden cursor-pointer border-4 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md ${
                hasPhoto ? "border-blue-500 bg-transparent" : "border-slate-300 bg-slate-100"
              }`}
            >
              {imageSrc ? (
                <img src={imageSrc} alt="Profile" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="text-center text-slate-500">
                  <CameraAlt className="text-2xl" />
                  <p className="mt-1 text-[10px]">Click to upload</p>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-xs font-medium rounded-full">
                {hasPhoto ? "Change Photo" : "Upload Photo"}
              </div>
            </div>

            {hasPhoto && (
              <IconButton
                onClick={(e: React.MouseEvent) => handleRemove(e, form)}
                size="small"
                className="absolute top-0 right-1 z-20 w-7 h-7 bg-white text-slate-800 shadow-md hover:bg-white hover:text-red-500 transition-transform hover:scale-110"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </div>

          <p className="text-center text-[11px] text-slate-400">JPG, PNG or WEBP (Max. 50MB)</p>

          {meta.touched && meta.error && (
            <p className="text-red-500 text-xs mt-1 text-center">{meta.error}</p>
          )}
        </div>
      );
    }}
  </Field>
);

export default PhotoUpload;
