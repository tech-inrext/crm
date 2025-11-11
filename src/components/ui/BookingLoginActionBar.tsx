import React from "react";
import { Box, TextField, Button } from "@mui/material";
import { Add, Search } from "@mui/icons-material";
import PermissionGuard from "@/components/PermissionGuard";
import { SEARCH_PLACEHOLDER } from "@/constants/bookingLogin";

interface BookingLoginActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

const BookingLoginActionBar: React.FC<BookingLoginActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        gap: 2,
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <TextField
        placeholder={SEARCH_PLACEHOLDER}
        value={search}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: <Search sx={{ color: "text.secondary", mr: 1 }} />,
        }}
        sx={{
          minWidth: { xs: "100%", sm: 300, md: 400 },
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
          },
        }}
        size="small"
      />
      
      <PermissionGuard module="booking-login" action="write" fallback={<></>}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAdd}
          disabled={saving}
          sx={{
            borderRadius: 2,
            minWidth: 120,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
            },
          }}
        >
          Add Booking
        </Button>
      </PermissionGuard>
    </Box>
  );
};

export default BookingLoginActionBar;