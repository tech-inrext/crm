"use client";
import { useState } from "react";

export const usePhotoUpload = () => {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    form?: any,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      form?.setFieldError?.("photoFile", "Photo must be less than 50MB");
      setLocalError("Photo must be less than 50MB");
      e.target.value = "";
    } else {
      form?.setFieldValue?.("photoFile", file);
      form?.setFieldValue?.("photo", "");
      form?.setFieldError?.("photoFile", undefined);
      setLocalError(null);
    }
  };

  const handleRemove = (e: React.MouseEvent, form?: any) => {
    e.stopPropagation();
    form?.setFieldValue?.("photoFile", null);
    form?.setFieldValue?.("photo", "");
  };

  return {
    localError,
    isHovered,
    setIsHovered,
    handleFileChange,
    handleRemove,
  } as const;
};

export default usePhotoUpload;
