import React, { useRef, useCallback } from "react";
import { TextField, MenuItem } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import {
  BRANCH_LABELS,
  SLAB_OPTIONS,
  type BranchKey,
} from "@/fe/pages/user/constants/forFreelancer";
import { getSlabLabel, formatBranchForMenu } from "@/fe/pages/user/utils";
import { useElementWidth } from "@/fe/pages/user/hooks/useElementWidth";
import { inputSx } from "./styles";

const ForFreelancer: React.FC = () => {
  const slabRef = useRef<HTMLDivElement | null>(null);
  const branchRef = useRef<HTMLDivElement | null>(null);

  const slabWidth = useElementWidth(slabRef);
  const branchWidth = useElementWidth(branchRef);

  const renderBranchValue = useCallback((selected: string) => {
    const text = (BRANCH_LABELS as Record<string, string>)[selected] || selected || "";
    return (
      <span
        title={text}
        style={{ display: "block", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
      >
        {text}
      </span>
    );
  }, []);

  return (
    <>
      <p className="text-base font-semibold text-slate-700 mt-2">{FIELD_LABELS.FOR_FREELANCER}</p>

      <div className="flex flex-col sm:flex-row gap-3 mt-1">
        <Field name="slabPercentage">
          {({ field, meta }: FieldProps) => (
            <div ref={slabRef} className="flex-1 min-w-0">
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
                helperText={meta.touched && meta.error ? String(meta.error) : undefined}
                sx={inputSx}
              >
                {SLAB_OPTIONS.map((opt) => (
                  <MenuItem key={opt} value={opt}>{getSlabLabel(opt)}</MenuItem>
                ))}
              </TextField>
            </div>
          )}
        </Field>

        <Field name="branch">
          {({ field, meta }: FieldProps) => (
            <div ref={branchRef} className="flex-1 min-w-0 overflow-hidden">
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
                helperText={meta.touched && meta.error ? String(meta.error) : undefined}
                sx={inputSx}
              >
                {Object.entries(BRANCH_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    <span style={{ whiteSpace: "pre-line" }}>{label}</span>
                  </MenuItem>
                ))}
              </TextField>
            </div>
          )}
        </Field>
      </div>
    </>
  );
};

export default ForFreelancer;
