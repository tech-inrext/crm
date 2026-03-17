import React, { useRef, useState } from "react";
import { TextField, MenuItem } from "@/components/ui/Component";
import { Typography } from "@mui/material";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import {
  BRANCH_LABELS,
  SLAB_OPTIONS,
} from "@/fe/pages/user/constants/forFreelancer";
import { getSlabLabel } from "@/fe/pages/user/utils";
import { inputSx } from "./styles";

const menuProps = {
  MenuProps: { disablePortal: true, PaperProps: { style: { maxHeight: 240 } } },
};

const ForFreelancer: React.FC = () => {
  const branchRef = useRef<HTMLDivElement>(null);
  const [branchPaperWidth, setBranchPaperWidth] = useState<
    number | undefined
  >();

  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
        {FIELD_LABELS.FOR_FREELANCER}
      </Typography>

      <div className="flex flex-col sm:flex-row gap-3 mt-1">
        <Field name="slabPercentage">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.SLAB_PERCENTAGE}
              select
              SelectProps={menuProps}
              size="small"
              fullWidth
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              sx={inputSx}
            >
              {SLAB_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {getSlabLabel(opt)}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>

        <Field name="branch">
          {({ field, meta }: FieldProps) => (
            <TextField
              ref={branchRef}
              {...field}
              label={FIELD_LABELS.BRANCH}
              select
              SelectProps={{
                onOpen: () =>
                  setBranchPaperWidth(branchRef.current?.offsetWidth),
                MenuProps: {
                  disablePortal: true,
                  anchorOrigin: { vertical: "bottom", horizontal: "left" },
                  transformOrigin: { vertical: "top", horizontal: "left" },
                  PaperProps: {
                    style: {
                      maxHeight: 240,
                      ...(branchPaperWidth != null && {
                        width: branchPaperWidth,
                      }),
                    },
                  },
                },
                renderValue: (v) =>
                  BRANCH_LABELS[v as keyof typeof BRANCH_LABELS] ?? String(v),
              }}
              size="small"
              fullWidth
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              sx={inputSx}
            >
              {Object.entries(BRANCH_LABELS).map(([key, label]) => (
                <MenuItem key={key} value={key} sx={{ whiteSpace: "normal" }}>
                  {label}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>
      </div>
    </>
  );
};

export default ForFreelancer;
