// src/fe/pages/roles/components/dialog/styles.ts
import type { CSSProperties } from "react";

export const dialogPaperSx = {
  m: 2,
  height: { xs: "80vh", sm: "auto" },
  maxHeight: { xs: "60vh", sm: "90vh" },
  display: "flex",
  flexDirection: "column",
  borderRadius: 2,
};

export const dialogTitleSx = {
  fontSize: { xs: "1.1rem", sm: "1.25rem" },
  p: { xs: 1.5, sm: 2 },
};

export const dialogContentSx = {
  p: { xs: 2.5, sm: 2 },
  overflowY: "auto",
  flex: 1,
};

export const readonlyTextFieldSx = {
  mb: 2,
  fontSize: { xs: "0.95rem", sm: "1rem" },
  "& .MuiInputBase-root": {
    bgcolor: "#f5f5f5",
    cursor: "not-allowed",
  },
};

export const readonlyInputStyle: CSSProperties = {
  fontSize: "1rem",
  cursor: "not-allowed",
};

export const textFieldSx = {
  mb: 2,
  fontSize: { xs: "0.95rem", sm: "1rem" },
};

export const inputStyle: CSSProperties = {
  fontSize: "1rem",
};

export const modulePermsSectionSx = { mt: 1 };

export const sectionTitleSx = {
  fontWeight: 600,
  mb: 1,
  color: "#1a237e",
  fontSize: { xs: "1rem", sm: "1.1rem" },
};

export const permissionsContainerSx = {
  display: "flex",
  flexDirection: "column",
  gap: 1,
  bgcolor: "#f5f7fa",
  borderRadius: 2,
  p: { xs: 1, sm: 2 },
  boxShadow: 1,
  width: "100%",
  overflowX: "auto",
};

export const headerRowSx = (gridTemplateColumns: string) => ({
  display: "grid",
  gridTemplateColumns,
  alignItems: "center",
  gap: 1,
  mb: 1,
});

export const headerModuleLabelSx = {
  fontWeight: 700,
  color: "#1976d2",
  fontSize: { xs: 13, sm: 15 },
};

export const headerPermLabelSx = {
  textAlign: "center",
  fontWeight: 700,
  color: "#1976d2",
  fontSize: { xs: 13, sm: 15 },
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const moduleRowSx = (gridTemplateColumns: string) => ({
  display: "grid",
  gridTemplateColumns,
  alignItems: "center",
  gap: 1,
  mb: 0.5,
});

export const moduleNameSx = {
  fontWeight: 600,
  color: "#333",
  fontSize: { xs: 14, sm: 15 },
};

export const checkboxCellSx = {
  textAlign: "center",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

export const checkboxSx = {
  color: "#1976d2",
  "&.Mui-checked": { color: "#1976d2" },
  p: 0.5,
};

export const specialAccessSectionSx = { mt: 2 };

export const specialAccessTitleSx = {
  fontWeight: 600,
  mb: 1,
  color: "#1a237e",
};

export const specialAccessRowSx = {
  display: "flex",
  alignItems: "flex-start",
  gap: 0.5,
  mt: 1,
};

export const specialAccessCheckboxSx = {
  color: "#1976d2",
  "&.Mui-checked": { color: "#1976d2" },
  flexShrink: 0,
  pt: "2px",
};

export const dialogActionsSx = {
  p: { xs: 1, sm: 2 },
  borderTop: "1px solid #e0e0e0",
  justifyContent: "flex-end",
};
