import React from "react";
import { TextField } from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import { FIELD_LABELS } from "@/fe/pages/vendor/constants/vendors";
import { inputSx } from "./styles";

const BasicInformation: React.FC = () => {
  const { setFieldTouched } = useFormikContext();

  return (
    <>
      <p className="text-base font-semibold text-slate-700 mt-1">
        {FIELD_LABELS.BASIC_INFO}
      </p>

      {/* Name */}
      <Field name="name">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.FULL_NAME}
            autoFocus
            fullWidth
            size="small"
            error={!!meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            sx={inputSx}
            onChange={(e) => {
              setFieldTouched(field.name, true, true);
              field.onChange(e);
            }}
          />
        )}
      </Field>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field name="email">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.EMAIL}
              fullWidth
              size="small"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              onChange={(e) => {
                setFieldTouched(field.name, true, true);
                field.onChange(e);
              }}
            />
          )}
        </Field>

        <Field name="phone">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.PHONE}
              fullWidth
              size="small"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              onChange={(e) => {
                setFieldTouched(field.name, true, true);
                const digits = (e.target as HTMLInputElement).value.replace(
                  /\D/g,
                  "",
                );
                field.onChange({ target: { name: field.name, value: digits } });
              }}
            />
          )}
        </Field>
      </div>

      <Field name="panNumber">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.PAN_NUMBER}
            fullWidth
            size="small"
            error={!!meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            sx={inputSx}
            onChange={(e) => {
              setFieldTouched(field.name, true, true);
              const val = (e.target as HTMLInputElement).value
                .toUpperCase()
                .trim();
              field.onChange({ target: { name: field.name, value: val } });
            }}
          />
        )}
      </Field>

      {/* Address */}
      <Field name="address">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.ADDRESS}
            fullWidth
            size="small"
            error={!!meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>
    </>
  );
};

export default BasicInformation;
