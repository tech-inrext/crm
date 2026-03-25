import React, { forwardRef } from "react";
import { Box, TextField, SxProps, Theme, Search } from "@/components/ui/Component";

interface SearchBarProps extends React.ComponentProps<typeof TextField> {
  sx?: SxProps<Theme>;
}

const SearchBar = forwardRef<HTMLDivElement, SearchBarProps>(
  ({ sx, InputProps, ...props }, ref) => (
    <Box
      ref={ref}
      sx={{ minWidth: 200, bgcolor: "white", borderRadius: 1, ...sx }}
    >
      <TextField
        size="small"
        fullWidth
        {...props}
        InputProps={{
          ...InputProps,
          startAdornment: (
            <>
              <Search
                fontSize="small"
                sx={{ color: "text.secondary", mr: 1 }}
              />
              {InputProps?.startAdornment}
            </>
          ),
        }}
      />
    </Box>
  ),
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
