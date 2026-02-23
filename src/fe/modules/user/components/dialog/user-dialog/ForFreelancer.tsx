import React, { useRef, useCallback } from "react";
import {
  Box,
  MenuItem,
  TextField,
  Typography,
} from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/modules/user/constants/users";
import {
  BRANCH_LABELS,
  SLAB_OPTIONS,
  type BranchKey,
} from "@/fe/modules/user/constants/forFreelancer";
import { getSlabLabel, formatBranchForMenu } from "@/fe/modules/user/helpers";
import { useElementWidth } from "@/fe/modules/user/hooks/useElementWidth";

const ForFreelancer: React.FC = () => {
  const slabRef = useRef<HTMLDivElement | null>(null);
  const branchRef = useRef<HTMLDivElement | null>(null);

  const slabWidth = useElementWidth(slabRef);
  const branchWidth = useElementWidth(branchRef);

  const renderBranchValue = useCallback((selected: string) => {
    const text =
      (BRANCH_LABELS as Record<string, string>)[selected] || selected || "";
    return (
      <span
        title={text}
        style={{
          display: "block",
          fontSize: 13,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {text}
      </span>
    );
  }, []);

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
        {FIELD_LABELS.FOR_FREELANCER}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 1,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="slabPercentage">
          {({ field, meta }: FieldProps) => (
            <Box ref={slabRef} sx={{ flex: 1 }}>
              <TextField
                {...field}
                label={FIELD_LABELS.SLAB_PERCENTAGE}
                select
                SelectProps={{
                  MenuProps: {
                    disablePortal: true,
                    PaperProps: {
                      style: {
                        maxHeight: 240,
                        width: slabWidth ? slabWidth + 8 : undefined,
                        whiteSpace: "normal",
                        boxSizing: "border-box",
                      },
                    },
                  },
                }}
                size="small"
                fullWidth
                error={Boolean(meta.touched && meta.error)}
                helperText={
                  meta.touched && meta.error ? String(meta.error) : undefined
                }
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1,
                  "& .MuiInputBase-root": { minHeight: 40 },
                  "& .MuiInputBase-input": { py: 1 },
                }}
              >
                {SLAB_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {getSlabLabel(opt)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </Field>

        <Field name="branch">
          {({ field, meta }: FieldProps) => (
            <Box ref={branchRef} sx={{ flex: 1 }}>
              <TextField
                {...field}
                label={FIELD_LABELS.BRANCH}
                select
                SelectProps={{
                  MenuProps: {
                    disablePortal: true,
                    PaperProps: {
                      style: {
                        maxHeight: 240,
                        width: branchWidth ? branchWidth + 8 : undefined,
                        boxSizing: "border-box",
                      },
                    },
                  },
                  renderValue: renderBranchValue,
                }}
                size="small"
                fullWidth
                error={Boolean(meta.touched && meta.error)}
                helperText={
                  meta.touched && meta.error ? String(meta.error) : undefined
                }
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1,
                  "& .MuiInputBase-root": { minHeight: 40 },
                  "& .MuiInputBase-input": { py: 1 },
                }}
              >
                {Object.entries(BRANCH_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    <Box sx={{ whiteSpace: "pre-line" }}>{label}</Box>
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          )}
        </Field>
      </Box>
    </>
  );
};

export default ForFreelancer;
