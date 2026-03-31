"use client";

import React from "react";
import { Box, Button, Typography } from "@/components/ui/Component";
import { useMouPreview } from "../hooks/useMouPreview";
import { PreviewLoaderProps } from "../types";
import {
  previewLoadingSx,
  previewErrorSx,
  previewIframeContainerSx,
  previewIframeHeaderSx,
  previewIframeStyle,
} from "./styles";

const PreviewLoader: React.FC<PreviewLoaderProps> = ({ id }) => {
  const { loading, error, iframeSrc, downloadPdf } = useMouPreview(id);

  if (loading) {
    return (
      <Box sx={previewLoadingSx}>
        Loading preview…
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={previewErrorSx}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (iframeSrc) {
    return (
      <Box sx={previewIframeContainerSx}>
        <Box sx={previewIframeHeaderSx}>
          <Button size="small" variant="outlined" onClick={downloadPdf}>
            Download
          </Button>
        </Box>
        <iframe
          title="MOU Preview"
          src={iframeSrc}
          style={previewIframeStyle}
        />
      </Box>
    );
  }

  return null;
};

export default PreviewLoader;
