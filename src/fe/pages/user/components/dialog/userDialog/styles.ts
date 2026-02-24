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
