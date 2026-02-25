"use client";

import React from "react";
import { IconButton } from "@/components/ui/Component";
import UploadFileIcon from "@/components/ui/Component/UploadFile";
import CloseIcon from "@/components/ui/Component/CloseIcon";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import { previewIsImage } from "@/fe/pages/user/utils";
import useLocalFilePreview from "@/fe/pages/user/hooks/useLocalFilePreview";
import useUploadBox from "@/fe/pages/user/hooks/useUploadBox";
import ForFreelancer from "./ForFreelancer";

// ─── Local preview for a File object ─────────────────────────────────────────

const LocalFilePreview: React.FC<{ file: File; alt?: string }> = ({ file, alt }) => {
  const objectUrl = useLocalFilePreview(file);
  if (!objectUrl) return null;
  return (
    <div className="w-full h-full flex items-center justify-center">
      <img src={objectUrl} alt={alt || file.name} className="max-h-[100px] w-full object-contain rounded-md" />
    </div>
  );
};

// ─── Single upload box ────────────────────────────────────────────────────────

const UploadBox: React.FC<{ id: string; label: string; fieldName: string }> = ({ id, label, fieldName }) => {
  const { localError, handleFileChange, handleRemove } = useUploadBox();

  return (
    <Field name={fieldName}>
      {({ form, meta }: FieldProps & { form?: any }) => {
        const fileValue = form?.values?.[fieldName] || null;
        const urlField = fieldName.replace(/File$/, "Url");
        const urlValue = form?.values?.[urlField] || null;
        const isFile = fileValue && typeof fileValue === "object" && fileValue instanceof File;
        const isUrl = typeof urlValue === "string" && urlValue.trim() !== "";

        return (
          <div className="flex flex-col flex-1">
            <p className="mb-1 font-medium text-sm text-slate-600">{label}</p>
            <input
              accept="image/*,application/pdf"
              className="hidden"
              id={id}
              type="file"
              onChange={(e) => handleFileChange(e, form, fieldName)}
            />

            <div
              onClick={() => document.getElementById(id)?.click()}
              className="relative flex items-center justify-center h-[90px] flex-1 cursor-pointer rounded border-2 border-dashed border-blue-300 bg-transparent p-2 hover:border-blue-500 transition-colors"
            >
              {isUrl ? (
                previewIsImage(urlValue) ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <img src={urlValue} alt={label} className="max-h-[80px] w-full object-contain rounded-md" />
                  </div>
                ) : (
                  <div className="text-center">
                    <UploadFileIcon sx={{ fontSize: 28, color: "text.secondary" }} />
                    <p className="mt-1 text-xs text-slate-500">View uploaded file</p>
                  </div>
                )
              ) : isFile ? (
                fileValue.type && fileValue.type.startsWith("image/") ? (
                  <LocalFilePreview file={fileValue} alt={label} />
                ) : (
                  <div className="text-center">
                    <UploadFileIcon sx={{ fontSize: 28, color: "text.secondary" }} />
                    <p className="mt-1 text-xs text-slate-500 truncate max-w-[80px]">{fileValue.name}</p>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <UploadFileIcon sx={{ fontSize: 28, color: "text.secondary" }} />
                  <p className="mt-1 text-xs text-slate-500">Click to upload</p>
                </div>
              )}

              {(isUrl || isFile) && (
                <IconButton
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    handleRemove(form, fieldName);
                  }}
                  size="small"
                  sx={{ position: "absolute", top: 6, right: 6, bgcolor: "rgba(255,255,255,0.8)" }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </div>

            {(localError || (meta?.touched && meta?.error)) && (
              <p className="text-red-500 text-xs mt-1">{localError || meta.error}</p>
            )}
          </div>
        );
      }}
    </Field>
  );
};

// ─── Required Documents section ───────────────────────────────────────────────

const RequiredDocuments: React.FC = () => (
  <>
    <ForFreelancer />

    <p className="text-base font-semibold text-slate-700 mt-2">
      Required Documents <span className="text-sm font-normal text-slate-400">(Only JPG files allowed)</span>
    </p>

    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-1">
      <UploadBox id="aadhar-upload" label={FIELD_LABELS.AADHAR} fieldName="aadharFile" />
      <UploadBox id="pan-upload" label={FIELD_LABELS.PAN} fieldName="panFile" />
      <UploadBox id="bank-upload" label={FIELD_LABELS.BANK_PROOF} fieldName="bankProofFile" />
      <UploadBox id="sig-upload" label={FIELD_LABELS.SIGNATURE} fieldName="signatureFile" />
    </div>
  </>
);

export default RequiredDocuments;
