import React from "react";
import { Box, TextField } from "@mui/material";

interface MySearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const MySearchBar: React.FC<MySearchBarProps> = ({
  value,
  onChange,
  placeholder,
}) => (
  <Box sx={{ minWidth: 200, bgcolor: "white", borderRadius: 1 }}>
    <TextField
      size="small"
      label={placeholder || "Search"}
      value={value}
      onChange={onChange}
      inputProps={{ "aria-label": placeholder || "Search" }}
      fullWidth
    />
  </Box>
);

export default MySearchBar;
