"use client";

import React, { memo } from "react";
import useLocalFilePreview from "@/fe/pages/user/hooks/useLocalFilePreview";
import { documentUploadStyles as styles } from "./styles";

const ImagePreview = memo<{ file: File }>(({ file }) => {
  const objectUrl = useLocalFilePreview(file);
  if (!objectUrl) return null;
  return <img src={objectUrl} alt={file.name} style={styles.imgStyle} />;
});

ImagePreview.displayName = "ImagePreview";

export default ImagePreview;
