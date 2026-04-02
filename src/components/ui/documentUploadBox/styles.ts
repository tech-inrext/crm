import { SxProps, Theme } from "@mui/material";

export const documentUploadStyles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 0.75,
  } as SxProps<Theme>,

  label: {
    fontSize: "0.875rem",
    fontWeight: 500,
    color: "text.primary",
  } as SxProps<Theme>,

  uploadBox: (hasError: boolean, hasPreview: boolean): SxProps<Theme> => ({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 100,
    padding: 1,
    border: "2px dashed",
    borderColor: hasError ? "#ef5350" : "#bdbdbd",
    borderRadius: 1.5,
    backgroundColor: hasPreview ? "#fafafa" : "#ffffff",
    cursor: "pointer",
    transition: "all 0.2s ease",
    "&:hover": {
      borderColor: "#9e9e9e",
      backgroundColor: "#f5f5f5",
    },
  }),

  previewContainer: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  } as SxProps<Theme>,

  previewImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,

  previewBox: {
    textAlign: "center",
  } as SxProps<Theme>,

  previewIcon: {
    fontSize: 24,
    color: "#1976d2",
    mb: 0.25,
  } as SxProps<Theme>,

  previewCaption: {
    color: "text.secondary",
    fontSize: "0.65rem",
  } as SxProps<Theme>,

  fileNameBox: {
    textAlign: "center",
  } as SxProps<Theme>,

  fileNameCaption: {
    color: "text.secondary",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "100%",
    fontSize: "0.65rem",
    display: "block",
  } as SxProps<Theme>,

  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
    "&:hover": { backgroundColor: "#ffebee" },
  } as SxProps<Theme>,

  emptyStateBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    gap: 0.5,
  } as SxProps<Theme>,

  emptyStateIcon: {
    fontSize: 24,
    color: "#bdbdbd",
  } as SxProps<Theme>,

  emptyStateText: {
    color: "#757575",
    fontWeight: 600,
    fontSize: "0.75rem",
    lineHeight: 1.3,
    maxWidth: "80%",
    textAlign: "center",
  } as SxProps<Theme>,

  errorMessage: {
    mt: 0.5,
  } as SxProps<Theme>,

  imgStyle: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as React.CSSProperties,
};
