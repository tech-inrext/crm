import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import SearchBar from "@/components/ui/SearchBar";
import PermissionGuard from "@/components/PermissionGuard";

interface RolesActionBarProps {
  search: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
  saving: boolean;
}

const RolesActionBar: React.FC<RolesActionBarProps> = ({
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
          placeholder="Search roles by name..."
        />
      </Box>
      {!isMobile && (
        <PermissionGuard module="role" action="write" fallback={<></>}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
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
              "Add Role"
            )}
          </Button>
        </PermissionGuard>
      )}
    </Box>
  );
};

export default RolesActionBar;
