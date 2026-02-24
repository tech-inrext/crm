import React from "react";
import { TextField, MenuItem } from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import { GENDER_OPTIONS, FIELD_LABELS } from "@/fe/pages/user/constants/users";
import NomineeSection from "./NomineeSection";
import RequiredDocuments from "./RequiredDocuments";
import PhotoUpload from "./PhotoUpload";
import { toDateInputString } from "@/fe/pages/user/utils";
import { inputSx, dateInputSx } from "./styles";

const genderOptions = GENDER_OPTIONS.map((gender) => ({ value: gender, label: gender }));

interface BasicInformationProps {
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({ editId }) => {
  const { setFieldTouched } = useFormikContext();

  return (
    <>

      {/* Photo upload centred */}
      <div className="flex justify-center my-2">
        <div className="w-36">
          <PhotoUpload />
        </div>
      </div>
      <p className="text-base font-semibold text-slate-700 mt-1">{FIELD_LABELS.BASIC_INFO}</p>

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field name="name">
          {({ field, meta, form }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.FULL_NAME}
              autoFocus
              fullWidth
              size="small"
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              onChange={(e) => {
                form.setFieldTouched(field.name, true, true);
                form.setFieldValue(field.name, e.target.value);
              }}
            />
          )}
        </Field>

        <Field name="email">
          {({ field, meta, form }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.EMAIL}
              fullWidth
              size="small"
              error={meta.touched && Boolean(meta.error)}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              onChange={(e) => {
                form.setFieldTouched(field.name, true, true);
                form.setFieldValue(field.name, e.target.value);
              }}
            />
          )}
        </Field>
      </div>

      {/* Phone + Alt Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                if (field.name) setFieldTouched(field.name, true, true);
                const v = (e.target as HTMLInputElement).value.replace(/\D/g, "");
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({ target: { name: field.name, value: v } });
                }
              }}
            />
          )}
        </Field>

        <Field name="altPhone">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label={FIELD_LABELS.ALT_PHONE}
              fullWidth
              size="small"
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
      </div>

      {/* Father Name + PAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field name="fatherName">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.FATHER_NAME}
              fullWidth
              size="small"
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

        <Field name="panNumber">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.PAN_NUMBER}
              fullWidth
              size="small"
              error={!!meta.touched && !!meta.error}
              helperText={(meta.touched && meta.error) || "Format: ABCDE1234F"}
              sx={inputSx}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                const value = e.target.value.toUpperCase().trim();
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({ target: { name: field.name, value } });
                }
              }}
              inputProps={{ maxLength: 10, style: { textTransform: "uppercase" } }}
            />
          )}
        </Field>
      </div>

      {/* Address (full width) */}
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
            onChange={(e) => {
              if (field.name) setFieldTouched(field.name, true, true);
              if ((field as any).onChange) (field as any).onChange(e);
            }}
          />
        )}
      </Field>

      {/* Gender + DOB */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field name="gender">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.GENDER}
              select
              fullWidth
              size="small"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={inputSx}
              SelectProps={{ MenuProps: { disablePortal: true } }}
              onChange={(e) => {
                if (field.name) setFieldTouched(field.name, true, true);
                if ((field as any).onChange) (field as any).onChange(e);
              }}
            >
              {genderOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          )}
        </Field>

        <Field name="dateOfBirth">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={toDateInputString(field.value)}
              label={FIELD_LABELS.DATE_OF_BIRTH}
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={dateInputSx}
              onChange={(e) => {
                const v = e.target.value || "";
                if (field.name) setFieldTouched(field.name, true, true);
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({ target: { name: field.name, value: v } });
                }
              }}
            />
          )}
        </Field>
      </div>

      {/* Joining Date + Designation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field name="joiningDate">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              value={toDateInputString(field.value)}
              label={FIELD_LABELS.JOINING_DATE}
              type="date"
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={dateInputSx}
              onChange={(e) => {
                const v = e.target.value || "";
                if (field.name) setFieldTouched(field.name, true, true);
                if (field.name && (field as any).onChange) {
                  (field as any).onChange({ target: { name: field.name, value: v } });
                }
              }}
            />
          )}
        </Field>

        <Field name="designation">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.DESIGNATION}
              fullWidth
              size="small"
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

      <RequiredDocuments />
      <NomineeSection />
    </>
  );
};

export default BasicInformation;
