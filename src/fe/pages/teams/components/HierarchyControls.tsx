import React from "react";
import {
  Stack,
  Chip,
  Tooltip,
  Autocomplete,
  TextField,
  IconButton,
  Typography,
  People,
  Search,
  Refresh,
  Clear
} from "@/components/ui/Component";

import { Employee, HierarchyControlsProps } from "../types";
import {
  controlsStackSx,
  totalMembersChipSx,
  managerAutocompleteSx,
  searchTextFieldSx,
  searchIconSx,
  clearButtonSx,
} from "./styles";

export const HierarchyControls: React.FC<HierarchyControlsProps> = ({
  employees,
  selectedManager,
  totalCount,
  search,
  loading,
  onManagerChange,
  onSearchChange,
  onRefresh,
}) => {
  const selectedEmployee = employees.find((e) => e._id === selectedManager);

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={controlsStackSx}
    >
      <Tooltip title="Total members in this hierarchy">
        <Chip
          icon={<People />}
          label={`${totalCount} Members`}
          color="success"
          variant="filled"
          sx={totalMembersChipSx}
        />
      </Tooltip>

      <Autocomplete
        options={employees}
        getOptionLabel={(opt) => {
          if (typeof opt === 'string') return opt;
          return opt.name || opt.employeeProfileId || "";
        }}
        sx={managerAutocompleteSx}
        value={selectedEmployee || null}
        onChange={(_, val) => {
          if (typeof val === 'string' || Array.isArray(val)) return;
          onManagerChange(val?._id || null);
        }}
        renderOption={(props, option) => {
          const { key, ...otherProps } = props;
          return (
            <li key={option._id} {...otherProps}>
              <Stack spacing={0.5}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {option.name || option.employeeProfileId}
                </Typography>
                {option.designation && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    {option.designation}
                  </Typography>
                )}
              </Stack>
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField {...params} size="small" label="Select Manager" />
        )}
        isOptionEqualToValue={(a, b) => a._id === b._id}
      />

      <TextField
        size="small"
        placeholder="Search team member or role"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={searchTextFieldSx}
        InputProps={{
          startAdornment: <Search sx={searchIconSx} />,
          endAdornment: search ? (
            <IconButton
              size="small"
              onClick={() => onSearchChange("")}
              sx={clearButtonSx}
            >
              <Clear fontSize="small" />
            </IconButton>
          ) : null,
        }}
      />

      <Tooltip title="Refresh hierarchy">
        <IconButton color="primary" onClick={onRefresh} disabled={loading}>
          <Refresh />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
