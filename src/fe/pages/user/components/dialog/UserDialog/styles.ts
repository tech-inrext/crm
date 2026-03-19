import { width } from "@mui/system";
import { SxProps, Theme } from "@mui/material";

/** Shared MUI TextField sx prop used across all user-dialog sub-components */
export const inputSx = {
  bgcolor: "#fff",
  borderRadius: 1,
  "& .MuiInputBase-root": { minHeight: 40 },
  "& .MuiInputBase-input": { py: 1 },
} as const;

/** Date input variant — extends inputSx with date-picker appearance resets */
export const dateInputSx = {
  ...inputSx,
  '& input[type="date"]': {
    height: "40px",
    fontSize: "14px",
    appearance: "none" as const,
    padding: "0 10px",
  },
} as const;

/** RequiredDocuments component styles */
export const requiredDocumentsStyles = {
  container: {
    mt: 3,
  } as SxProps<Theme>,

  title: {
    mb: 0.5,
    fontWeight: 600,
  } as SxProps<Theme>,

  subtitle: {
    mb: 2,
  } as SxProps<Theme>,

  grid: {
    display: "grid",
    gridTemplateColumns: {
      xs: "repeat(1, 1fr)",
      sm: "repeat(2, 1fr)",
      md: "repeat(4, 1fr)",
    },
    gap: 2,
  } as SxProps<Theme>,
};
