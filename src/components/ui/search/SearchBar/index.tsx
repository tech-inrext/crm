import React from "react";
import { Box, TextField, SxProps, Theme } from "@mui/material";

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  sx?: SxProps<Theme>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  sx,
}) => (
  <Box sx={{ minWidth: 200, bgcolor: "white", borderRadius: 1, ...sx }}>
    <TextField
      size="small"
      placeholder={placeholder || "Search"}
      value={value}
      onChange={onChange}
      inputProps={{ "aria-label": placeholder || "Search" }}
      fullWidth
    />
  </Box>
);

export default SearchBar;
