import React from "react";
import { TextField, MenuItem } from "@/components/ui/Component";
import { Popper } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import type { RoleItem, ManagerItem, DepartmentItem } from "@/fe/pages/user/types";
import { inputSx } from "./styles";

interface OrganizationSectionProps {
  managers: ManagerItem[];
  departments: DepartmentItem[];
  roles: RoleItem[];
  setFieldValue: (field: string, value: any) => void;
  currentRoles?: string[];
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

  const selectedManager =
    managers.find((m) => (m._id) === currentManagerId) ?? null;

  return (
    <>
      <p className="text-base font-semibold text-slate-700 mt-2">{FIELD_LABELS.ORGANIZATION_SECTION}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Searchable Manager Autocomplete */}
        <Autocomplete
          options={managers}
          value={selectedManager}
          getOptionLabel={(opt) =>
            opt ? `${opt.name || ""}${opt.email ? ` (${opt.email})` : ""}` : ""
          }
          filterOptions={(options, { inputValue }) => {
            const q = inputValue.toLowerCase();
            return options.filter(
              (opt) =>
                (opt.name || "").toLowerCase().includes(q) ||
                (opt.email || "").toLowerCase().includes(q),
            );
          }}
          onChange={(_, value) =>
            setFieldValue("managerId", value ? value._id : "")
          }
          PopperComponent={AutocompletePopper}
          disablePortal
          renderOption={(props, opt) => (
            <li {...props} key={opt._id}>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{opt.name}</span>
                {opt.email && <span className="text-xs text-slate-400">{opt.email}</span>}
              </div>
            </li>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label={FIELD_LABELS.MANAGER}
              size="small"
              placeholder="Search by name or email"
              sx={inputSx}
            />
          )}
        />

        {/* Department */}
        <Field name="departmentId">
          {({ field }: FieldProps) => (
            <TextField
              select
              size="small"
              fullWidth
              label={FIELD_LABELS.DEPARTMENT}
              {...field}
              onChange={(e) => setFieldValue("departmentId", e.target.value)}
              sx={inputSx}
              SelectProps={{ MenuProps: { disablePortal: true } }}
            >
              <MenuItem value="">None</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
              ))}
            </TextField>
          )}
        </Field>

        {/* Roles multi-select (full width) */}
        <div className="sm:col-span-2">
          <Autocomplete
            multiple
            options={roles || []}
            getOptionLabel={(opt) => opt.name || ""}
            value={(roles || []).filter((r) => {
              if (!currentRoles || currentRoles.length === 0) return false;
              return currentRoles.some(
                (cr: any) => cr === r._id || cr === r._id?.toString() || (cr && cr._id === r._id),
              );
            })}
            onChange={(_, value) =>
              setFieldValue("roles", value.map((v) => v._id || v))
            }
            PopperComponent={AutocompletePopper}
            disablePortal
            renderInput={(params) => (
              <TextField {...params} label={FIELD_LABELS.ROLES} size="small" sx={inputSx} />
            )}
          />
        </div>
      </div>
    </>
  );
};

export default OrganizationSection;
