import React from "react";
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Avatar,
  Chip,
} from "@mui/material";

export interface EmployeeOption {
  _id: string;
  name: string;
  email?: string;
  isSpecial?: boolean;
}

interface EmployeeAutocompleteProps {
  label: string;
  options: EmployeeOption[];
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  placeholder?: string;
}

const EmployeeAutocomplete: React.FC<EmployeeAutocompleteProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  placeholder,
}) => {
  const selectedOption = options.find((opt) => opt._id === value) || null;

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name || ""}
      value={selectedOption}
      onChange={(_event, newValue) => {
        onChange(newValue ? newValue._id : "");
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          fullWidth
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option._id}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              py: 0.5,
              gap: 1.5,
              width: "100%",
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: "0.9rem",
                bgcolor: option.isSpecial ? "primary.light" : "secondary.light",
              }}
            >
              {option.name?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {option.name}
              </Typography>
              {option.email && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  {option.email}
                </Typography>
              )}
            </Box>
            {/* {option.isSpecial && (
              <Chip
                label="System"
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.65rem" }}
              />
            )} */}
          </Box>
        </li>
      )}
      isOptionEqualToValue={(option, value) => option._id === value._id}
      noOptionsText="No matching results"
      filterOptions={(options, { inputValue }) => {
        const query = inputValue.toLowerCase();
        return options.filter(
          (opt) =>
            (opt.name || "").toLowerCase().includes(query) ||
            (opt.email || "").toLowerCase().includes(query)
        );
      }}
    />
  );
};

export default EmployeeAutocomplete;
