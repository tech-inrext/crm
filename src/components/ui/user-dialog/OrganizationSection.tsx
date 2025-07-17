import React from "react";
import {
  TextField,
  Box,
  MenuItem,
  Typography,
  Autocomplete,
} from "@mui/material";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/constants/users";

interface OrganizationSectionProps {
  managers: any[];
  departments: any[];
  roles: any[];
  setFieldValue: (field: string, value: any) => void;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  managers,
  departments,
  roles,
  setFieldValue,
}) => {
  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
        {FIELD_LABELS.ORGANIZATION}
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Field name="managerId">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.MANAGER}
              select
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            >
              {managers.map((mgr) => (
                <MenuItem key={mgr._id} value={mgr._id}>
                  {mgr.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>
        <Field name="departmentId">
          {({ field, meta }: FieldProps) => (
            <TextField
              {...field}
              label={FIELD_LABELS.DEPARTMENT}
              select
              fullWidth
              margin="normal"
              error={!!meta.touched && !!meta.error}
              helperText={meta.touched && meta.error}
              sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept.departmentId} value={dept.departmentId}>
                  {dept.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>
      </Box>

      <Field name="roles">
        {({ field, meta }: FieldProps) => (
          <Autocomplete
            multiple
            options={roles}
            getOptionLabel={(option) => option.name || ""}
            value={roles.filter((r) => (field.value ?? []).includes(r._id))}
            onChange={(_, value) =>
              setFieldValue(
                "roles",
                value.map((v) => v._id)
              )
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={FIELD_LABELS.ROLES}
                margin="normal"
                error={!!meta.touched && !!meta.error}
                helperText={meta.touched && meta.error}
                sx={{ bgcolor: "#fff", borderRadius: 1 }}
              />
            )}
            sx={{ mt: 2 }}
          />
        )}
      </Field>
    </>
  );
};

export default OrganizationSection;
