"use client";

import React from "react";
import {
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  TextField,
  Search,
} from "@/components/ui/Component";
import { AllEmployeeSearchBarProps } from "../types";
import { searchTextFieldSx } from "./styles";

const AllEmployeeSearchBar: React.FC<AllEmployeeSearchBarProps> = ({
  options,
  onSelect,
  loading,
  selectedId,
  placeholder,
}) => {
  const selectedValue = options.find((opt) => opt._id === selectedId) || null;

  return (
    <Autocomplete
      size="small"
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === "string") return option;
        return option?.name || "";
      }}
      isOptionEqualToValue={(option, value) => {
        if (!option || !value) return false;
        return String(option._id) === String(value._id);
      }}
      loading={loading}
      value={selectedValue}
      onChange={(_, newValue) => {
        onSelect(newValue ? newValue._id : null);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder || "Search Employee..."}
          sx={searchTextFieldSx}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                <Search
                  fontSize="small"
                  sx={{ color: "text.secondary", mr: 1 }}
                />
                {params.InputProps.startAdornment}
              </>
            ),
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option._id}>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.designation} • {option.email}
            </Typography>
          </Box>
        </Box>
      )}
      sx={{ width: "100%", maxWidth: { xs: "none", md: 300 }, minWidth: 150 }}
    />
  );
};

export default AllEmployeeSearchBar;
