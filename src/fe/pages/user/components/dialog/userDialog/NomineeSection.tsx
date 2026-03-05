import React from "react";
import { TextField } from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import { inputSx } from "./styles";


const NomineeSection: React.FC = () => {
  const { setFieldTouched } = useFormikContext();

  return (
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
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
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
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
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
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                const v = (e.target as HTMLInputElement).value.replace(/\D/g, "");
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({ target: { name: field.name, value: v } });
                }
              }}
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
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
            />
          )}
        </Field>
      </div>
    </>
  );
};

export default NomineeSection;
