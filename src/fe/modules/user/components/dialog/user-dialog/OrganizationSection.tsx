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
  currentManagerId?: string;
}

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  managers,
  departments,
  roles,
  setFieldValue,
  currentRoles,
  currentManagerId,
}) => {
  const AutocompletePopper = (props: any) => (
    <Popper {...props} placement="bottom-start" />
  );

  // Find the currently selected manager object from the managers list
  const selectedManager =
    managers.find(
      (m: any) =>
        (m._id || m.id) === currentManagerId,
    ) ?? null;

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
        {/* Searchable Manager Autocomplete */}
        <Autocomplete
          options={managers}
          value={selectedManager}
          getOptionLabel={(opt: any) =>
            opt ? `${opt.name || ""}${opt.email ? ` (${opt.email})` : ""}` : ""
          }
          filterOptions={(options, { inputValue }) => {
            const query = inputValue.toLowerCase();
            return options.filter(
              (opt: any) =>
                (opt.name || "").toLowerCase().includes(query) ||
                (opt.email || "").toLowerCase().includes(query),
            );
          }}
          onChange={(_, value) => {
            setFieldValue("managerId", value ? (value._id || value.id) : "");
          }}
          PopperComponent={AutocompletePopper}
          disablePortal
          renderOption={(props, opt: any) => (
            <li {...props} key={opt._id || opt.id}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {opt.name}
                </Typography>
                {opt.email && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {opt.email}
                  </Typography>
                )}
              </Box>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={FIELD_LABELS.MANAGER}
              size="small"
              placeholder="Search by name or email"
              sx={{
                bgcolor: "#fff",
                borderRadius: 1,
                "& .MuiInputBase-root": { minHeight: 40 },
                "& .MuiInputBase-input": { py: 1 },
              }}
            />
          )}
        />

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
