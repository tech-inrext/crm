import React from "react";
import { Box, TextField, Typography } from "@/components/ui/Component";
import { Field, FieldProps, useFormikContext } from "formik";
import { useAuth } from "@/contexts/AuthContext";

interface BasicInformationProps {
  values: any;
  setFieldValue: (field: string, value: any) => void;
  editId: string | null;
}

const BasicInformation: React.FC<BasicInformationProps> = ({
  values,
  setFieldValue,
  editId,
}) => {
  const { setFieldTouched, initialValues } = useFormikContext<any>();
  const { user, isSystemAdmin } = useAuth();

  // 🛡️ Logic to show email in Edit mode:
  // Use 'initialValues' instead of 'values' to prevent the field from
  // appearing dynamically when the user selects themselves as the assignee.
  const canSeeEmail =
    !editId ||
    isSystemAdmin ||
    String(initialValues.assignedTo || "") === String(user?._id || "") ||
    String(initialValues.uploadedBy || "") === String(user?._id || "");

  return (
    <>
      <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 600 }}>
        Basic Information
      </Typography>

      <Field name="fullName">
        {({ field, meta }: FieldProps) => (
          <TextField
            {...field}
            label="Full Name"
            size="small"
            required
            value={values.fullName}
            onChange={(e) => {
              setFieldValue("fullName", e.target.value);
              setFieldTouched("fullName", true, false);
            }}
            autoFocus
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
            inputProps={{ "aria-label": "Lead full name" }}
            sx={{
              bgcolor: "#fff",
              borderRadius: 1,
              "& .MuiInputBase-root": { minHeight: 40 },
              "& .MuiInputBase-input": { py: 1 },
            }}
          />
        )}
      </Field>

      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {canSeeEmail && (
          <Field name="email">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                label="Email"
                type="email"
                size="small"
                value={values.email}
                onChange={(e) => {
                  setFieldValue("email", e.target.value);
                  setFieldTouched("email", true, false);
                }}
                error={meta.touched && !!meta.error}
                helperText={meta.touched && meta.error}
                inputProps={{ "aria-label": "Lead email" }}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1,
                  flex: 1,
                  "& .MuiInputBase-root": { minHeight: 40 },
                  "& .MuiInputBase-input": { py: 1 },
                }}
              />
            )}
          </Field>
        )}

        {!editId && (
          <Field name="phone">
            {({ field, meta }: FieldProps) => (
              <TextField
                {...field}
                label="Phone"
                size="small"
                value={values.phone}
                onChange={(e) => {
                  const cleanPhone =
                    e.target.value.replace(/\D/g, "").slice(0, 10);
                  setFieldValue("phone", cleanPhone);
                  setFieldTouched("phone", true, false);
                }}
                required
                error={meta.touched && !!meta.error}
                helperText={meta.touched && meta.error ? meta.error : ""}
                placeholder="1234567890"
                inputProps={{
                  "aria-label": "Lead phone",
                  pattern: "[0-9]*",
                  inputMode: "numeric",
                }}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1,
                  flex: 1,
                  "& .MuiInputBase-root": { minHeight: 40 },
                  "& .MuiInputBase-input": { py: 1 },
                }}
              />
            )}
          </Field>
        )}
      </Box>
    </>
  );
};

export default BasicInformation;
