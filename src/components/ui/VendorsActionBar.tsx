// Copied from UsersActionBar.tsx, replaced 'user' with 'vendor'
// ...existing code...
// Copied from UsersActionBar.tsx, replaced 'user' with 'vendor'
// ...existing code...
import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Fab,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import SearchBar from "@/components/ui/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";
import {
  VENDORS_PERMISSION_MODULE,
  SEARCH_PLACEHOLDER,
} from "@/constants/vendors";

interface VendorsActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

const VendorsActionBar: React.FC<VendorsActionBarProps> = ({
  search,
  onSearchChange,
  onAdd,
  saving,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: { xs: 2, md: 3 },
        alignItems: { xs: "stretch", md: "center" },
        mb: { xs: 1, md: 2 },
      }}
    >
      <Box sx={{ width: { xs: "100%", md: "auto" }, flex: 1 }}>
        <SearchBar
          sx={{ width: "100%", minWidth: 280 }}
          value={search}
          onChange={onSearchChange}
          placeholder={SEARCH_PLACEHOLDER}
        />
      </Box>
      {!isMobile && (
        <PermissionGuard
          module={VENDORS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => onAdd()}
            disabled={saving}
            size="large"
            sx={{
              minWidth: { xs: "auto", sm: 150 },
              height: { xs: 44, sm: 40 },
              borderRadius: 2,
              fontWeight: 600,
              fontSize: { xs: "0.875rem", sm: "1rem" },
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {saving ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Add Vendor"
            )}
          </Button>
        </PermissionGuard>
      )}
      {isMobile && (
        <PermissionGuard
          module={VENDORS_PERMISSION_MODULE}
          action="write"
          fallback={<></>}
        >
          <Fab
            color="primary"
            aria-label="add-vendor"
            onClick={() => onAdd()}
            disabled={saving}
            sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1300 }}
            size="medium"
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : <Add />}
          </Fab>
        </PermissionGuard>
      )}
    </Box>
  );
};

export default VendorsActionBar;
