import React from "react";
import {
  TextField,
  MenuItem,
  Autocomplete,
  Popper,
} from "@/components/ui/Component";
import { Field, FieldProps } from "formik";
import { FIELD_LABELS } from "@/fe/pages/user/constants/users";
import type {
  RoleItem,
  ManagerItem,
  DepartmentItem,
} from "@/fe/pages/user/types";
import { inputSx } from "./styles";

interface OrganizationSectionProps {
  managers: ManagerItem[];
  departments: DepartmentItem[];
  roles: RoleItem[];
  setFieldValue: (field: string, value: any) => void;
  currentRoles?: string[];
  currentManagerId?: string;
}

const BottomStartPopper = (props: React.ComponentProps<typeof Popper>) => (
  <Popper {...props} placement="bottom-start" />
);

const OrganizationSection: React.FC<OrganizationSectionProps> = ({
  managers,
  departments,
  roles,
  setFieldValue,
  currentRoles,
  currentManagerId,
}) => {
  const selectedManager =
    managers.find((m) => m._id === currentManagerId) ?? null;

  return (
    <>
      <p className="text-base font-semibold text-slate-700 mt-2">
        {FIELD_LABELS.ORGANIZATION}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          PopperComponent={BottomStartPopper}
          disablePortal
          renderOption={(props, opt) => (
            <li {...props} key={opt._id}>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{opt.name}</span>
                {opt.email && (
                  <span className="text-xs text-slate-400">{opt.email}</span>
                )}
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

        <Field name="departmentId">
          {({ field }: FieldProps) => (
            <TextField
              {...field}
              select
              size="small"
              fullWidth
              label={FIELD_LABELS.DEPARTMENT}
              onChange={(e) => setFieldValue("departmentId", e.target.value)}
              sx={inputSx}
              SelectProps={{ MenuProps: { disablePortal: true } }}
            >
              <MenuItem value="">None</MenuItem>
              {departments.map((department) => (
                <MenuItem key={department._id} value={department._id}>
                  {department.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Field>

        <div className="sm:col-span-2">
          <Autocomplete
            multiple
            options={roles}
            getOptionLabel={(opt) =>
              opt.rank ? `${opt.name} (Rank: ${opt.rank})` : opt.name || ""
            }
            value={roles.filter((r) =>
              currentRoles?.some(
                (cr: any) => cr === r._id || cr?._id === r._id,
              ),
            )}
            onChange={(_, value) =>
              setFieldValue(
                "roles",
                value.map((v) => v._id || v),
              )
            }
            PopperComponent={BottomStartPopper}
            disablePortal
            renderOption={(props, opt) => (
              <li {...props} key={opt._id}>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{opt.name}</span>
                  <span className="text-xs text-slate-400">
                    Rank: {opt.rank || 0}
                  </span>
                </div>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={FIELD_LABELS.ROLES}
                size="small"
                sx={inputSx}
              />
            )}
          />
        </div>
      </div>
    </>
  );
};

export default OrganizationSection;
