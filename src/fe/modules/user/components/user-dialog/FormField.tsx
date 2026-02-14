import React from "react";
import { TextField, MenuItem } from "@/components/ui/Component";
import { Field, FieldProps } from "formik";

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  select?: boolean;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  helperText?: string;
  fullWidth?: boolean;
  inputProps?: any;
  InputLabelProps?: any;
  sx?: any;
}

const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  type = "text",
  select = false,
  options = [],
  required = false,
  helperText,
  fullWidth = true,
  inputProps = {},
  InputLabelProps = {},
  sx = {},
}) => {
  return (
    <Field name={name}>
      {({ field, meta }: FieldProps) => (
        <TextField
          {...field}
          label={label}
          type={type}
          select={select}
          required={required}
          fullWidth={fullWidth}
          margin="normal"
          error={Boolean(meta.touched && meta.error)}
          helperText={(meta.touched && meta.error) || helperText}
          inputProps={inputProps}
          InputLabelProps={InputLabelProps}
          sx={{ bgcolor: "#fff", borderRadius: 1, ...sx }}
        >
          {select &&
            options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
        </TextField>
      )}
    </Field>
  );
};

export default FormField;
