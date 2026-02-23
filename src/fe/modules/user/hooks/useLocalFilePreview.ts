"use client";
import { useEffect, useState } from "react";

export const useLocalFilePreview = (file: File | null) => {
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

  return objectUrl;
};

export default useLocalFilePreview;
