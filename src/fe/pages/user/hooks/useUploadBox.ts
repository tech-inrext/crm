"use client";
import { useState } from "react";

export const useUploadBox = () => {
  const [localError, setLocalError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    form?: any,
    fieldName?: string,
  ) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    const maxBytes = 50 * 1024 * 1024; // 50 MB
    if (f.size > maxBytes) {
      if (form && typeof form.setFieldError === "function" && fieldName) {
        form.setFieldError(fieldName, "File must be less than 50MB");
      }
      setLocalError("File must be less than 50MB");
      e.target.value = "";
    } else {
      form?.setFieldValue?.(fieldName!, f);
      const urlField = fieldName?.replace(/File$/, "Url");
      form?.setFieldValue?.(urlField!, "");
      form?.setFieldError?.(fieldName!, undefined);
      setLocalError(null);
    }
  };

  const handleRemove = (form?: any, fieldName?: string) => {
    const urlField = fieldName?.replace(/File$/, "Url");
    form?.setFieldValue?.(fieldName!, null);
    form?.setFieldValue?.(urlField!, "");
    form?.setFieldError?.(fieldName!, undefined);
    setLocalError(null);
  };

  return { localError, handleFileChange, handleRemove } as const;
};

export default useUploadBox;
