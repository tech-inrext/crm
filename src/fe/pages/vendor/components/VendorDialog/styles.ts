/** Shared MUI TextField sx prop used across all vendor-dialog sub-components */
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

export const backdropSx = {
  backgroundColor: "rgba(15, 23, 42, 0.4)",
} as const;

export const dialogPanelSx = {
  maxHeight: "90vh",
} as const;

export const closeIconButtonSx = {
  color: "slate.400",
  "&:hover": {
    color: "slate.600",
    bgcolor: "slate.100",
  },
} as const;

export const submitButtonSx = {
  fontWeight: 600,
  bgcolor: "#1976d2",
  color: "#fff",
} as const;
