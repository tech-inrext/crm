import React from "react";
import { TextField, MenuItem } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { GENDER_OPTIONS, FIELD_LABELS } from "@/fe/pages/user/constants/users";
import { toDateInputString } from "@/fe/pages/user/utils";
import { inputSx, dateInputSx } from "./styles";
import type { BasicInformationProps } from "./types";

const BasicInformation: React.FC<BasicInformationProps> = ({
  editId: _editId,
}) => (
  <>
    <p className="text-base font-semibold text-slate-700 mt-1">
      {FIELD_LABELS.BASIC_INFO}
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field name="name">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.FULL_NAME}
            autoFocus
            fullWidth
            size="small"
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>

      <Field name="email">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.EMAIL}
            fullWidth
            size="small"
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field name="phone">
        {({ field, form, meta }: FieldProps) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={FIELD_LABELS.PHONE}
            fullWidth
            size="small"
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={(e) =>
              form.setFieldValue(field.name, e.target.value.replace(/\D/g, ""))
            }
          />
        )}
      </Field>

      <Field name="whatsapp">
        {({ field, form, meta }: FieldProps) => (
          <TextField
            {...field}
            value={field.value ?? ""}
            label={FIELD_LABELS.ALT_PHONE}
            fullWidth
            size="small"
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={(e) =>
              form.setFieldValue(field.name, e.target.value.replace(/\D/g, ""))
            }
          />
        )}
      </Field>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field name="fatherName">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.FATHER_NAME}
            fullWidth
            size="small"
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>

      <Field name="panNumber">
        {({ field, form, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.PAN_NUMBER}
            fullWidth
            size="small"
            error={meta.touched && Boolean(meta.error)}
            helperText={(meta.touched && meta.error) || "Format: ABCDE1234F"}
            sx={inputSx}
            inputProps={{
              maxLength: 10,
              style: { textTransform: "uppercase" },
            }}
            onChange={(e) =>
              form.setFieldValue(
                field.name,
                e.target.value.toUpperCase().trim(),
              )
            }
          />
        )}
      </Field>
    </div>

    <Field name="address">
      {({ field, meta }: FieldProps) => (
        <TextField
          {...field}
          label={FIELD_LABELS.ADDRESS}
          fullWidth
          size="small"
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
          sx={inputSx}
        />
      )}
    </Field>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field name="gender">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label={FIELD_LABELS.GENDER}
            select
            fullWidth
            size="small"
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
            SelectProps={{ MenuProps: { disablePortal: true } }}
          >
            {GENDER_OPTIONS.map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Field>

      <Field name="dateOfBirth">
        {({ field, form, meta }: FieldProps) => (
          <TextField
            {...field}
            value={toDateInputString(field.value)}
            label={FIELD_LABELS.DATE_OF_BIRTH}
            type="date"
            required
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={dateInputSx}
            onChange={(e) =>
              form.setFieldValue(field.name, e.target.value || "")
            }
          />
        )}
      </Field>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field name="joiningDate">
        {({ field, form, meta }: FieldProps) => (
          <TextField
            {...field}
            value={toDateInputString(field.value)}
            label={FIELD_LABELS.JOINING_DATE}
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={dateInputSx}
            onChange={(e) =>
              form.setFieldValue(field.name, e.target.value || "")
            }
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
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
            sx={inputSx}
          />
        )}
      </Field>
    </div>
  </>
);

export default BasicInformation;
