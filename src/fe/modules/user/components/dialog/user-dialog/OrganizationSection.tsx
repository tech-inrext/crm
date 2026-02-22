import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
} from "@/components/ui/Component";
import { Popper } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/modules/user/constants/users";

interface OrganizationSectionProps {
  managers: any[];
  departments: any[];
  roles: any[];
  setFieldValue: (field: string, value: any) => void;
  currentRoles?: any[];
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  managers,
  departments,
  roles,
  setFieldValue,
  currentRoles,
}) => {
  const AutocompletePopper = (props: any) => (
    <Popper {...props} placement="bottom-start" />
  );

  return (
    <>
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 600 }}>
        {FIELD_LABELS.ORGANIZATION_SECTION}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5,
        }}
      >
        <Field name="managerId">
          {({ field, form }: FieldProps) => {
            const selectedManager =
              managers.find((m: any) => (m._id || m.id) === field.value) ||
              null;
            return (
              <Autocomplete
                size="small"
                options={managers || []}
                getOptionLabel={(option: any) =>
                  option.email
                    ? `${option.name} (${option.email})`
                    : option.name || ""
                }
                isOptionEqualToValue={(option: any, value: any) =>
                  (option._id || option.id) === (value._id || value.id)
                }
                value={selectedManager}
                onChange={(_, newValue) => {
                  form.setFieldValue(
                    "managerId",
                    newValue ? newValue._id || newValue.id : "",
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={FIELD_LABELS.MANAGER}
                    error={
                      form.touched.managerId && Boolean(form.errors.managerId)
                    }
                    helperText={
                      form.touched.managerId &&
                      (form.errors.managerId as string)
                    }
                    sx={{
                      bgcolor: "#fff",
                      borderRadius: 1,
                      "& .MuiInputBase-root": { minHeight: 40 },
                      "& .MuiInputBase-input": { py: 1 },
                    }}
                  />
                )}
                PopperComponent={AutocompletePopper}
                disablePortal
                fullWidth
              />
            );
          }}
        </Field>

        <Field name="departmentId">
          {({ field }: FieldProps) => (
            <TextField
              select
              size="small"
              fullWidth
              label={FIELD_LABELS.DEPARTMENT}
              {...field}
              onChange={(e) => setFieldValue("departmentId", e.target.value)}
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
            >
              <MenuItem value="">None</MenuItem>
              {departments.map((d: any) => (
                <MenuItem key={d._id || d.id} value={d._id || d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>

        <Box sx={{ gridColumn: "1 / -1" }}>
          <Autocomplete
            multiple
            options={roles || []}
            getOptionLabel={(opt: any) => opt.name || opt.label || ""}
            value={(roles || []).filter((r: any) => {
              if (!currentRoles || currentRoles.length === 0) return false;
              const id = r._id || r.id;
              return currentRoles.some(
                (cr: any) =>
                  cr === id || cr === id?.toString() || (cr && cr._id === id),
              );
            })}
            onChange={(_, value) =>
              setFieldValue(
                "roles",
                value.map((v: any) => v._id || v.id || v),
              )
            }
            PopperComponent={AutocompletePopper}
            renderInput={(params) => (
              <TextField
                {...params}
                label={FIELD_LABELS.ROLES}
                size="small"
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 1,
                  "& .MuiInputBase-root": { minHeight: 40 },
                  "& .MuiInputBase-input": { py: 1 },
                }}
              />
            )}
            disablePortal
          />
        </Box>
      </Box>
    </>
  );
};

export default OrganizationSection;
