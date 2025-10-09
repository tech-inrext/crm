import React from "react";
import {
  TextField,
  Box,
  MenuItem,
  Typography,
  Autocomplete,
  Popper,
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
  // custom Popper to force placement below the input
  const AutocompletePopper = (props: any) => (
    <Popper {...props} placement="bottom-start" />
  );
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
          {({ field, form, meta }: FieldProps & { form?: any }) => {
            const selected =
              managers.find((m) => m._id === field.value) || null;

            return (
              <Autocomplete
                options={managers}
                getOptionLabel={(option: any) =>
                  option?.name || option?.email || ""
                }
                disablePortal
                PopperComponent={AutocompletePopper}
                filterOptions={(options, state) =>
                  options.filter((opt: any) =>
                    `${(opt.name || "").toLowerCase()} ${(
                      opt.email || ""
                    ).toLowerCase()}`.includes(
                      (state.inputValue || "").toLowerCase()
                    )
                  )
                }
                value={selected}
                onChange={(_, value) => {
                  // prefer form.setFieldValue when available, fallback to prop
                  if (form && typeof form.setFieldValue === "function") {
                    form.setFieldValue(field.name, value ? value._id : "");
                  } else {
                    setFieldValue(field.name, value ? value._id : "");
                  }
                }}
                isOptionEqualToValue={(option, value) =>
                  option._id === value?._id
                }
                renderOption={(props, option: any) => (
                  <li {...props} key={option._id}>
                    <Box>
                      <Typography component="div">{option.name}</Typography>
                      <Typography
                        component="div"
                        variant="body2"
                        color="text.secondary"
                      >
                        {option.email}
                      </Typography>
                    </Box>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    name={field.name}
                    label={FIELD_LABELS.MANAGER}
                    margin="normal"
                    fullWidth
                    error={!!meta.touched && !!meta.error}
                    helperText={
                      meta.touched && meta.error
                        ? meta.error
                        : "Notes : [Only for VP/Director, Select self as Manager]"
                    }
                    onBlur={field.onBlur}
                    sx={{ bgcolor: "#fff", borderRadius: 1, flex: 1 }}
                  />
                )}
                sx={{ flex: 1 }}
              />
            );
          }}
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
