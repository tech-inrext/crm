import React from "react";
import { IconButton } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { previewIsImage } from "@/fe/pages/user/utils";
import usePhotoUpload from "@/fe/pages/user/hooks/usePhotoUpload";
import { CameraAlt } from "@mui/icons-material";
import CloseIcon from "@/components/ui/Component/CloseIcon";

const PhotoUpload: React.FC = () => (
  <Field name="photoFile">
    {({ form, meta }: FieldProps & { form?: any }) => {
      const { localError, isHovered, setIsHovered, handleFileChange, handleRemove } = usePhotoUpload();
      const fileValue = form?.values?.photoFile || null;
      const photoUrl = form?.values?.photo || null;
      const isFile = fileValue instanceof File;
      const isUrl = typeof photoUrl === "string" && photoUrl.trim() !== "";

      return (
        <div className="flex flex-col flex-1">
          <input
            accept="image/*"
            className="hidden"
            id="photo-upload"
            type="file"
            onChange={(e) => handleFileChange(e, form)}
          />

          <div className="relative w-20 h-20 mx-auto mb-3">
            <div
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => document.getElementById("photo-upload")?.click()}
              className={`w-full h-full rounded-full overflow-hidden cursor-pointer border-4 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md ${isUrl || isFile
                  ? "border-blue-500 bg-transparent"
                  : "border-slate-300 bg-slate-100"
                }`}
            >
              {isUrl && previewIsImage(photoUrl) ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover object-top" />
              ) : isFile ? (
                <img src={URL.createObjectURL(fileValue)} alt="Profile" className="w-full h-full object-cover object-top" />
              ) : (
                <div className="text-center text-slate-500">
                  <CameraAlt className="text-2xl" />
                  <p className="mt-1 text-[10px]">Click to upload</p>
                </div>
              )}

              {isHovered && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-medium">
                  {isUrl || isFile ? "Change Photo" : "Upload Photo"}
                </div>
              )}
            </div>

            {(isUrl || isFile) && (
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

          {(localError || (meta?.touched && meta?.error)) && (
            <p className="text-red-500 text-xs mt-1 text-center">{localError || meta.error}</p>
          )}
        </div>
      );
    }}
  </Field>
);

export default PhotoUpload;
