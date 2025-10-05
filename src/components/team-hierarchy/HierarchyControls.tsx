import React from "react";
import {
  Stack,
  Chip,
  Tooltip,
  Autocomplete,
  TextField,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import {
  People as PeopleIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Clear as ClearIcon,
} from "@mui/icons-material";
import { Employee } from "@/types/team-hierarchy";

interface HierarchyControlsProps {
  employees: Employee[];
  selectedManager: string | null;
  totalCount: number;
  search: string;
  loading: boolean;
  onManagerChange: (managerId: string | null) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
}

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
      sx={{ mt: { xs: 2, md: 0 }, flexWrap: "wrap" }}
    >
      <Tooltip title="Total members in this hierarchy">
        <Chip
          icon={<PeopleIcon />}
          label={`${totalCount} Members`}
          color="success"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      </Tooltip>

      <Autocomplete
        options={employees}
        getOptionLabel={(opt) => opt.name || opt.employeeProfileId || ""}
        sx={{ width: 280 }}
        value={selectedEmployee || null}
        onChange={(_, val) => onManagerChange(val?._id || null)}
        renderOption={(props, option) => (
          <Box component="li" {...props} key={option._id}>
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
          </Box>
        )}
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
        sx={{ minWidth: 240 }}
        InputProps={{
          startAdornment: (
            <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
          ),
          endAdornment: search ? (
            <IconButton
              size="small"
              onClick={() => onSearchChange("")}
              sx={{ mr: -1 }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          ) : null,
        }}
      />

      <Tooltip title="Refresh hierarchy">
        <IconButton color="primary" onClick={onRefresh} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};
