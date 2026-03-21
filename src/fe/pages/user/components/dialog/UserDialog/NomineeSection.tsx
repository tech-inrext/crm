import React from "react";
import { TextField } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import { inputSx } from "./styles";

const NomineeSection: React.FC = () => (
  <>
    <p className="text-base font-semibold text-slate-700 mt-2">{FIELD_LABELS.NOMINEE_DETAILS}</p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field name="nominee.name">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={FIELD_LABELS.NOMINEE_FULL_NAME}
            size="small"
            fullWidth
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>

      <Field name="nominee.relation">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={FIELD_LABELS.NOMINEE_RELATION}
            size="small"
            fullWidth
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>

      <Field name="nominee.phone">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={FIELD_LABELS.NOMINEE_PHONE}
            size="small"
            fullWidth
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          />
        )}
      </Field>

      <Field name="nominee.occupation">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={FIELD_LABELS.NOMINEE_OCCUPATION}
            size="small"
            fullWidth
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>
    </div>
  </>
);

export default NomineeSection;
