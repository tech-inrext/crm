import { SxProps, Theme } from "@mui/material";

export const cardPaperSx: SxProps<Theme> = {
  p: 4,
  position: "relative",
  borderRadius: 3,
  minHeight: 170,
  transition: "transform 150ms ease, box-shadow 150ms ease",
  "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
};

export const mainStackSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export const headerStackSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  gap: 2,
};

export const infoStackSx: SxProps<Theme> = {
  display: "flex",
  gap: 2,
  alignItems: "center",
};

export const avatarSx: SxProps<Theme> = {
  bgcolor: "primary.main",
  width: 56,
  height: 56,
  fontSize: 18,
};

export const nameSx: SxProps<Theme> = {
  fontWeight: 800,
  fontSize: 18,
};

export const emailSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 14,
  mt: 0.5,
};

export const designationSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: 13,
  mt: 0.5,
};

export const actionWrapperSx: SxProps<Theme> = {
  mt: 2,
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

export const buttonGroupSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "center",
  gap: 2,
  pt: 1,
};

export const approveBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 140,
  height: 34,
  borderRadius: 2,
  backgroundColor: "success.main",
  color: "white",
  boxShadow: "0 2px 4px rgba(46, 125, 50, 0.15)",
  "&:hover": {
    backgroundColor: "success.dark",
    boxShadow: "0 4px 12px rgba(46, 125, 50, 0.25)",
  },
};

export const rejectBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 120,
  height: 34,
  borderRadius: 2,
  border: "1.5px solid",
  borderColor: "error.main",
  color: "error.main",
  backgroundColor: "white",
  "&:hover": {
    borderColor: "error.dark",
    backgroundColor: "rgba(211, 47, 47, 0.04)",
    boxShadow: "0 4px 12px rgba(211, 47, 47, 0.1)",
  },
};

export const previewBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 120,
  height: 34,
  borderRadius: 2,
  "&:hover": {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
};

export const resendBtnSx: SxProps<Theme> = {
  textTransform: "none",
  fontWeight: 700,
  minWidth: 140,
  height: 34,
  borderRadius: 2,
  "&:hover": {
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
  },
};

// ─── PreviewLoader Styles ───────────────────────────────────────────────────

export const previewLoadingSx: SxProps<Theme> = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const previewErrorSx: SxProps<Theme> = {
  p: 2,
};

export const previewIframeContainerSx: SxProps<Theme> = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

export const previewIframeHeaderSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 1,
  mb: 1,
};

export const previewIframeStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
  flex: 1,
};

// ─── MouList Dialog Styles ───────────────────────────────────────────────────

export const dialgonContentSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

export const previewContainerSx: SxProps<Theme> = {
  width: "100%",
  height: "70vh",
};

export const noteTextSx: SxProps<Theme> = {
  color: "text.secondary",
  mr: "auto",
  pl: 1,
};

export const fullPreviewContentSx: SxProps<Theme> = {
  height: "80vh",
};
